import {BleManager} from 'react-native-ble-plx';
import MeasurementTypeKey from '../enums/measurement-type-keys';
import Converters from '../utils/converters';
import {IDevice, DeviceService} from './device.interface';

export class DeviceController {
  /** Save device */
  device: IDevice;
  /** Bluetooth Manager to interact with device */
  bleManager: BleManager;
  /** Measure type to find correct service */
  measureType: string = 'Blood Pressure Service';
  /** Service for specific measure type */
  service: DeviceService;

  constructor(device: IDevice, bleManager: BleManager) {
    console.log("device: " +JSON.stringify(device));
    this.device = device;
    console.log("device: " +JSON.stringify(this.device));
    console.log('0');
    this.service = this.getMeasurementService();
    console.log('1');
    this.bleManager = bleManager;
    console.log('2');
  }

  /**
   * Method iterates through services of the device and returns
   * the service according to the @measureType
   * If no service found on the device for given @measureType , error will
   * be thrown
   * @returns UUID of the service according to the measurement type
   */
  private getMeasurementService(): DeviceService {
    const service = this.device.services.find(e => e.description === this.measureType);
    console.log(JSON.stringify(service));
    if (service === undefined) {
      throw new Error(
        `No service found for measuring ${this.measureType} on device ${this.device.name}`,
      );
    }
    return service;
  }

  async startCollect() {
    this.bleManager.monitorCharacteristicForDevice(
      this.device.deviceUUID ?? '',
      this.service.serviceUUID,
      this.service.characteristic?.notifyUUID,
      (error, result) => {
        if (error) {
          console.log(error);
          throw new Error(error.message);
        }
        const hexArray = Converters.base64ToHex(result?.value);
        console.log(hexArray);
      },
    );
    await this.bleManager.writeCharacteristicWithResponseForDevice(
      this.device.deviceUUID ?? '',
      this.service.serviceUUID,
      this.service.characteristic?.writeUUID,
      this.service.commands?.startMeasurement,
    );
  }
}
