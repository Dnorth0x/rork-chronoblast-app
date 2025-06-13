import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PlayerProps } from '@/types';

const Player = React.forwardRef<View, PlayerProps>(({ x, y, color }, ref) => {
  return (
    <View 
      ref={ref}
      style={[
        styles.player,
        {
          left: x,
          top: y,
          backgroundColor: color,
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