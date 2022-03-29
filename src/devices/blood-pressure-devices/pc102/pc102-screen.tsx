import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {PC102} from './pc102-controller';

const PC102Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          PC102.setNotify(props.currentDevice);
          console.log('notifies');
        }}
      />
      <Button
        title="Query id info"
        onPress={async () => {
          PC102.sendCommand(props.currentDevice, PC102.commandGetId);
        }}
      />
      <Button
        title="Query battery info"
        onPress={async () => {
          PC102.sendCommand(props.currentDevice, PC102.commandBattery);
        }}
      />
      <Button
        title="Start measurement"
        onPress={async () => {
          PC102.sendCommand(props.currentDevice, PC102.commandStartMeasurement);
        }}
      />
      <Button
        title="Stop measurement"
        onPress={async () => {
          PC102.sendCommand(props.currentDevice, PC102.commandStartMeasurement);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
});

export default PC102Screen;
