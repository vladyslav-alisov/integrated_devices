import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, Button, FlatList} from 'react-native';
import {BleManager, Device, State} from 'react-native-ble-plx';
import {PagerView} from 'react-native-pager-view';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-native-paper/lib/typescript/components/List/List';
import ListItem from 'react-native-paper/lib/typescript/components/List/ListItem';
import ActimiDeviceKit from './src/device-kit';
import B02TScreen from './src/devices/blood-pressure-devices/b02t/b02t-screen';
import BM54Screen from './src/devices/blood-pressure-devices/bm54/bm54-screen';
import BM77Screen from './src/devices/blood-pressure-devices/bm77/bm77-screen';
import BM96Screen from './src/devices/blood-pressure-devices/bm96/bm96-screen';
import PC102Screen from './src/devices/blood-pressure-devices/pc102/pc102-screen';
import {DeviceManager} from './src/devices/device-manager';
import {IDevice} from './src/devices/device.interface';
import AD805Screen from './src/devices/pulseoximeter-devices/ad805/ad805-screen';
import FS20FPOScreen from './src/devices/pulseoximeter-devices/fs20f-po/fs20f-po-screen';
import PO60Screen from './src/devices/pulseoximeter-devices/po60/po60-screen';
import {TextImage} from './src/ui/components';

