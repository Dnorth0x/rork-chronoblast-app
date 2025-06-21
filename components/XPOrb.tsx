import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface XPOrbProps {
  x: number;
  y: number;
  size: number;
  value: number;
}

export default function XPOrb({ x: initialX, y: initialY, size }: XPOrbProps) {
  const radius = size / 2;
  
  // Shared values for smooth animation on UI thread
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);

  // Update shared values when props change
  useEffect(() => {
    x.value = withTiming(initialX, {
      duration: 100,
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [initialX, initialY]);

  // Derive cx and cy for Skia Circle
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color="#FFD700"
    />
  );
}