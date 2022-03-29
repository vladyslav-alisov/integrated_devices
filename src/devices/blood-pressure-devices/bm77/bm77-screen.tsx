import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {BM77} from './bm77-controller';

const BM77Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          BM77.setNotify(props.currentDevice);
          console.log('notifies');
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

export default BM77Screen;
