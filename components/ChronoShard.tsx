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

const ChronoShard: React.FC<ChronoShardProps> = ({ x: initialX, y: initialY, size, value }) => {
  // PHASE 2: Fixed ChronoShard using Skia Integration Doctrine v3
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const rotationScale = useSharedValue(1);

  useEffect(() => {
    // Smooth movement animation bridge
    x.value = withTiming(initialX, {
      duration: 100,
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [initialX, initialY]);

  useEffect(() => {
    // Rotating scale animation for chrono shards
    rotationScale.value = withRepeat(
      withTiming(1.3, {
        duration: 1200,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, []);

  // Animated props for Skia (cx, cy can accept SharedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // THE FIX: Static props derived from shared values
  // The 'r' prop for radius is a static prop and expects a number, not a SharedValue
  const animatedRadius = useDerivedValue(() => (size / 2) * rotationScale.value);
  
  // Color based on value - brighter for higher value shards
  const shardColor = value >= 3 ? '#F59E0B' : '#FCD34D'; // Amber for high value, lighter amber for normal

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={animatedRadius}
      color={shardColor}
    />
  );
};

export default ChronoShard;