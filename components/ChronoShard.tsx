import React, { useEffect } from 'react';
import { Rect } from '@shopify/react-native-skia';
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
  
  // Shared values for rotation and pulse animations
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

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

  // Start rotation and pulse animations on mount
  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Derive properties for Skia Rect
  const rectX = useDerivedValue(() => x.value - (size * scale.value) / 2);
  const rectY = useDerivedValue(() => y.value - (size * scale.value) / 2);
  const rectWidth = useDerivedValue(() => size * scale.value);
  const rectHeight = useDerivedValue(() => size * scale.value);

  return (
    <Rect
      x={rectX}
      y={rectY}
      width={rectWidth}
      height={rectHeight}
      color="#9D4EDD"
      transform={[
        { rotate: rotation },
      ]}
      origin={useDerivedValue(() => ({ x: x.value, y: y.value }))}
    />
  );
}