import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PlayerProps } from '@/types';

export default function Player({ x, y, color }: PlayerProps) {
  return (
    <View 
      style={[
        styles.player,
        {
          left: x,
          top: y,
          backgroundColor: color,
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
    borderRadius: 20, // Makes it a perfect circle
  },
});