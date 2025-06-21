import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PlayerProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  isInvincible?: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  x: initialX, 
  y: initialY, 
  radius, 
  color,
  isInvincible = false 
}) => {
  // PHASE 2: Enhanced player with invincibility VFX using Skia Integration Doctrine v3
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const alpha = useSharedValue(1);

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
    // Invincibility flashing effect
    if (isInvincible) {
      // Create flashing effect during invincibility
      alpha.value = withTiming(0.3, {
        duration: 150,
        easing: Easing.inOut(Easing.quad),
      });
      
      const flashInterval = setInterval(() => {
        alpha.value = withTiming(alpha.value === 0.3 ? 1 : 0.3, {
          duration: 150,
          easing: Easing.inOut(Easing.quad),
        });
      }, 150);
      
      return () => clearInterval(flashInterval);
    } else {
      alpha.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isInvincible]);

  // Animated props for Skia (cx, cy can accept SharedValue)
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Static props derived from shared values
  const playerColor = useDerivedValue(() => {
    const alphaHex = Math.floor(alpha.value * 255).toString(16).padStart(2, '0');
    return `${color}${alphaHex}`;
  });

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color={playerColor}
    />
  );
};

export default Player;