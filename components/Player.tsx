import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Player() {
  return (
    <View style={styles.player} />
  );
}

const styles = StyleSheet.create({
  player: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
});