import {Device} from 'react-native-ble-plx';
import Converters from '../../../utils/converters';
/**
 * Protocol:
 * Uses CUSTOM bluetooth protocol for blood pressure
 * Uses Notification to transfer data
 *
 * Connection:
 * Pairing: not required

 * Connection can be established any time (before, during and after measurement)
 *
 * Measurements:
 * Way of data receieving: stream
 * Device sends measurement in separate blocks
 * Device has 1 user
 *
 * Disconnect:
 * Disconnects after data has been received
 *
 * CRC calculation:
 * At the end of each massage we send or receive last byte means CRC8-MAXIM calculation.
 * It is there to check if there are correct bytes being received/sent.
 */

export class PC102 {
  static deviceName = 'PC102';
  static service = '0000fff0-0000-1000-8000-00805f9b34fb';
  static characteristicNotify = '0000fff1-0000-1000-8000-00805f9b34fb';
  static characteristicWrite = '0000fff2-0000-1000-8000-00805f9b34fb';

  static commandGetId = 'aa55FF0201CA';
  static commandBattery = 'aa55FF0204F5';

  /**
   * Measurement related commands
   */
  static commandStartMeasurement = 'aa5540020129';
  static commandStopMeasurement = 'aa55400202CB';

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
        //console.log(hexArray);
        switch (hexArray[2]) {
          //Stream data during measurement
          case '42':
            console.log(
              JSON.stringify(this.convertBloodPressureStream(hexArray)),
            );
            break;
          //Result after measurement is finished
          case '43':
            //if error. Indicated by 4th index.
            if (hexArray[4] === '02') {
              console.log(this.convertError(hexArray[5]));
              return;
            }
            console.log(JSON.stringify(this.convertBloodPressure(hexArray)));
            break;
          default:
        }
        // const measurement = this.convertBloodPressure(hexArray);
        // console.log(JSON.stringify(measurement));
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

  /**
   * There are 2 types of result from device.Type is represented on index 2
   * 0x42 during measurement
   * 0x43 measurement result
   *
   * @param hexArray
   */
  static convertBloodPressure = (hexArray: string[]) => {
    const result = {
      header: parseInt(hexArray[1], 16) + parseInt(hexArray[0], 16),
      token: parseInt(hexArray[2], 16),
      length: parseInt(hexArray[3], 16),
      type: parseInt(hexArray[4], 16),
      systolic: parseInt(hexArray[6], 16),
      map: parseInt(hexArray[7], 16),
      diastolic: parseInt(hexArray[8], 16),
      pulse: parseInt(hexArray[9], 16),
    };
    return result;
  };
  static convertBloodPressureStream = (hexArray: string[]) => {
    const result = {
      header: parseInt(hexArray[1], 16) + parseInt(hexArray[0], 16),
      token: parseInt(hexArray[2], 16),
      length: parseInt(hexArray[3], 16),
      type: parseInt(hexArray[4], 16),
      cuffPressure: parseInt(hexArray[5][1] + hexArray[6], 16),
      hasPulse: parseInt(hexArray[5][0], 16) === 0 ? false : true,
    };
    return result;
  };

  static convertError = (errorHex: string) => {
    const binaryError = parseInt(errorHex, 16).toString(2);
    const errorFlag = parseInt(binaryError[7], 16);
    const errorValue = parseInt(binaryError.slice(0, 7), 2);
    if (isNaN(errorFlag)) {
      switch (errorValue) {
        case 1:
          return 'Air inflation is less than 30mmHg within 7 seconds(Pressure cuff is not tied well)';
        case 2:
          return 'The pressure of the cuff is more than 295mmHg, enter overpressure protection';
        case 3:
          return 'Effective pulse rate can’t be measured.';
        case 4:
          return 'Intervene(Move and speak during the measurement)';
        case 5:
          return 'Measurement result value is error';
        case 6:
          return 'Gas leakage';
        case 14:
          return 'Low power and out of service temporarily.';
        default:
          return 'Unknown Error';
      }
    } else {
      switch (errorValue) {
        case 1:
          return 'Air inflation is less than 30mmHg within 7 seconds(pressure cuff is not tied well)';
        case 2:
          return 'The pressure of the cuff is more than 295mmHg, enter overpressure protection';
        case 3:
          return 'Effective pulse rate can’t be measured.';
        case 4:
          return 'Intervene(Move and speak during the measurement)';
        case 5:
          return 'Measurement result value is error';
        default:
          return 'Unknown Error';
      }
    }
  };
}
