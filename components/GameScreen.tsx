import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Text, Animated } from 'react-native';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';
import { EnemyObject } from '@/types';
import { enemyData, enemyTypes } from '@/game/enemyData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  // Use refs for player position to avoid re-renders
  const positionRef = useRef({
    x: screenWidth / 2 - 20, // Center horizontally (minus half player width)
    y: screenHeight / 2 - 20, // Center vertically (minus half player height)
  });
  
  // Ref to the player component for direct native updates
  const playerRef = useRef<View>(null);
  
  // Ref for the main container to enable screen shake
  const containerRef = useRef<View>(null);
  const shakeAnimation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Initial position state (only used for initial render)
  const [initialPlayerPosition] = useState({
    x: screenWidth / 2 - 20,
    y: screenHeight / 2 - 20,
  });

  const [enemies, setEnemies] = useState<EnemyObject[]>([]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlayerInvincible, setIsPlayerInvincible] = useState(false);
  const [spawnRate, setSpawnRate] = useState(2000); // milliseconds
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const invincibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enemyIdCounter = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderMove: (event, gestureState) => {
      if (isGameOver) return;
      
      const newX = Math.max(0, Math.min(screenWidth - 40, gestureState.moveX - 20));
      const newY = Math.max(0, Math.min(screenHeight - 40, gestureState.moveY - 20));
      
      // Update position ref instead of state
      positionRef.current = {
        x: newX,
        y: newY,
      };

      // Directly update the native component without re-render
      if (playerRef.current) {
        playerRef.current.setNativeProps({
          style: {
            left: newX,
            top: newY,
          }
        });
      }
    },
  });

  // Screen shake animation function
  const triggerScreenShake = () => {
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: { x: -8, y: -4 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: 8, y: 4 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: -6, y: -2 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: 6, y: 2 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: 0, y: 0 },
        duration: 50,
        useNativeDriver: false,
      }),
    ]);

    shakeSequence.start();
  };

  // Function to generate random off-screen position
  const generateOffScreenPosition = (enemySize: number) => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    
    switch (side) {
      case 0: // Top
        return {
          x: Math.random() * screenWidth,
          y: -enemySize,
        };
      case 1: // Right
        return {
          x: screenWidth + enemySize,
          y: Math.random() * screenHeight,
        };
      case 2: // Bottom
        return {
          x: Math.random() * screenWidth,
          y: screenHeight + enemySize,
        };
      case 3: // Left
        return {
          x: -enemySize,
          y: Math.random() * screenHeight,
        };
      default:
        return { x: -enemySize, y: -enemySize };
    }
  };

  // Function to spawn a new enemy
  const spawnEnemy = () => {
    if (isGameOver) return;
    
    // Randomly select enemy type
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const enemyConfig = enemyData[randomType];
    
    const position = generateOffScreenPosition(enemyConfig.size);
    
    const newEnemy: EnemyObject = {
      id: `enemy-${enemyIdCounter.current++}`,
      x: position.x,
      y: position.y,
      color: enemyConfig.color,
      type: randomType,
      health: enemyConfig.health,
      speed: enemyConfig.speed,
      size: enemyConfig.size,
    };

    setEnemies(prevEnemies => [...prevEnemies, newEnemy]);
  };

  // Collision detection function - now uses positionRef instead of state
  const checkCollisions = (enemiesArray: EnemyObject[]) => {
    const playerCenterX = positionRef.current.x + 20; // Player radius is 20
    const playerCenterY = positionRef.current.y + 20;
    const playerRadius = 20;

    const collidedEnemyIds: string[] = [];

    enemiesArray.forEach(enemy => {
      const enemyRadius = enemy.size / 2;
      const enemyCenterX = enemy.x + enemyRadius;
      const enemyCenterY = enemy.y + enemyRadius;
      const collisionDistance = playerRadius + enemyRadius;
      
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

  // Enemy spawner loop
  useEffect(() => {
    if (isGameOver) {
      if (spawnerRef.current) {
        clearInterval(spawnerRef.current);
        spawnerRef.current = null;
      }
      return;
    }

    const spawnerId = setInterval(() => {
      spawnEnemy();
    }, spawnRate);
    
    spawnerRef.current = spawnerId;

    return () => {
      clearInterval(spawnerId);
    };
  }, [spawnRate, isGameOver]);

  // Timer for elapsed time and difficulty scaling
  useEffect(() => {
    if (isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const difficultyTimerId = setInterval(() => {
      setTimeElapsed(prevTime => {
        const newTime = prevTime + 1;
        
        // Every 10 seconds, increase difficulty by decreasing spawn rate by 10%
        if (newTime % 10 === 0) {
          setSpawnRate(prevRate => {
            const newRate = Math.floor(prevRate * 0.9);
            return Math.max(500, newRate); // Minimum spawn rate of 500ms
          });
        }
        
        return newTime;
      });
    }, 1000); // Run every second

    timerRef.current = difficultyTimerId;

    return () => {
      clearInterval(difficultyTimerId);
    };
  }, [isGameOver]);

  // Game loop for enemy movement and collision detection - now uses positionRef
  useEffect(() => {
    if (isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoopId = setInterval(() => {
      setEnemies(prevEnemies => {
        // Move enemies towards player using current position from ref
        const updatedEnemies = prevEnemies.map(enemy => {
          const enemyRadius = enemy.size / 2;
          // Calculate direction to player using ref position
          const dx = (positionRef.current.x + 20) - (enemy.x + enemyRadius); // Center to center
          const dy = (positionRef.current.y + 20) - (enemy.y + enemyRadius);
          
          // Calculate distance
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize direction and apply movement speed (using individual enemy speed)
          if (distance > 0) {
            const normalizedDx = (dx / distance) * enemy.speed;
            const normalizedDy = (dy / distance) * enemy.speed;
            
            return {
              ...enemy,
              x: enemy.x + normalizedDx,
              y: enemy.y + normalizedDy,
            };
          }
          
          return enemy;
        });

        // Check for collisions using ref position
        const collidedEnemyIds = checkCollisions(updatedEnemies);
        
        if (collidedEnemyIds.length > 0 && !isPlayerInvincible) {
          // Trigger screen shake effect
          triggerScreenShake();
          
          // Set player invincible
          setIsPlayerInvincible(true);
          
          // Clear any existing invincibility timeout
          if (invincibilityTimeoutRef.current) {
            clearTimeout(invincibilityTimeoutRef.current);
          }
          
          // Set timeout to remove invincibility after 1000ms
          invincibilityTimeoutRef.current = setTimeout(() => {
            setIsPlayerInvincible(false);
          }, 1000);
          
          // Decrease health
          setPlayerHealth(prevHealth => {
            const newHealth = prevHealth - collidedEnemyIds.length;
            if (newHealth <= 0) {
              setIsGameOver(true);
            }
            return Math.max(0, newHealth);
          });

          // Reduce enemy health instead of removing them immediately
          return updatedEnemies.map(enemy => {
            if (collidedEnemyIds.includes(enemy.id)) {
              const newHealth = enemy.health - 1;
              return {
                ...enemy,
                health: newHealth,
              };
            }
            return enemy;
          }).filter(enemy => enemy.health > 0); // Only remove enemies with 0 health
        }

        return updatedEnemies;
      });
    }, 16); // ~60 FPS

    gameLoopRef.current = gameLoopId;

    return () => {
      clearInterval(gameLoopId);
    };
  }, [isGameOver, isPlayerInvincible]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      if (spawnerRef.current) {
        clearInterval(spawnerRef.current);
        spawnerRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (invincibilityTimeoutRef.current) {
        clearTimeout(invincibilityTimeoutRef.current);
        invincibilityTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Animated.View 
      ref={containerRef}
      style={[
        styles.container,
        {
          transform: [
            { translateX: shakeAnimation.x },
            { translateY: shakeAnimation.y }
          ]
        }
      ]} 
      {...panResponder.panHandlers}
    >
      <Player 
        ref={playerRef}
        x={initialPlayerPosition.x} 
        y={initialPlayerPosition.y} 
        color="#00FFFF"
        isInvincible={isPlayerInvincible}
      />
      {enemies.map(enemy => (
        <Enemy 
          key={enemy.id}
          x={enemy.x} 
          y={enemy.y} 
          color={enemy.color}
          size={enemy.size}
        />
      ))}
      
      {/* HUD Component */}
      <HUD 
        score={timeElapsed}
        health={playerHealth}
        isPlayerInvincible={isPlayerInvincible}
      />

      {/* Game Over overlay */}
      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.gameOverSubtext}>You survived {timeElapsed} seconds!</Text>
          <Text style={styles.gameOverStats}>Final Score: {timeElapsed * 10} points</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    marginBottom: 8,
  },
  gameOverStats: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});