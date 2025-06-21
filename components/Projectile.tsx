import React, { useEffect } from 'react';
import { Circle, Group, Paint, Blur } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface ProjectileProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function Projectile({ x: initialX, y: initialY, size, color }: ProjectileProps) {
  // Shared values for smooth position animation on UI thread
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  
  // Advanced visual effect shared values
  const glowIntensity = useSharedValue(0.5);
  const coreScale = useSharedValue(1);
  const trailOpacity = useSharedValue(0.6);
  const energyPulse = useSharedValue(0.8);

  // Update position shared values when props change
  useEffect(() => {
    x.value = withTiming(initialX, {
      duration: 50, // Faster animation for projectiles
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 50,
      easing: Easing.linear,
    });
  }, [initialX, initialY]);

  // Start advanced visual animations on mount
  useEffect(() => {
    // Pulsing glow effect
    glowIntensity.value = withRepeat(
      withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Core pulsing
    coreScale.value = withRepeat(
      withTiming(1.2, {
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Trail opacity breathing
    trailOpacity.value = withRepeat(
      withTiming(0.9, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Energy pulse animation
    energyPulse.value = withRepeat(
      withTiming(1.1, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Derive animated props for Skia components
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  // Calculate static prop values as primitives
  const baseRadius = size / 2;

  return (
    <Group>
      {/* Outer energy field */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 2.5}
        color={color}
        opacity={0.15}
      >
        <Paint>
          <Blur blur={8} />
        </Paint>
      </Circle>
      
      {/* Outer glow effect */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 1.8}
        color={color}
        opacity={0.3}
      >
        <Paint>
          <Blur blur={4} />
        </Paint>
      </Circle>
      
      {/* Trail effect */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 1.4}
        color={color}
        opacity={trailOpacity}
      />
      
      {/* Energy ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 1.1}
        color={color}
        opacity={energyPulse}
      />
      
      {/* Core projectile */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius}
        color={color}
      />
      
      {/* Inner bright core */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 0.4}
        color="#FFFFFF"
        opacity={0.8}
      />
      
      {/* Central energy point */}
      <Circle
        cx={cx}
        cy={cy}
        r={baseRadius * 0.15}
        color="#FFFFFF"
        opacity={1}
      />
    </Group>
  );
}