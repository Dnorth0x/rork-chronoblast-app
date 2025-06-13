import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PlayerProps {
  x: number;
  y: number;
}

export default function Player({ x, y }: PlayerProps) {
  return (
    <View 
      style={[
        styles.player,
        {
          left: x,
          top: y,
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
});