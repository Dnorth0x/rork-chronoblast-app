import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Text } from 'react-native';
import Player from './Player';
import Enemy from './Enemy';
import { EnemyObject } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  // Use refs for player position to avoid re-renders
  const positionRef = useRef({
    x: screenWidth / 2 - 20, // Center horizontally (minus half player width)
    y: screenHeight / 2 - 20, // Center vertically (minus half player height)
  });
  
  // Ref to the player component for direct native updates
  const playerRef = useRef<View>(null);

  // Initial position state (only used for initial render)
  const [initialPlayerPosition] = useState({
    x: screenWidth / 2 - 20,
    y: screenHeight / 2 - 20,
  });

  const [enemies, setEnemies] = useState<EnemyObject[]>([]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [spawnRate, setSpawnRate] = useState(2000); // milliseconds
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Function to generate random off-screen position
  const generateOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const enemySize = 30; // Enemy diameter
    
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
    
    const position = generateOffScreenPosition();
    const colors = ['#FF00FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newEnemy: EnemyObject = {
      id: `enemy-${enemyIdCounter.current++}`,
      x: position.x,
      y: position.y,
      color: randomColor,
    };

    setEnemies(prevEnemies => [...prevEnemies, newEnemy]);
  };

  // Collision detection function - now uses positionRef instead of state
  const checkCollisions = (enemiesArray: EnemyObject[]) => {
    const playerCenterX = positionRef.current.x + 20; // Player radius is 20
    const playerCenterY = positionRef.current.y + 20;
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
          // Calculate direction to player using ref position
          const dx = (positionRef.current.x + 20) - (enemy.x + 15); // Center to center
          const dy = (positionRef.current.y + 20) - (enemy.y + 15);
          
          // Calculate distance
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize direction and apply movement speed
          if (distance > 0) {
            const moveSpeed = 1.5; // Pixels per frame
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

        // Check for collisions using ref position
        const collidedEnemyIds = checkCollisions(updatedEnemies);
        
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

    gameLoopRef.current = gameLoopId;

    return () => {
      clearInterval(gameLoopId);
    };
  }, [isGameOver]);

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
    };
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Player 
        ref={playerRef}
        x={initialPlayerPosition.x} 
        y={initialPlayerPosition.y} 
        color="#00FFFF" 
      />
      {enemies.map(enemy => (
        <Enemy 
          key={enemy.id}
          x={enemy.x} 
          y={enemy.y} 
          color={enemy.color}
        />
      ))}
      
      {/* Game stats display */}
      <View style={styles.statsContainer}>
        <Text style={styles.healthText}>Health: {playerHealth}</Text>
        <Text style={styles.timeText}>Time: {timeElapsed}s</Text>
        <Text style={styles.enemyText}>Enemies: {enemies.length}</Text>
        <Text style={styles.difficultyText}>Spawn Rate: {spawnRate}ms</Text>
      </View>

      {/* Game Over overlay */}
      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.gameOverSubtext}>You survived {timeElapsed} seconds!</Text>
          <Text style={styles.gameOverStats}>Final Score: {timeElapsed * 10} points</Text>
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
  statsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 150,
  },
  healthText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  enemyText: {
    color: '#FF00FF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  difficultyText: {
    color: '#FFEAA7',
    fontSize: 12,
    fontWeight: '400',
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