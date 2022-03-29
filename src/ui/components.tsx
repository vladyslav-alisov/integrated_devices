import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

export const TextImage = props => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: props.imageUrl,
        }}
        style={styles.image}
      />
      <Text style={styles.text}>{props.deviceName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flexDirection: 'row', alignSelf: 'center'},
  image: {width: 100, height: 100, resizeMode: 'contain'},
  text: {fontSize: 20, color: 'black', alignSelf: 'center'},
});
