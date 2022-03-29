
//Parsing Management
export interface BloodPressure {
    header: string;
    type: string;
    bloodPressure: any;
  }
  
  export interface HeartRate {
    header: string;
    type: string;
    hearRate: any;
  }
  
  export interface ParserDefinition {
    name: string;
    parseType?: string;
    indexes: number[];
    parseReference?: number;
    customParser?: any;
    /** when null skip else go and apply the condition  */
    condition: ParserCondition;
  }
  
  export interface ParserCondition {
    conditionFieldIndex: number;
    conditionFieldValue: any;
    action: ParserDefinition;
  }
  
  let bloodPressureParser: ParserDefinition[] = [
    {
      name: 'header',
      parseType: 'int',
      indexes: [1, 0],
      parseReference: 16,
      condition: null,
    },
    {
      name: 'type',
      parseType: 'int',
      indexes: [2],
      parseReference: 16,
    },
  ];
  
  export class Parser {
    converter<T>(hexArray: string[], parserDefinition: ParserDefinition[]) {
      const result: T = {};
      for (const field of parserDefinition) {
        switch (field.parseType) {
          case 'int':
            let hexTemp = '';
            for (const hexItem of field.indexes) {
              hexTemp += hexArray[hexItem];
            }
            result[field.name] = parseInt(hexTemp, field.parseReference);
            break;
          case 'customx':
            result[field.name] = new CustomX().parse(params);
            break;
        }
      }
  
      return result;
    }
  
    parseCustomX() {}
  }
  
  export interface Parse {
    parse(params);
  }
  
  export class CustomX implements Parse {
    parse(params) {
      // Do the parsing magic here
      /**
           *  if (totalBytesWillReceive === 0) {
                console.log('No measurements');
              } else {
                tempArray = tempArray.concat(hexArray);
                if (totalBytesWillReceive === null) {
                  return;
                }
                if (totalBytesWillReceive !== null) {
                  if (
                    tempArray.length % 200 === 0 &&
                    tempArray.length < totalBytesWillReceive
                  ) {
  
                    setTimeout(
                      async () =>
                        await this.sendCommand(
                          device,
                          this.commandSendNextMeasurementGroup,
                        ),
                      100,
                    );
           */
    }
  }
  
  // static convertSpo2(hexArray: string[]) {
  //     const result = {
  //       header: parseInt(hexArray[1] + hexArray[0], 16),
  //       type: parseInt(hexArray[2], 16),
  //       heartRate: parseInt(hexArray[3], 16),
  //       bloodOxygen: parseInt(hexArray[4], 16),
  //       perfusionIndex: parseInt(hexArray[5], 16) / 10,
  //       batteryLevel: parseInt(hexArray[6], 16),
  //     };
  //     return result;
  //   }
  
  /******************************************* */
  
  const deviceCommand = new DeviceCommand(device, command);
  device.executeCommand();
  
  const deviceCommand = DeviceCommand.execute(device, 'startMeasurement');
  