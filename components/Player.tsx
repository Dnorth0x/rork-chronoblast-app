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
}

const Player: React.FC<PlayerProps> = ({ x: initialX, y: initialY, radius }) => {
  // Principle 3: The "Bridge". These SharedValues live on the UI thread.
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);

  // This effect listens for changes from the GameEngine's state (the props).
  useEffect(() => {
    // When the engine's state changes, we command the UI thread to animate to the new position.
    x.value = withTiming(initialX, {
      duration: 100, // Keep animation snappy to match engine ticks
      easing: Easing.linear,
    });
    y.value = withTiming(initialY, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [initialX, initialY]); // Correct dependency array prevents unnecessary re-renders.

  // Principle 1 & 2: API Precision and Data Flow.
  // We derive the final props for the Skia component from our animated shared values.
  // The Skia Circle component will now re-render on the UI thread whenever these values change.
  // Note: We are explicitly using `cx` and `cy` as required by the Skia API.
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color="#38BDF8" // Using a color from our theme's accent
    />
  );
};

export default Player;