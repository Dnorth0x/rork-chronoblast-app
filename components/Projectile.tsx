import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProjectileProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function Projectile({ x, y, size, color }: ProjectileProps) {
  return (
    <View
      style={[
        styles.projectile,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
          shadowColor: color,
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  projectile: {
    position: 'absolute',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});