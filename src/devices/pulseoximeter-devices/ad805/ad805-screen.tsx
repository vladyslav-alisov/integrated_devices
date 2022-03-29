import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import {AD805} from './ad805-controller';

const AD805Screen = props => {
  return (
    <View style={styles.pagerView}>
      <Button
        title="Notify"
        onPress={async () => {
          AD805.setNotify(props.currentDevice);
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

export default AD805Screen;
