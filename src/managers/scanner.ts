import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager, Device, State} from 'react-native-ble-plx';

export default class Scanner {
  private _bleManager: BleManager;

  constructor(bleManager: BleManager) {
    this._bleManager = bleManager;
  }

  // starts device scan and retreieves found devices through callback
  public async startScan(
    onError: (error: string) => void,
    onNewDeviceFound: (newDevice: Device) => void,
  ): Promise<void> {
    try {
      await this.checkBleConfig(this._bleManager);
    } catch (error) {
      onError(error as string);
    }
    this._bleManager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        this.stopScan();
        onError(error.message);
        return;
      }
      if (device !== null) {
        console.log(device.name);
        onNewDeviceFound(device);
      }
    });
  }

  // stops device scan
  public stopScan(): void {
    this._bleManager.stopDeviceScan();
  }

  checkBleConfig = async (bleManager: BleManager): Promise<boolean> => {
    let isGranted = false;
    if (Platform.OS === 'android') {
      isGranted = await this.requestLocationPermission();
    }
    //add other statuses for ble, otherwise e.g. it asks to open ble, when ble is loading
    if (isGranted || Platform.OS === 'ios') {
      const bleState = await bleManager.state();
      if (bleState === State.PoweredOn) {
        return true;
      } else {
        throw new Error('Please, activate your bluetooth');
      }
    } else {
      throw new Error(
        'Please, give a location permission. Otherwise, bluetooth connection is not possible.',
      );
    }
  };
  private requestLocationPermission = async (): Promise<boolean> => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission for Bluetooth',
          message: 'Requirement for Bluetooth',
          buttonNeutral: 'Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };
}
