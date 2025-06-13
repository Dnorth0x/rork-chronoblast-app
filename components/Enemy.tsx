import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EnemyProps } from '@/types';

export default function Enemy({ x, y, color = '#FF00FF', size = 30 }: EnemyProps) {
  const radius = size / 2;
  
  return (
    <View 
      style={[
        styles.enemy,
        {
          left: x,
          top: y,
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: radius,
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
  },
});