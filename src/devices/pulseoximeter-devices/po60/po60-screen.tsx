import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {PO60} from './po60-controller';

const PO60Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          PO60.setNotify(props.currentDevice);
          console.log('notifies');
        }}
      />
      <Button
        title="Send get storage info"
        onPress={async () => {
          PO60.sendCommand(props.currentDevice, PO60.commandGetStorageInfo);
        }}
      />
      <Button
        title="Send start receive measurements"
        onPress={async () => {
          PO60.sendCommand(
            props.currentDevice,
            PO60.commandStartReceiveMeasurements,
          );
        }}
      />
      <Button
        title="Send get next measurement group"
        onPress={async () => {
          PO60.sendCommand(
            props.currentDevice,
            PO60.commandSendNextMeasurementGroup,
          );
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

export default PO60Screen;
