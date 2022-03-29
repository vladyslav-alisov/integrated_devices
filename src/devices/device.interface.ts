//Device Management
export interface IDevice {
  /** Device id */
  id: number;
  /** Device UUID */
  deviceUUID: string | null;
  /** Device bluetooth name */
  bluetoothName: string | null;
  /** Device Name */
  name: string | null;
  /** Services available in the device */
  services: DeviceService[];
}

export interface DeviceService {
  /** service code */
  serviceUUID: string;
  /** service description */
  description?: string;
  /** characteristics e.g.(notify, write, etc..) */
  characteristic?: {[id: string]: any};
  /** command codes */
  commands?: {[id: string]: any};
}


