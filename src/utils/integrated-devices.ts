import MeasurementTypeKey from '../enums/measurement-type-keys';

export enum IntegratedDevices {
  BM96 = 'BM96',
  BF720 = 'BF720',
  BP2_4669 = 'BP_4669',
  BM77 = 'BM77',
  B02T = 'BPM-188',
  BM54 = 'BM54',
}

export const integratedDevices = new Map<
  IntegratedDevices,
  MeasurementTypeKey[]
>([
  [
    IntegratedDevices.BM96,
    [MeasurementTypeKey.bloodPressure, MeasurementTypeKey.ecg],
  ],
  [IntegratedDevices.BF720, [MeasurementTypeKey.bodyWeight]],
  [
    IntegratedDevices.BP2_4669,
    [MeasurementTypeKey.bloodPressure, MeasurementTypeKey.ecg],
  ],
  [IntegratedDevices.BM77, [MeasurementTypeKey.bloodPressure]],
  [IntegratedDevices.B02T, [MeasurementTypeKey.bloodPressure]],
]);
