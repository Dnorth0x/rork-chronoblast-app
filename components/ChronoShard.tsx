import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface ChronoShardProps {
  x: number;
  y: number;
  size: number;
  value: number;
}

export default function ChronoShard({ x: initialX, y: initialY, size }: ChronoShardProps) {
  // Shared values for smooth position animation on UI thread
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  
  // Shared values for advanced visual effects
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  // Update position shared values when props change
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

  // Start advanced visual animations on mount
  useEffect(() => {
    // Pulsing scale animation
    scale.value = withRepeat(
      withTiming(1.3, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Breathing opacity animation
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Derive animated props for Skia Circle (these accept SharedValue/DerivedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  // THE FIX: Calculate radius as a derived primitive value
  // The 'r' prop is static and expects a number, not SharedValue
  const radius = useDerivedValue(() => (size / 2) * scale.value);

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius} // Now correctly derived as a primitive number
      color="#9D4EDD" // Purple color for chrono shards
      opacity={opacity} // Animated opacity
    />
  );
}