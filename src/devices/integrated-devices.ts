import {IDevice} from './device.interface';

export const integratedDevices: IDevice[] = [
  {
    id: 1,
    deviceUUID: null,
    name: 'BPM-188',
    bluetoothName: 'BPM-188',
    services: [
      {
        serviceUUID: '000018f0-0000-1000-8000-00805f9b34fb',
        description: 'Blood Pressure Service',
        characteristic: {
          notifyUUID: '00002af0-0000-1000-8000-00805f9b34fb',
          writeUUID: '00002af1-0000-1000-8000-00805f9b34fb',
        },
        commands: {
          startMeasurement: '0240dc01a13c',
          dataOfMeasrementOver: '0240dc01a23f',
          getBPMonitorSoftwareVersionNumber: '0240dc01ab36',
          getHistoricData: '0240dc05B1000100022b',
          getCurrentModeStatusOfBP: '0240dc01B22F',
          toSetTime: '0240dc07B0',
        },
      },
    ],
  },
  {
    id: 2,
    deviceUUID: null,
    name: 'BM77',
    bluetoothName: 'BM77',
    services: [
      {
        serviceUUID: '00001810-0000-1000-8000-00805f9b34fb',
        description: 'Blood Pressure Service',
        characteristic: {
          notifyUUID: '00002a35-0000-1000-8000-00805f9b34fb',
        },
      },
    ],
  },
];
