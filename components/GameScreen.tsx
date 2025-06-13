import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Text } from 'react-native';
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

  const [playerHealth, setPlayerHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderMove: (event, gestureState) => {
      if (isGameOver) return;
      
      const newX = Math.max(0, Math.min(screenWidth - 40, gestureState.moveX - 20));
      const newY = Math.max(0, Math.min(screenHeight - 40, gestureState.moveY - 20));
      
      setPlayerPosition({
        x: newX,
        y: newY,
      });
    },
  });

  // Collision detection function
  const checkCollisions = (playerPos: { x: number; y: number }, enemiesArray: EnemyObject[]) => {
    const playerCenterX = playerPos.x + 20; // Player radius is 20
    const playerCenterY = playerPos.y + 20;
    const playerRadius = 20;
    const enemyRadius = 15;
    const collisionDistance = playerRadius + enemyRadius;

    const collidedEnemyIds: string[] = [];

    enemiesArray.forEach(enemy => {
      const enemyCenterX = enemy.x + 15; // Enemy radius is 15
      const enemyCenterY = enemy.y + 15;
      
      const distance = Math.sqrt(
        Math.pow(playerCenterX - enemyCenterX, 2) + 
        Math.pow(playerCenterY - enemyCenterY, 2)
      );

      if (distance < collisionDistance) {
        collidedEnemyIds.push(enemy.id);
      }
    });

    return collidedEnemyIds;
  };

  // Game loop for enemy movement and collision detection
  useEffect(() => {
    if (isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setEnemies(prevEnemies => {
        // Move enemies towards player
        const updatedEnemies = prevEnemies.map(enemy => {
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
        });

        // Check for collisions
        const collidedEnemyIds = checkCollisions(playerPosition, updatedEnemies);
        
        if (collidedEnemyIds.length > 0) {
          // Decrease health and remove collided enemies
          setPlayerHealth(prevHealth => {
            const newHealth = prevHealth - collidedEnemyIds.length;
            if (newHealth <= 0) {
              setIsGameOver(true);
            }
            return Math.max(0, newHealth);
          });

          // Remove collided enemies
          return updatedEnemies.filter(enemy => !collidedEnemyIds.includes(enemy.id));
        }

        return updatedEnemies;
      });
    }, 16); // ~60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [playerPosition, isGameOver]);

  // Clean up game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

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
      
      {/* Health display */}
      <View style={styles.healthContainer}>
        <Text style={styles.healthText}>Health: {playerHealth}</Text>
      </View>

      {/* Game Over overlay */}
      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.gameOverSubtext}>Your health reached zero!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  healthContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  healthText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameOverSubtext: {
    color: '#CCCCCC',
    fontSize: 18,
    textAlign: 'center',
  },
});