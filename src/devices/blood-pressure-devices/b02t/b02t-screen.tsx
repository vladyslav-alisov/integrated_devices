import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {B02T} from './b02t-controller';

const B02TScreen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          B02T.setNotify(props.currentDevice);
          console.log('notifies');
        }}
      />
      <Button
        title="Send start measurement"
        onPress={async () => {
          B02T.sendCommand(props.currentDevice, B02T.commandStartMeasurement);
        }}
      />
      <Button
        title="Send measurement over"
        onPress={async () => {
          B02T.sendCommand(
            props.currentDevice,
            B02T.commandDataOfMeasurementOver,
          );
        }}
      />
      <Button
        title="Send get bp monitor software version"
        onPress={async () => {
          B02T.sendCommand(
            props.currentDevice,
            B02T.commandGetBPMonitorSoftwareVersionNumber,
          );
        }}
      />
      <Button
        title="Send get historical data for user 1 and 2"
        onPress={async () => {
          B02T.sendCommand(props.currentDevice, B02T.commandGetHistoricalData);
        }}
      />
      <Button
        title="Send get current mode status"
        onPress={async () => {
          B02T.sendCommand(
            props.currentDevice,
            B02T.commandGetCurrentModeStatusOfBP,
          );
        }}
      />
      <Button
        title="Set current time"
        onPress={async () => {
          B02T.setCurrentTime(props.currentDevice);
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

export default B02TScreen;
