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

export class PC60FW {
  static deviceName = 'PC-60FW';
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
        switch(hexArray[4]){
          case '02':
            console.log("waveform");
            break;
          case '01':
            console.log('result');
            break;
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

  // static convertSpo2(hexArray: string[]) {}
  // static convertSpo2Waveform(hexArray: string[]) {}

  // private static convertDataCharacteristic(binaryData: string) {}
}
