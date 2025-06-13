import React, { useState, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Dimensions } from 'react-native';
import Player from './Player';
import Enemy from './Enemy';
import { EnemyObject } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const [playerPosition, setPlayerPosition] = useState({
    x: screenWidth / 2 - 20, // Center horizontally (minus half player width)
    y: screenHeight / 2 - 20, // Center vertically (minus half player height)
  });

  const [enemies, setEnemies] = useState<EnemyObject[]>([
    {
      id: 'enemy-1',
      x: 100,
      y: 100,
      color: '#FF00FF'
    }
  ]);

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

  // Game loop for enemy movement
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          // Calculate direction to player
          const dx = (playerPosition.x + 20) - (enemy.x + 15); // Center to center
          const dy = (playerPosition.y + 20) - (enemy.y + 15);
          
          // Calculate distance
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize direction and apply movement speed
          if (distance > 0) {
            const moveSpeed = 1; // Pixels per frame
            const normalizedDx = (dx / distance) * moveSpeed;
            const normalizedDy = (dy / distance) * moveSpeed;
            
            return {
              ...enemy,
              x: enemy.x + normalizedDx,
              y: enemy.y + normalizedDy,
            };
          }
          
          return enemy;
        })
      );
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [playerPosition]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Player x={playerPosition.x} y={playerPosition.y} color="#00FFFF" />
      {enemies.map(enemy => (
        <Enemy 
          key={enemy.id}
          x={enemy.x} 
          y={enemy.y} 
          color={enemy.color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
});