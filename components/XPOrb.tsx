import React, { useEffect } from 'react';
import { Circle } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface XPOrbProps {
  x: number;
  y: number;
  size: number;
  value: number;
}

const XPOrb: React.FC<XPOrbProps> = ({ x: initialX, y: initialY, size, value }) => {
  // PHASE 2: Enhanced XP orb using Skia Integration Doctrine v3
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const pulseScale = useSharedValue(1);

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
    // Pulsing animation for XP orbs
    pulseScale.value = withRepeat(
      withTiming(1.2, {
        duration: 800,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, []);

  // Animated props for Skia
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Static props derived from shared values
  const animatedRadius = useDerivedValue(() => (size / 2) * pulseScale.value);
  
  // Color based on value
  const orbColor = value >= 15 ? '#FFD700' : '#00FF88'; // Gold for high value, green for normal

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={animatedRadius}
      color={orbColor}
    />
  );
};

export default XPOrb;