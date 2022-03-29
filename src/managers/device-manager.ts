import AsyncStorage from '@react-native-async-storage/async-storage';
import {BleManager, Device} from 'react-native-ble-plx';
import ActimiDevice from '../types/device';

export default class DeviceManager {
  AsyncStorageDevices = 'Device List';

  currentDevice: ActimiDevice | undefined = undefined;

  private _bleManager: BleManager;

  private _savedDevices: Device[] = [];

  constructor(bleManager: BleManager, savedDevices: Device[]) {
    this._bleManager = bleManager;
    this._savedDevices = savedDevices;
  }

  // returns all saved devices
  public getSavedDevices(): Device[] {
    return this._savedDevices;
  }

  // updates list of the saved devices in instance and in memory storage
  public async addNewDevice(device: Device): Promise<Device[]> {
    console.log(device);

    this._savedDevices.forEach(e => {
      if (e.id === device.id) {
        throw Error('Device is already saved');
      }
    });
    this._savedDevices.push(device);
    await AsyncStorage.setItem(
      this.AsyncStorageDevices,
      JSON.stringify(this._savedDevices),
    );
    return this._savedDevices;
  }

  // removes previously saved device from the list in instance and from memory storage
  public async removeSavedDevice(actimiDevice: Device): Promise<Device[]> {
    for (let i = 0; i < this._savedDevices.length; i += 1) {
      if (this._savedDevices[i].id === actimiDevice.id) {
        this._savedDevices.splice(i, 1);
      }
    }
    await AsyncStorage.setItem(
      this.AsyncStorageDevices,
      JSON.stringify(this._savedDevices),
    );
    return this._savedDevices;
  }
}
