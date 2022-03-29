import {Device, BleManager} from 'react-native-ble-plx';
import MeasurementTypeKey from '../enums/measurement-type-keys';
import Converters from '../utils/converters';
import {
  IntegratedDevices,
  integratedDevices,
} from '../utils/integrated-devices';

export default class ActimiDevice {
  device: Device;

  private _measurementTypes: MeasurementTypeKey[] = [];

  private _autoCollect = false;

  private _isKnownDevice = true;

  private bleManager: BleManager;

  get measurementTypes(): MeasurementTypeKey[] {
    return this._measurementTypes;
  }

  get isKnownDevice(): boolean {
    return this._isKnownDevice;
  }

  get autoCollect(): boolean {
    return this._autoCollect;
  }

  set autoCollect(newValue: boolean) {
    this._autoCollect = newValue;
  }

  // In constructor we check if device is integrated.
  // If it is integrated we should add measurement type which device supports.
  constructor(device: Device, bleManager: BleManager) {
    this.bleManager = bleManager;
    this.device = device;

    console.log('comes here ');
    console.log(device);
    if (device.name) {
      const isIntegrated = Object.values<string>(IntegratedDevices).includes(
        device.name,
      );
      if (isIntegrated) {
        integratedDevices.forEach((availableMeasureTypes, deviceName) => {
          if (deviceName === device.name) {
            availableMeasureTypes.forEach(e => this._measurementTypes.push(e));
          }
        });
      } else {
        this._isKnownDevice = false;
        this._measurementTypes = [];
      }
    }
  }

  // TODO:
  // create map for different device's services and characteristics UUIDs to receive battery level
  // (mostly they are same, however Viatom has different logic to retreieve battery level)
  // generic method to receive battery level.
  // should be used after connection and before using "write","notify" and "indicate" to
  // force device to send pairing request.
  // (In case of "indicate" bluetooth operation, device dont send
  // pairing request and indication fails)
  public readBatteryLevel = async (): Promise<number | null> => {
    let result = null;
    try {
      const batteryLevel = await this.bleManager.readCharacteristicForDevice(
        this.device.id,
        '0000180f-0000-1000-8000-00805f9b34fb',
        '00002a19-0000-1000-8000-00805f9b34fb',
      );
      const convertedResult = Converters.base64ToHex(batteryLevel.value);

      result = parseInt(convertedResult[0], 16);
    } catch (error) {
      throw new Error('Read battery level error');
    }
    return result;
  };

  public async connectToDevice(): Promise<void> {
    await this.bleManager.connectToDevice(this.device.id);
    await this.bleManager.discoverAllServicesAndCharacteristicsForDevice(
      this.device.id,
    );
  }
  // to disconnect from the device
  public async disconnectFromDevice(actimiDevice: ActimiDevice): Promise<void> {
    await this.bleManager.cancelDeviceConnection(actimiDevice.device.id);
  }
  //for developers
  public async getCharsAndServices(): Promise<void> {
    const services = await this.device.services();
    services.forEach(async service => {
      console.log('Service: ' + service.uuid);
      const characteristics = await this.device.characteristicsForService(
        service.uuid,
      );
      characteristics.forEach(e => {
        console.log('Characteristic: ' + e.uuid);
      });
    });
  }
}
