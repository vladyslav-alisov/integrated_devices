import AsyncStorage from '@react-native-async-storage/async-storage';
import {BleManager, Device} from 'react-native-ble-plx';
import Scanner from './managers/scanner';
import DeviceManager from './managers/device-manager';

export default class ActimiDeviceKit {
  private static instance: ActimiDeviceKit;

  private _savedDevices: Device[] = [];

  private _deviceManager: DeviceManager;

  private _scanner: Scanner;

  //private _collector: Collector;

  private _bleManager: BleManager;

  private constructor(savedDevices: Device[]) {
    this._bleManager = new BleManager();
    savedDevices.forEach(e => this._savedDevices.push(e));
    this._deviceManager = new DeviceManager(
      this._bleManager,
      this._savedDevices,
    );
    this._scanner = new Scanner(this._bleManager);
    //this._collector = new Collector(this._bleManager, this._savedDevices);
  }

  // returns instance and loads devices from memory when instance is being initialized
  public static initializeDeviceKit = async (): Promise<ActimiDeviceKit> => {
    if (!ActimiDeviceKit.instance) {
      let tempArray: Device[] = [];
      const storageValue = await AsyncStorage.getItem('Device List');
      if (storageValue) {
        tempArray = JSON.parse(storageValue);
      }
      ActimiDeviceKit.instance = new ActimiDeviceKit(tempArray);
      console.log('initialization finilized');
    }
    return ActimiDeviceKit.instance;
  };

  public static getDeviceKit = () => {
    if (!ActimiDeviceKit.instance) {
      throw Error('Device Kit has not been initialized');
    }
    return ActimiDeviceKit.instance;
  };
  public getScanner = () => {
    if (ActimiDeviceKit.instance === undefined) {
      throw Error('Device Kit has not been initialized');
    }
    return this._scanner;
  };

  public getDeviceManager = () => {
    if (ActimiDeviceKit.instance === undefined) {
      throw Error('Device Kit has not been initialized');
    }
    return this._deviceManager;
  };

  public getBleManager = () => {
    return this._bleManager;
  };
  // public getCollector = () => {
  //   if (ActimiDeviceKit.instance === undefined) {
  //     throw 'Device Kit has not been initialized';
  //   }
  //   return this._collector;
  // };
}
