/* eslint-disable no-bitwise */
import {Device} from 'react-native-ble-plx';
import Converters from '../../../utils/converters';
/**
 * Protocol:
 * Uses STANDART bluetooth protocol for blood pressure
 * Uses Indication to transfer data
 *
 * Connection:
 * Pairing: required

 * Connection can be established after measurement is done or when user opens record menu
 *
 * Measurements:
 * Device sends measurement in separate blocks
 * Way of data receieving: collection

 * Device has 2 users
 *
 * Disconnect:
 * Disconnects after data has been received
 */

export class BM54 {
  static deviceName = 'BM54';
  static service = '00001810-0000-1000-8000-00805f9b34fb';
  static characteristicNotify = '00002a35-0000-1000-8000-00805f9b34fb';
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
        const measurement = this.convertBloodPressure(hexArray);
        console.log(JSON.stringify(measurement));
      },
    );
  };

  static convertBloodPressure = (hexArray: string[]) => {
    const result = [];
    for (let i = 0; i + 19 <= hexArray.length; i += 19) {
      const notification = {
        header: parseInt(hexArray[i], 16),
        systolic: parseInt(hexArray[i + 2] + hexArray[i + 1], 16),
        diastolic: parseInt(hexArray[i + 4] + hexArray[i + 3], 16),
        meanArterialPressure: parseInt(hexArray[i + 5], 16),
        timestamp: `${parseInt(
          hexArray[i + 8] + hexArray[i + 7],
          16,
        )}-${Converters.addZero(
          parseInt(hexArray[i + 9], 16).toString(),
        )}-${Converters.addZero(
          parseInt(hexArray[i + 10], 16).toString(),
        )} ${Converters.addZero(
          parseInt(hexArray[i + 11], 16).toString(),
        )}:${Converters.addZero(
          parseInt(hexArray[i + 12], 16).toString(),
        )}:${Converters.addZero(parseInt(hexArray[i + 13], 16).toString())}`,
        pulseRate: parseInt(hexArray[i + 15] + hexArray[i + 14], 16),
        userID: parseInt(hexArray[i + 16], 16),
      };
      result.push(notification);
    }

    return result;
  };
}
