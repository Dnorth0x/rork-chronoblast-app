import React, { useEffect } from 'react';
import { Circle, Group, Blur } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProjectileProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

const Projectile: React.FC<ProjectileProps> = ({ x: initialX, y: initialY, size, color }) => {
  // PHASE 2: Enhanced projectile with advanced VFX using Skia Integration Doctrine v3
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);

  useEffect(() => {
    // Smooth movement animation bridge from game engine to Skia
    x.value = withTiming(initialX, {
      duration: 50, // Faster animation for projectiles
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 50,
      easing: Easing.linear,
    });
  }, [initialX, initialY]);

  // Animated props for Skia (cx, cy can accept SharedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Calculate radius from size (static prop)
  const radius = size / 2;

  return (
    <Group>
      {/* Outer glow effect for enhanced VFX */}
      <Circle cx={cx} cy={cy} r={radius + 2} color={`${color}40`}>
        <Blur blur={4} />
      </Circle>
      {/* Solid inner core */}
      <Circle cx={cx} cy={cy} r={radius} color={color} />
    </Group>
  );
};

export default Projectile;