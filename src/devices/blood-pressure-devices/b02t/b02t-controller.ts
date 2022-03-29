/* eslint-disable no-bitwise */
import {Device} from 'react-native-ble-plx';
import Converters from '../../../utils/converters';

/**
 * Protocol:
 * Uses CUSTOM bluetooth protocol for blood pressure
 * Uses notification to receive data
 *
 * Connection:
 * Pairing: not required
 * Connection can be established after measurement is done or when user opens record menu
 *
 * Measurements:
 * Way of data receieving: collection and stream

 * Device sends measurement in separate blocks
 * Device can last measurement
 * Device can send info about measurement during the measurement
 * Device can send all records
 * Device has 2 users
 *
 * Disconnect:
 * Disconnects after data has been received
 */

export class B02T {
  static deviceName = 'BPM-188';
  static service = '000018f0-0000-1000-8000-00805f9b34fb';
  static characteristicNotify = '00002af0-0000-1000-8000-00805f9b34fb';
  static characteristicWrite = '00002af1-0000-1000-8000-00805f9b34fb';

  static commandStartMeasurement = '0240dc01a13c';
  static commandDataOfMeasurementOver = '0240dc01a23f';
  static commandGetBPMonitorSoftwareVersionNumber = '0240dc01ab36';
  static commandGetHistoricalData = '0240dc05B1000100022b';
  static commandGetCurrentModeStatusOfBP = '0240dc01B22F';
  static commandToSetTime = '0240dc07B0';

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
        // if (hexArray.length === 20) {
        //   //console.log(JSON.stringify(this.convertBloodPressure(hexArray)));
        // }
      },
    );
  };

  /**
   * Method to send data to the device.
   * @param device Which will receive data
   * @param command string of the hexadecimal values, joined together
   */
  static sendCommand = async (device: Device, command: string) => {
    await device.writeCharacteristicWithResponseForService(
      this.service,
      this.characteristicWrite,
      Converters.hexToBase64(command),
    );
  };
  /**
   * TODO: Check month and day again, it seems like they are wrong
   * Method to set device's current time, so measurements have correct time
   * @param device
   */
  static setCurrentTime = async (device: Device) => {
    const dateTime = new Date();
    const currentTime: string[] = [
      (dateTime.getFullYear() - 2000).toString(16),
      dateTime.getMonth().toString(16),
      dateTime.getDay().toString(16),
      dateTime.getHours().toString(16),
      dateTime.getMinutes().toString(16),
      dateTime.getSeconds().toString(16),
    ];

    for (let i = 0; i < currentTime.length; i++) {
      currentTime[i] = Converters.addZero(currentTime[i]);
    }

    const xor = this.calculateXOR(currentTime);

    console.log(
      'command to send: ' + this.commandToSetTime + currentTime.join('') + xor,
    );
    await device.writeCharacteristicWithResponseForService(
      this.service,
      this.characteristicWrite,
      Converters.hexToBase64(
        this.commandToSetTime + currentTime.join('') + xor,
      ),
    );
  };

  /**
   * When device receives commands, it needs to check if non of the bytes is lost during transmission.
   * Calculates XOR of all values to send data to device.
   * @param hexArray
   * @returns Calculated value after XOR operation
   */
  private static calculateXOR = (hexArray: string[]): string => {
    const temp = ['02', '40', 'dc', '07', 'B0'].concat(hexArray);
    console.log(temp);
    let resultInt: number = parseInt(temp[0], 16);
    for (let i = 0; i < temp.length; i++) {
      resultInt = resultInt ^ parseInt(temp[i], 16);
    }
    return resultInt.toString(16);
  };

  /**
   * After measurement, device sends data, which contains information about measurement.
   * Following method converts array of hexadecimal values to an object with info about measurement.
   * @param hexArray
   * @returns object with data
   */
  private static convertBloodPressure = (hexArray: string[]) => {
    const result = {
      header: parseInt(hexArray[0], 16),
      deviceName: parseInt(hexArray[1], 16),
      command: parseInt(hexArray[2], 16),
      lenght: parseInt(hexArray[3], 16),
      flagBit: parseInt(hexArray[4], 16),
      systolic: parseInt(hexArray[6] + hexArray[5], 16),
      diastolic: parseInt(hexArray[8] + hexArray[7], 16),
      isIrregularHeartRate: parseInt(hexArray[9], 16) === 0 ? false : true,
      heartRate: parseInt(hexArray[10], 16),
      userID: parseInt(hexArray[11], 16),
      highDataNumber: parseInt(hexArray[12], 16), //error
      lowDataNumber: parseInt(hexArray[13], 16),
      year: parseInt(hexArray[14], 16),
      month: parseInt(hexArray[15], 16),
      day: parseInt(hexArray[16], 16),
      hour: parseInt(hexArray[17], 16),
      minute: parseInt(hexArray[18], 16),
    };
    return result;
  };
  /**
   * During the measurement, device sends data to the application,
   *  so current pressure of the cuff can be displayed.
   * @param hexArray
   * @returns
   */
  private static convertBloodPressureStream = (hexArray: string[]) => {
    const result = {
      header: parseInt(hexArray[0], 16),
      deviceName: parseInt(hexArray[1], 16),
      command: parseInt(hexArray[2], 16),
      lenght: parseInt(hexArray[3], 16),
      pressure: parseInt(hexArray[5] + hexArray[4], 16),
    };
    return result;
  };

  /**
   * When we send command to set a time to device, device returns set time of the device
   * @param hexArray
   * @returns
   */
  private static convertTime = (hexArray: string[]) => {
    const result = {
      header: parseInt(hexArray[0], 16),
      deviceName: parseInt(hexArray[1], 16),
      command: parseInt(hexArray[2], 16),
      lenght: parseInt(hexArray[3], 16),
      flagBit: parseInt(hexArray[4], 16),
      year: parseInt(hexArray[5], 16),
      month: parseInt(hexArray[6], 16),
      day: parseInt(hexArray[7], 16),
      hour: parseInt(hexArray[8], 16),
      minute: parseInt(hexArray[9], 16),
      seconds: parseInt(hexArray[10], 16),
    };
    return result;
  };
}
