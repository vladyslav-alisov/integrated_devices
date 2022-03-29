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
 * Way of data receieving: collection
 * Device sends measurement in separate blocks
 * Device has 2 users
 * Convertion for blood pressure measurements is different from other beurer device we integrated
 *
 * Disconnect:
 * Disconnects after data has been received
 */

export class BM96 {
  static deviceName = 'BM96';
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
    const result = {
      header: parseInt(hexArray[0], 16),
      systolic: parseInt(hexArray[2][1] + hexArray[1], 16) / 10,
      diastolic: parseInt(hexArray[4][1] + hexArray[3], 16) / 10,
      meanArterialPressure: parseInt(hexArray[6][1] + hexArray[5], 16) / 10,
      timestamp: `${parseInt(
        hexArray[8] + hexArray[7],
        16,
      )}-${Converters.addZero(
        parseInt(hexArray[9], 16).toString(),
      )}-${Converters.addZero(
        parseInt(hexArray[10], 16).toString(),
      )} ${Converters.addZero(
        parseInt(hexArray[11], 16).toString(),
      )}:${Converters.addZero(
        parseInt(hexArray[12], 16).toString(),
      )}:${Converters.addZero(parseInt(hexArray[13], 16).toString())}`,
      pulseRate: parseInt(hexArray[15][1] + hexArray[14], 16) / 10,
      userID: parseInt(hexArray[16], 16),
    };

    return result;
  };
}
