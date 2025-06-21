import React, { useEffect } from 'react';
import { Circle, Group, Paint, Blur } from '@shopify/react-native-skia';
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
  const glowIntensity = useSharedValue(0.6);

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

    // Glow intensity animation
    glowIntensity.value = withRepeat(
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Derive animated props for Skia components
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  // THE FIX: Calculate static prop values as primitives
  // These are used directly as numbers, not as SharedValues
  const baseRadius = size / 2;

  return (
    <Group>
      {/* Outer mystical glow */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 2.2}
        color="#9D4EDD"
        opacity={0.2}
      >
        <Paint>
          <Blur blur={6} />
        </Paint>
      </Circle>
      
      {/* Middle energy ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 1.6}
        color="#C77DFF"
        opacity={opacity}
      />
      
      {/* Core chrono shard */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius}
        color="#9D4EDD"
        opacity={opacity}
      />
      
      {/* Inner bright core */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 0.5}
        color="#E0AAFF"
        opacity={0.9}
      />
    </Group>
  );
}