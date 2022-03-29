import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {PC60FW} from './pc-60fw-controller';

const PC60FWScreen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          PC60FW.setNotify(props.currentDevice);
          console.log('notifies');
        }}
      />
      <Button
        title="Some command (no info in docs)"
        onPress={async () => {
          PC60FW.sendCommand(
            props.currentDevice,
            PC60FW.commandStartReceiveData,
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

export default PC60FWScreen;
