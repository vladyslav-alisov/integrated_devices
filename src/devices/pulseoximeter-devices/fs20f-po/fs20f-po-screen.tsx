import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {FS20F} from './fs20f-po-controller';

const FS20FPOScreen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          FS20F.setNotify(props.currentDevice);
          console.log('notifies');
        }}
      />
      <Button
        title="Some command (no info in docs)"
        onPress={async () => {
          FS20F.sendCommand(props.currentDevice, FS20F.commandStartReceiveData);
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

export default FS20FPOScreen;
