import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ExplosionObject } from '@/types/gameState';

interface ExplosionProps {
  explosion: ExplosionObject;
  onComplete: (id: string) => void;
}

const DURATION = 500;

const Explosion: React.FC<ExplosionProps> = ({ explosion, onComplete }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Start the animation immediately when component mounts
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(onComplete)(explosion.id);
      }
    });
  }, [explosion.id, onComplete]);

  // Animate radius from 0 to 40
  const radius = useDerivedValue(() => progress.value * 40);
  
  // Animate alpha from 1 to 0
  const alpha = useDerivedValue(() => 1 - progress.value);
  
  // Create color with animated alpha
  const color = useDerivedValue(() => {
    const alphaHex = Math.floor(alpha.value * 255).toString(16).padStart(2, '0');
    return `#FF6B35${alphaHex}`;
  });

  return (
    <Circle
      cx={explosion.x}
      cy={explosion.y}
      r={radius}
      color={color}
    />
  );
};

export default Explosion;