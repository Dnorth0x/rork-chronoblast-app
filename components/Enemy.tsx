import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EnemyProps } from '@/types';

export default function Enemy({ x, y, color = '#FF00FF' }: EnemyProps) {
  return (
    <View 
      style={[
        styles.enemy,
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
  enemy: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});