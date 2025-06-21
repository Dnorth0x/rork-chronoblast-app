import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { PlayerProps } from '@/types';

const Player = React.forwardRef<View, PlayerProps>(({ x, y, color, isInvincible }, ref) => {
  // Shared values for smooth position interpolation
  const animatedX = useSharedValue(x);
  const animatedY = useSharedValue(y);
  const opacity = useSharedValue(1);

  // Update position with smooth timing when props change
  useEffect(() => {
    animatedX.value = withTiming(x, { duration: 100 });
    animatedY.value = withTiming(y, { duration: 100 });
  }, [x, y]);

  // Handle flashing effect when invincible
  useEffect(() => {
    if (isInvincible) {
      // Start flashing animation
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 100 }),
          withTiming(1, { duration: 100 })
        ),
        -1, // Infinite repeat
        false
      );
    } else {
      // Stop flashing and reset opacity
      opacity.value = withTiming(1, { duration: 100 });
    }
  }, [isInvincible]);

  // Derived value for circle center
  const center = useDerivedValue(() => ({
    x: animatedX.value + 20, // Add radius to center the circle
    y: animatedY.value + 20, // Add radius to center the circle
  }));

  // Derived value for circle opacity
  const circleOpacity = useDerivedValue(() => opacity.value);

  return (
    <View 
      ref={ref}
      style={[
        styles.container,
        {
          left: x,
          top: y,
        }
      ]}
    >
      <Canvas style={styles.canvas}>
        <Circle
          center={center}
          radius={20}
          color={color}
          opacity={circleOpacity}
        />
      </Canvas>
    </View>
  );
});

Player.displayName = 'Player';

export default Player;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  canvas: {
    width: 40,
    height: 40,
  },
});