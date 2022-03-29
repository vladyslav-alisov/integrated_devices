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

export class AD805 {
  static deviceName = 'PRT Server';
  static service = '6e400091-b5a3-f393-e0a9-e50e24dcca9e';
  static characteristicNotify = '6e400093-b5a3-f393-e0a9-e50e24dcca9e';
  static characteristicWrite = '6e400092-b5a3-f393-e0a9-e50e24dcca9e';

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
        const measurement = this.convertSpo2(hexArray);
        console.log(measurement);
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
      header: parseInt(hexArray[1] + hexArray[0], 16),
      type: parseInt(hexArray[2], 16),
      heartRate: parseInt(hexArray[3], 16),
      bloodOxygen: parseInt(hexArray[4], 16),
      perfusionIndex: parseInt(hexArray[5], 16) / 10,
      batteryLevel: parseInt(hexArray[6], 16),
    };
    return result;
  }
}
