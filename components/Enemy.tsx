import React from 'react';
import { View, StyleSheet } from 'react-native';

interface EnemyProps {
  x: number;
  y: number;
}

export default function Enemy({ x, y }: EnemyProps) {
  return (
    <View 
      style={[
        styles.enemy,
        {
          left: x,
          top: y,
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#FF00FF', // Vibrant magenta
    borderRadius: 15, // Makes it a perfect circle
  },
});