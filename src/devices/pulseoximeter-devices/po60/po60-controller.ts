ex; /* eslint-disable no-bitwise */
import {Device} from 'react-native-ble-plx';
import Converters from '../../../utils/converters';
/**
 * Protocol:
 * Uses STANDART? bluetooth protocol for spo2
 * Uses Notification to transfer data
 *
 * Connection:
 * Pairing: required
 * Connection can be established during the measurement and before the measurement
 * If finger is not in the pulseoximeter for more then 10 seconds, device will be turned off
 *
 * Measurements:
 * Device sends several measurements in one big block, so it needs to be filtered
 * Way of data receieving: collection
 *
 * Disconnect:
 * Disconnects if no activity in 10 sec
 */

export class PO60 {
  static deviceName = 'PO60';
  static service = '0000ff12-0000-1000-8000-00805f9b34fb';
  static characteristicNotify = '0000ff02-0000-1000-8000-00805f9b34fb';
  static characteristicWrite = '0000ff01-0000-1000-8000-00805f9b34fb';

  static commandGetStorageInfo = '900515';
  static commandStartReceiveMeasurements = '990019';
  static commandSendNextMeasurementGroup = '99011a';
  static commandDeleteAllMeasruments = '997F18';
  /**
   * Puts a listener, so if command will be sent to the device or
   *  if device wants to notify about new measurement,
   *  application can receive data through callback.
   *  Data from device comes in base64 format, because of the ble-plx library
   * @param device
   */

  static setNotify = (device: Device) => {
    let totalBytesWillReceive: number;
    let tempArray: string[];
    device.monitorCharacteristicForService(
      this.service,
      this.characteristicNotify,
      (error, result) => {
        if (error) {
          console.log(error);
          return;
        }
        const hexArray = Converters.base64ToHex(result?.value);
        switch (hexArray[0]) {
          /**
           * When storage data is being received, we should calculate amount of bytes, which will be delivered,
           * unfortunately, measurements are not coming separately. So, we can't just
           */
          case 'E0':
            totalBytesWillReceive = parseInt(hexArray[2], 16) * 24;
            break;

            
          case 'E9':
            if (totalBytesWillReceive === 0) {
              console.log('No measurements');
            } 
            else {
              tempArray = tempArray.concat(hexArray);
              // if (totalBytesWillReceive === null) {
              //   /**
              //    * This case appears when command getStorageInfo havent been sent, before receiving measurements
              //    * So we dont know how many measurement will be received
              //    */
              //   return;
              // }
              if (totalBytesWillReceive !== null) {
                if (
                  tempArray.length % 200 === 0 &&
                  tempArray.length < totalBytesWillReceive
                ) {
                  /**
                   * This case appears when havent received all measurements
                   * So we need to send command to receive next package
                   */
                  setTimeout(
                    async () =>
                      await this.sendCommand(
                        device,
                        this.commandSendNextMeasurementGroup,
                      ),
                    100,
                  );
                } else if (tempArray.length === totalBytesWillReceive) {
                  /**
                   * When all measurements have been received, it is possible
                   * to identify the last measurement: package number of the last measurement will be more then 9
                   */

                  const results = this.convertSpo2(tempArray);
                  results.forEach(e =>
                    e.packetNumber > 9
                      ? console.log(`last measurement: ${JSON.stringify(e)}`)
                      : null,
                  );
                }
              }
            }
        }
        console.log(hexArray);
      },
    );
  };

  /**
   * Method to send data to the device.
   * @param device Which will receive data
   * @param command string of the hexadecimal values, joined together
   */
  static sendCommand = async (device: Device, command: string) => {
    await device.writeCharacteristicWithoutResponseForService(
      this.service,
      this.characteristicWrite,
      Converters.hexToBase64(command),
    );
  };

  static convertStorageInfo = (hexArray: string[]) => {
    const result = {
      header: hexArray[0],
      dataType: hexArray[1].toString(),
      totalCapacity: hexArray[3] + hexArray[2],
      unreadData: hexArray[4], //doesnt work
      checksum: hexArray[5].toString(),
    };
    return result;
  };

  /**
   * Device sends measurements joined together
   * Maximum size of the msg which can be transmitted through ble is 20 bytes.
   * That is the reason manufacturer could not fit all data about one measurement in one msg,
   * consequently it is required to split measurements manually.
   * @param hexArray array of all measurement collected from device
   * @returns array of measurements
   */
  static convertSpo2(hexArray: string[]) {
    const result = [];
    let i: number;
    if (hexArray.length > 23) {
      for (i = 0; i + 24 <= hexArray.length; i = i + 24) {
        const notification = {
          header: hexArray[i],
          packetNumber: parseInt(hexArray[i + 1], 16),
          startMeasureDate: `${hexArray[i + 2]}-${hexArray[i + 3]}-${
            hexArray[i + 4]
          } ${Converters.addZero(
            hexArray[i + 5].toString(),
          )}:${Converters.addZero(
            hexArray[i + 6].toString(),
          )}:${Converters.addZero(hexArray[i + 7].toString())}`,
          endMeasureDate: `${hexArray[i + 8]}-${hexArray[i + 9]}-${
            hexArray[i + 10]
          } ${Converters.addZero(
            hexArray[i + 11].toString(),
          )}:${Converters.addZero(
            hexArray[i + 12].toString(),
          )}:${Converters.addZero(hexArray[i + 13].toString())}`,
          msbOfPr: hexArray[i + 14].toString(),
          storageTime: `${hexArray[i + 15]}-${hexArray[i + 16]}`,
          spo2max: hexArray[i + 17],
          spo2min: hexArray[i + 18],
          spo2avg: hexArray[i + 19],
          prmin: hexArray[i + 20],
          prmax: hexArray[i + 21],
          pravg: hexArray[i + 22],
          checksum: hexArray[i + 23].toString(),
        };
        result.push(notification);
      }
      hexArray = [];
    }
    return result;
  }
}
