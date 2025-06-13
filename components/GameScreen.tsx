import React, { useState } from 'react';
import { StyleSheet, View, PanResponder, Dimensions } from 'react-native';
import Player from './Player';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const [playerPosition, setPlayerPosition] = useState({
    x: screenWidth / 2 - 20, // Center horizontally (minus half player width)
    y: screenHeight / 2 - 20, // Center vertically (minus half player height)
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderMove: (event, gestureState) => {
      const newX = Math.max(0, Math.min(screenWidth - 40, gestureState.moveX - 20));
      const newY = Math.max(0, Math.min(screenHeight - 40, gestureState.moveY - 20));
      
      setPlayerPosition({
        x: newX,
        y: newY,
      });
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Player x={playerPosition.x} y={playerPosition.y} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
});