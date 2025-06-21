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
  radius?: number;
  color?: string;
  isInvincible?: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  x: initialX, 
  y: initialY, 
  radius = 20, 
  color = '#38BDF8',
  isInvincible = false 
}) => {
  // Shared values for smooth animation on UI thread
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const opacity = useSharedValue(1);

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

  // Handle invincibility visual effect
  useEffect(() => {
    if (isInvincible) {
      opacity.value = withTiming(0.5, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [isInvincible]);

  // Derive cx and cy for Skia Circle
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color={color}
      opacity={opacity}
    />
  );
};

export default Player;