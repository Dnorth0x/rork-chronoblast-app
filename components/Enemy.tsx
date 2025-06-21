import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface EnemyProps {
  x: number;
  y: number;
  color: string;
  size: number;
}

const Enemy: React.FC<EnemyProps> = ({ x: initialX, y: initialY, color, size }) => {
  // PHASE 2: Enhanced enemy using Skia Integration Doctrine v3
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);

  useEffect(() => {
    // Smooth movement animation bridge from game engine to Skia
    x.value = withTiming(initialX, {
      duration: 100,
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [initialX, initialY]);

  // Animated props for Skia (cx, cy can accept SharedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Calculate radius from size (static prop)
  const radius = size / 2;

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color={color}
    />
  );
};

export default Enemy;