const App = () => {
  const [state, setState] = useState('PoweredOff');
  const [deviceState, setDeviceState] = useState('Disconnected');
  const [foundDevice, setFoundDevice] = useState('No device found');
  const [index, setIndex] = useState(0);
  const [newDevices, setNewDevices] = useState<Device[]>([]);
  const [savedDevices, setSavedDevices] = useState<IDevice[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  /**
   * useRef hook is used, because objects needs to be kept after hot refresh
   */
  const sdk = useRef<DeviceManager>();
  const ble = useRef<BleManager>();
  const currentDevice = useRef<Device>();
  /**
   * Name         Device Ble Name
   * B02T    ===  B02TBPM-188
   * AD805   ===  PRT Server
   * FS20F   ===  VTM 20F
   * PC-102  ===  PC-100:00209
   */
  const devices: string[] = [
    'BPM-188',
    'BM54',
    'BM77',
    'BM96',
    'PC-100:00209',
    'VTM 20F',
    'PO60',
    'PRT Server',
    'PC-60FW',
  ];

  useEffect(() => {
    /**
     * initSdk loads all saved devices and gets ble manager.
     */
    const initSdk = async () => {
      try {
        console.log('init');

        ble.current = new BleManager();

        sdk.current = await DeviceManager.initDeviceManager(ble.current);
        setSavedDevices(sdk.current.savedDevices);
        setState(await ble.current.state());
        if (ble) {
          ble.current.onStateChange(newState => {
            switch (newState) {
              case State.PoweredOn:
                setState(State.PoweredOn);
                break;
              case State.PoweredOff:
                setState(State.PoweredOff);
                break;
              case State.Resetting:
                setState(State.Resetting);
                break;
              case State.Unauthorized:
                setState(State.Unauthorized);
                break;
              case State.Unknown:
                setState(State.Unknown);
                break;
              case State.Unsupported:
                setState(State.Unsupported);
                break;
              default:
                setState(State.Unknown);
                break;
            }
          });
        }
        console.log('init finished');
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    initSdk();
  }, []);




  const actionOnList = async (item: IDevice) => {
    setIsLoading(true);
    switch(index){
      case 0:
        try {
          sdk.current?.stopScan();
          const dev = await sdk.current?.saveNewDevice(item);
          if (dev) {
            setSavedDevices(saved => saved.concat(dev));
          }
        } catch (error) {
          console.log(error);
          setIsLoading(false);
        }
        setIsLoading(false);
        break;
      case 1:
        try {
          sdk.current.startScanForSavedDevices(
            (conn)=>{
            console.log("connected: " + JSON.stringify(conn.deviceName)+ " is connected");
          },(disc)=>{
            console.log("disconnected: " + JSON.stringify(disc.deviceName)+ " is disconnected");
          },(er)=>{
            console.log("error: " + JSON.stringify(er));
        })
        } catch (error) {
          console.log(error);
          setIsLoading(false);
        }   
        setIsLoading(false);
        break;
    }
  }

  /**
   * Conditionally renders either scanned devices or saved devices
   * @returns Button which fires actions: "adding device to saved ones" or "connect to saved device"
   */
  const renderItem = ({item}) => {
    return (
      <Button
        title={item.name}
        onPress={async () => {
          await actionOnList(item);
        }}
      />
    );
  };

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <View style={styles.view}>
      <Button
        title="Scan Devices"
        onPress={() => {
          setNewDevices([]);
          sdk.current?.scanForNewDevices(
            newDevice => {
              //console.log(newDevice.name);
              setNewDevices(devicesLod =>
                Array.from(new Set(devicesLod.concat(newDevice))),
              );
            },
            error => {
              console.log(error);
            },
          );
        }}
      />
      <Button
        title="Stop Scan"
        onPress={() => {
          sdk.current?.stopScan();
        }}
      />
      <Button title="Connect" onPress={() => {}} />
      <Button title="Disconnect" onPress={async () => {}} />
      <Button
        title="Services and chars"
        onPress={async () => {
          const services = await currentDevice.current?.services();
          for (const service of services) {
            console.log('Service: ' + service.uuid);
            const characteristics =
              await currentDevice.current?.characteristicsForService(
                service.uuid,
              );
            for (const e of characteristics) {
              console.log(
                'Characteristic: ' +
                  e.uuid +
                  ' is writable with response ' +
                  e.isWritableWithResponse,
                ' is writable without response ' + e.isWritableWithoutResponse,
                ' is readable ' + e.isReadable,
                ' is indicatable ' + e.isIndicatable,
                ' is notifiable ' + e.isNotifiable,
              );
            }
          }
        }}
      />

      <Text style={styles.text}>Found Device: {foundDevice}</Text>
      <Text style={styles.text}>Bluetooth State: {state}</Text>
      <Text style={styles.text}>Device State: {deviceState}</Text>

      {/* {<FlatList data={newDevices} renderItem={renderItem} />} */}
      {/**
       * If device has security system (uses pairing), then in
       * some cases it is required to read battery data before using bluetooth operation.
       * When we setup listener, device should be notified, and sometimes it is required
       * to send "write" command, after "notify". However broadcast take more time
       * for device to receive "notify" command,which we dont await. So it cant accept write operation in parallel.
       *
       */}
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={event => setIndex(event.nativeEvent.position)}>
        <View>
          <Text>New devices</Text>
          <FlatList data={newDevices} renderItem={renderItem} />
        </View>
        <View>
          <Text>Saved devices</Text>
          <FlatList data={savedDevices} renderItem={renderItem} />
        </View>
        {/* <View key="1">
          <TextImage
            imageUrl="https://img.medicalexpo.com/images_me/photo-mg/100940-16890221.jpg"
            deviceName="B02T"
          />
          <B02TScreen currentDevice={currentDevice.current} />
        </View>
        <View key="2">
          <TextImage
            imageUrl="https://cdn.akakce.com/beurer/beurer-bm-54-bluetooth-ozellikli-koldan-tansiyon-olcer-z.jpg"
            deviceName="BM54"
          />
          <BM54Screen currentDevice={currentDevice.current} />
        </View>
        <View key="3">
          <TextImage
            imageUrl="https://cdn.akakce.com/beurer/beurer-bm-77-bluetooth-ozellikli-koldan-tansiyon-olcer-z.jpg"
            deviceName="BM77"
          />
          <BM77Screen currentDevice={currentDevice.current} />
        </View>
        <View key="4">
          <TextImage
            imageUrl="https://mcdn01.gittigidiyor.net/73555/735559678_1.jpg"
            deviceName="BM96"
          />
          <BM96Screen currentDevice={currentDevice.current} />
        </View>
        <View key="5">
          <TextImage
            imageUrl="https://cdn.shopify.com/s/files/1/0336/1003/9427/products/PC102Front_grande.jpg?v=1627500524"
            deviceName="PC-102"
          />
          <PC102Screen currentDevice={currentDevice.current} />
        </View>
        <View key="6">
          <TextImage
            imageUrl="https://cdn.shopify.com/s/files/1/0248/4191/2354/products/FS20F_3.377_480x480.png?v=1625457155"
            deviceName="FS20F"
          />
          <FS20FPOScreen currentDevice={currentDevice.current} />
        </View>
        <View key="7">
          <TextImage
            imageUrl="https://productimages.hepsiburada.net/s/18/375/9820708110386.jpg"
            deviceName="PO60"
          />
          <PO60Screen currentDevice={currentDevice.current} />
        </View>
        <View key="8">
          <TextImage
            imageUrl="https://m.media-amazon.com/images/I/61-ZgUcpywL._AC_SL1500_.jpg"
            deviceName="AD805"
          />
          <AD805Screen currentDevice={currentDevice.current} />
        </View>
        <View key="9">
          <TextImage
            imageUrl="https://static.praxisdienst.com/out/pictures/generated/product/1/1500_1500_100/142546-viatom-pulsoximeter-pc-60fw-schwarz-1.jpg"
            deviceName="PC-60FW"
          />
          <AD805Screen currentDevice={currentDevice.current} />
        </View> */}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    margin: 20,
    flex: 1,
  },
  view: {flex: 1},
  text: {fontSize: 20, color: 'black', alignSelf: 'center'},
});

export default App;
