import React from 'react';
import { StyleSheet, View } from 'react-native';

interface XPOrbProps {
  x: number;
  y: number;
  size: number;
  value: number;
}

export default function XPOrb({ x, y, size }: XPOrbProps) {
  return (
    <View
      style={[
        styles.xpOrb,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  xpOrb: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
});