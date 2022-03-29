/* eslint-disable no-bitwise */
import {Device} from 'react-native-ble-plx';
import Converters from '../../../utils/converters';
/**
 * Protocol:
 * Uses STANDART? bluetooth protocol for spo2
 * Uses Notification to transfer data
 *
 * Connection:
 * Pairing: not required
 * Connection can be established during the measurement and before the measurement
 * If finger is not in the pulseoximeter for more then 10 seconds, device will be turned off
 *
 * Measurements:
 * Device sends measurement in separate blocks during the measurement
 * Way of data receieving: stream
 *
 * Disconnect:
 * Disconnects if no activity in 10 sec
 */

export class FS20F {
  static deviceName = 'VTM 20F';
  static service = '0000ffe0-0000-1000-8000-00805f9b34fb';
  static characteristicNotify = '0000ffe4-0000-1000-8000-00805f9b34fb';
  static characteristicWrite = '0000fff2-0000-1000-8000-00805f9b34fb';

  static commandStartReceiveData = 'FE005500000000000060';

  /**
   * Puts a listener, so if command will be sent to the device or
   *  if device wants to notify about new measurement,
   *  application can receive data through callback.
   *  Data from device comes in base64 format, because of the ble-plx library
   * @param device
   */
  static setNotify = (device: Device) => {
    device.monitorCharacteristicForService(
      this.service,
      this.characteristicNotify,
      (error, result) => {
        if (error) {
          console.log(error);
          return;
        }
        const hexArray = Converters.base64ToHex(result?.value);
        console.log(hexArray);
        /**
         * Switch is to decide if it is
         *  a result data(comes after certaine amount of waveform or when measurement is done)
         *  or a waveform data(stream)
         *
         * TODO: request documentation again, it seems like data convertion is not correct in the docs
         * Also "write" operation's UUID in docs is different from device's one.
         *
         */
        switch (hexArray[2]) {
          case '55':
            const resultData = this.convertSpo2(hexArray);
            console.log(JSON.stringify(resultData));
            break;
          case '56':
            const stream = this.convertSpo2Waveform(hexArray);
            console.log(JSON.stringify(stream));
            break;
        }
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

  static convertSpo2(hexArray: string[]) {
    const result = {
      header: parseInt(hexArray[0], 16),
      packageLenght: parseInt(hexArray[1], 16),
      command: parseInt(hexArray[2], 16),
      pulseRate: parseInt(hexArray[3] + hexArray[4], 16),
      bloodOxygenLevel: parseInt(hexArray[5], 16),
      perfusionIndex: parseInt(hexArray[6] + hexArray[7], 16) / 1000,
      packetSN: parseInt(hexArray[8], 16),
      checkSum: parseInt(hexArray[9], 16),
    };
    return result;
  }
  static convertSpo2Waveform(hexArray: string[]) {
    const result = {
      header: parseInt(hexArray[0], 16),
      packageLenght: parseInt(hexArray[1], 16),
      command: parseInt(hexArray[2], 16),
      pulseWave: parseInt(hexArray[3], 16),
      bloodOxygenLevel: this.convertDataCharacteristic(
        parseInt(hexArray[4], 16).toString(2),
      ),
    };
    return result;
  }

  private static convertDataCharacteristic(binaryData: string) {
    console.log(binaryData);
    return {
      hasPulse: binaryData[0] === '0' ? true : false,
      isLeadOff: binaryData[1] === '0' ? true : false,
      isMovementInterference: binaryData[2] === '1' ? true : false,
      isNormalPerfusion: binaryData[3] === '0' ? true : false,
    };
  }
}
