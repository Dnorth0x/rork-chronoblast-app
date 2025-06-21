import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { EnemyObject } from '@/types/gameState';

interface EnemyProps {
  enemy: EnemyObject;
}

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  // PHASE 2: Enhanced enemy using Skia Integration Doctrine v3
  const x = useSharedValue(enemy.x);
  const y = useSharedValue(enemy.y);

  useEffect(() => {
    // Smooth movement animation bridge from game engine to Skia
    x.value = withTiming(enemy.x, {
      duration: 100,
      easing: Easing.linear,
    });
    y.value = withTiming(enemy.y, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [enemy.x, enemy.y]);

  // Animated props for Skia (cx, cy can accept SharedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Calculate radius from size (static prop)
  const radius = enemy.size / 2;

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color={enemy.color}
    />
  );
};

export default Enemy;