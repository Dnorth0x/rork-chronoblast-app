import React from 'react';
import { StyleSheet, View } from 'react-native';
import Player from './Player';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <Player />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  playerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
});