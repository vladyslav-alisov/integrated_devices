import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {BM54} from './bm54-controller';

const BM54Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          BM54.setNotify(props.currentDevice);
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

export default BM54Screen;
