import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {BM96} from './bm96-controller';

const BM96Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          BM96.setNotify(props.currentDevice);
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

export default BM96Screen;
