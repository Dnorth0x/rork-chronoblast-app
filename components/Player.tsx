import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { PlayerProps } from '@/types';

const Player = React.forwardRef<Animated.View, PlayerProps>(({ x, y, color, isInvincible }, ref) => {
  const [opacity, setOpacity] = useState(1);

  // Flashing effect when invincible
  useEffect(() => {
    let flashInterval: NodeJS.Timeout | null = null;

    if (isInvincible) {
      // Start flashing
      flashInterval = setInterval(() => {
        setOpacity(prevOpacity => prevOpacity === 1 ? 0.3 : 1);
      }, 100); // Flash every 100ms
    } else {
      // Stop flashing and reset opacity
      if (flashInterval) {
        clearInterval(flashInterval);
      }
      setOpacity(1);
    }

    return () => {
      if (flashInterval) {
        clearInterval(flashInterval);
      }
    };
  }, [isInvincible]);

  return (
    <Animated.View 
      ref={ref}
      style={[
        styles.player,
        {
          left: x,
          top: y,
          backgroundColor: color,
          opacity: opacity,
        }
      ]} 
    />
  );
});

Player.displayName = 'Player';

export default Player;

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20, // Makes it a perfect circle
  },
});