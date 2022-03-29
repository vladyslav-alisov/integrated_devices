import AsyncStorage from '@react-native-async-storage/async-storage';
import {BleError, BleManager, Device, ScanMode} from 'react-native-ble-plx';
import {AsyncStorageDevices} from './consts';
import { DeviceController } from './device-controller';
import {IDevice} from './device.interface';
import {integratedDevices} from './integrated-devices';

export class DeviceManager {
  /** Bluetooth Manager */
  bleManager: BleManager;
  /** Instance of the DeviceManager */
  private static instance: DeviceManager | undefined;
  /** Devices which are added previously and being kept in AsyncStorage */
  _savedDevices: IDevice[] = [];
  /** Devices which are currently connected */
  connectedDevices: IDevice[] = [];
  counter = 0;

  private constructor(bleManager: BleManager, savedDevices: IDevice[]) {
    this.bleManager = bleManager;
    savedDevices.forEach(e => this._savedDevices.push(e));
  }

  /** @returns List of available devices to add */
  get savedDevices() {
    return this._savedDevices;
  }

  ///////////////////////////////////ADDING NEW DEVICE///////////////////////////////////
  /**
   * Used to initialize instance of the DeviceManager with BleManager instance
   * and load saved devices from AsyncStorage
   * @param bleManager
   * @returns Instance of the @DeviceManager
   */
  public static initDeviceManager = async (
    bleManager: BleManager,
  ): Promise<DeviceManager> => {
    if (!DeviceManager.instance) {
      let tempArray: IDevice[] = [];
      const storageValue = await AsyncStorage.getItem(AsyncStorageDevices);
      console.log(storageValue);
      if (storageValue) {
        tempArray = JSON.parse(storageValue);
        console.log(tempArray);
      }
      DeviceManager.instance = new DeviceManager(bleManager, tempArray);
      console.log('initialization finilized');
    }
    return DeviceManager.instance;
  };

  /**
   * Scans for new devices
   * @param onDeviceFound callback will return new found devices
   * Already saved devices will not be returned through callback
   * @param onError will return BleError object, if error will occur
   */
  scanForNewDevices(
    onDeviceFound: (newDevice: Device) => void,
    onError: (error: BleError) => void,
  ): void {
    this.bleManager.startDeviceScan(
      null,
      {allowDuplicates: false,scanMode: ScanMode.LowPower},
      (error, device) => {
        console.log(`{id:${device?.id},name:${device?.name}}`);
        if (error) {
          onError(error);
          this.bleManager.stopDeviceScan();
        }
        const isSaved = this._savedDevices.some(
          e => e.deviceUUID === device?.id,
        );
        if (isSaved === false && device?.name !== null) {
          if (device) {
            onDeviceFound(device);
          }
        }
      },
    );
  }

  /**
   * To manually stop scan of the devices
   */
  stopScan(): void {
    this.bleManager.stopDeviceScan();
  }

  /**
   * Method to add found devices to the async storage
   * Before it is needed to launch @var scanForDevices
   * in order to add devices
   * @param device
   */
  async saveNewDevice(
    device: Device,
    onSave?: (savedDevice: IDevice) => void,
  ): Promise<IDevice> {
    const integrateDeviceModel = integratedDevices.find(
      integratedDevice => integratedDevice.bluetoothName === device.name,
    );
    console.log('integrateDeviceModel to save: ' + JSON.stringify(integrateDeviceModel));
    if (!integrateDeviceModel) {
      throw new Error(`SDK does not support device "${device.name}"`);
    }
    integrateDeviceModel.deviceUUID = device.id;
    console.log(
      'integrateDeviceModel to save with uuid: ' + integrateDeviceModel.deviceUUID,
    );
    this._savedDevices.push(integrateDeviceModel);
    await AsyncStorage.setItem(
      AsyncStorageDevices,
      JSON.stringify(this._savedDevices),
    );
    if (onSave) {
      onSave(integrateDeviceModel);
    }
    return integrateDeviceModel;
  }

  ///////////////////////////////////AUTOCONNECTING TO SAVED DEVICES///////////////////////////////////

  startScanForSavedDevices(
    onDeviceConnected: (device: IDevice) => void,
    onDeviceDisconnected: (device: IDevice) => void,
    onError: (error: BleError) => void,
  ) {
    if (this._savedDevices.length === 0) {
      throw new Error('No saved devices found');
    }
    this.bleManager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        onError(error);
        this.bleManager.stopDeviceScan();
      }
      const foundDevice = this._savedDevices.find(
        savedDevice => savedDevice.bluetoothName === device?.name,
      );
      if (foundDevice?.deviceUUID) {
        this.bleManager.stopDeviceScan();
        try {
          await this.bleManager.connectToDevice(foundDevice?.deviceUUID);
          await this.bleManager.discoverAllServicesAndCharacteristicsForDevice(
            foundDevice.deviceUUID,
          );
          this.bleManager.onDeviceDisconnected(foundDevice.deviceUUID, () => {
            onDeviceDisconnected(foundDevice);
          });
          onDeviceConnected(foundDevice);
          const deviceController = new DeviceController(foundDevice,this.bleManager);
          await deviceController.startCollect();          
        } catch (er) {
          onError(er as BleError);
        }
      }
    });
  }
}
