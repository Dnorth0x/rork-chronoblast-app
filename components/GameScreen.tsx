import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Text, Animated } from 'react-native';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import XPOrb from './XPOrb';
import ChronoShard from './ChronoShard';
import HUD from './HUD';
import { EnemyObject } from '@/types';
import { enemyData, enemyTypes } from '@/game/enemyData';
import { weaponData } from '@/game/weaponData';
import { useUpgradeStore } from '@/stores/upgradeStore';
import { getUpgradeValue } from '@/game/upgradeData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ProjectileObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  size: number;
  color: string;
  range: number;
  distanceTraveled: number;
}

interface XPOrbObject {
  id: string;
  x: number;
  y: number;
  value: number;
  size: number;
}

interface ChronoShardObject {
  id: string;
  x: number;
  y: number;
  value: number;
  size: number;
}

interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export default function GameScreen() {
  const { addShards, getUpgradeLevel } = useUpgradeStore();
  
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
  const [projectiles, setProjectiles] = useState<ProjectileObject[]>([]);
  const [xpOrbs, setXpOrbs] = useState<XPOrbObject[]>([]);
  const [chronoShards, setChronoShards] = useState<ChronoShardObject[]>([]);
  
  // Apply upgrades to base stats
  const baseHealth = 100 + getUpgradeValue('player_health', getUpgradeLevel('player_health'));
  const [playerHealth, setPlayerHealth] = useState(baseHealth);
  const [maxPlayerHealth] = useState(baseHealth);
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlayerInvincible, setIsPlayerInvincible] = useState(false);
  const [spawnRate, setSpawnRate] = useState(2000); // milliseconds
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const weaponFireRef = useRef<NodeJS.Timeout | null>(null);
  const invincibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enemyIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);
  const xpOrbIdCounter = useRef(0);
  const shardIdCounter = useRef(0);

  // Calculate movement speed with upgrades
  const baseMovementSpeed = 0.8;
  const speedMultiplier = 1 + getUpgradeValue('player_speed', getUpgradeLevel('player_speed'));
  const movementSpeed = baseMovementSpeed * speedMultiplier;

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

  // Function to find nearest enemy
  const findNearestEnemy = () => {
    if (enemies.length === 0) return null;
    
    const playerCenterX = positionRef.current.x + 20;
    const playerCenterY = positionRef.current.y + 20;
    
    let nearestEnemy = enemies[0];
    let nearestDistance = Math.hypot(
      nearestEnemy.x + nearestEnemy.size / 2 - playerCenterX,
      nearestEnemy.y + nearestEnemy.size / 2 - playerCenterY
    );
    
    for (let i = 1; i < enemies.length; i++) {
      const enemy = enemies[i];
      const distance = Math.hypot(
        enemy.x + enemy.size / 2 - playerCenterX,
        enemy.y + enemy.size / 2 - playerCenterY
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    return nearestDistance <= weaponData.basic_orb.range ? nearestEnemy : null;
  };

  // Function to fire projectile
  const fireProjectile = () => {
    if (isGameOver) return;
    
    const nearestEnemy = findNearestEnemy();
    if (!nearestEnemy) return;
    
    const weapon = weaponData.basic_orb;
    const weaponDamage = weapon.damage + getUpgradeValue('weapon_damage', getUpgradeLevel('weapon_damage'));
    
    const playerCenterX = positionRef.current.x + 20;
    const playerCenterY = positionRef.current.y + 20;
    const enemyCenterX = nearestEnemy.x + nearestEnemy.size / 2;
    const enemyCenterY = nearestEnemy.y + nearestEnemy.size / 2;
    
    const angle = Math.atan2(enemyCenterY - playerCenterY, enemyCenterX - playerCenterX);
    const vx = Math.cos(angle) * weapon.speed;
    const vy = Math.sin(angle) * weapon.speed;
    
    const newProjectile: ProjectileObject = {
      id: `projectile-${projectileIdCounter.current++}`,
      x: playerCenterX,
      y: playerCenterY,
      vx,
      vy,
      damage: weaponDamage,
      size: weapon.projectileSize,
      color: weapon.color,
      range: weapon.range,
      distanceTraveled: 0,
    };
    
    setProjectiles(prevProjectiles => [...prevProjectiles, newProjectile]);
  };

  // Function to spawn XP orb
  const spawnXPOrb = (x: number, y: number, value: number) => {
    const newXPOrb: XPOrbObject = {
      id: `xp-${xpOrbIdCounter.current++}`,
      x,
      y,
      value,
      size: 12,
    };
    
    setXpOrbs(prevOrbs => [...prevOrbs, newXPOrb]);
  };

  // Function to spawn ChronoShard
  const spawnChronoShard = (x: number, y: number, value: number) => {
    const newShard: ChronoShardObject = {
      id: `shard-${shardIdCounter.current++}`,
      x,
      y,
      value,
      size: 16,
    };
    
    setChronoShards(prevShards => [...prevShards, newShard]);
  };

  // Function to handle level up
  const handleLevelUp = () => {
    setPlayerStats(prevStats => ({
      level: prevStats.level + 1,
      xp: prevStats.xp - prevStats.xpToNextLevel,
      xpToNextLevel: prevStats.xpToNextLevel + 50,
    }));
  };

  // Collision detection function for player vs enemies
  const checkPlayerEnemyCollisions = (enemiesArray: EnemyObject[]) => {
    const playerCenterX = positionRef.current.x + 20;
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

  // Collision detection function for projectiles vs enemies
  const checkProjectileEnemyCollisions = () => {
    const hitProjectileIds: string[] = [];
    const hitEnemyIds: string[] = [];
    const newXPOrbs: XPOrbObject[] = [];
    const newShards: ChronoShardObject[] = [];

    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        const enemyRadius = enemy.size / 2;
        const enemyCenterX = enemy.x + enemyRadius;
        const enemyCenterY = enemy.y + enemyRadius;
        const projectileRadius = projectile.size / 2;
        
        const distance = Math.hypot(
          projectile.x - enemyCenterX,
          projectile.y - enemyCenterY
        );

        if (distance < projectileRadius + enemyRadius) {
          hitProjectileIds.push(projectile.id);
          
          // Damage enemy
          const updatedEnemy = { ...enemy, health: enemy.health - projectile.damage };
          
          if (updatedEnemy.health <= 0) {
            hitEnemyIds.push(enemy.id);
            
            // Spawn XP orb where enemy died
            const baseXpValue = enemy.type === 'brute' ? 15 : 10;
            const xpMultiplier = 1 + getUpgradeValue('xp_multiplier', getUpgradeLevel('xp_multiplier'));
            const xpValue = Math.floor(baseXpValue * xpMultiplier);
            
            newXPOrbs.push({
              id: `xp-${xpOrbIdCounter.current++}`,
              x: enemyCenterX,
              y: enemyCenterY,
              value: xpValue,
              size: 12,
            });

            // 15% chance to drop ChronoShard
            if (Math.random() < 0.15) {
              const shardValue = enemy.type === 'brute' ? 3 : 1;
              newShards.push({
                id: `shard-${shardIdCounter.current++}`,
                x: enemyCenterX + (Math.random() - 0.5) * 30,
                y: enemyCenterY + (Math.random() - 0.5) * 30,
                value: shardValue,
                size: 16,
              });
            }
          } else {
            // Update enemy health
            setEnemies(prevEnemies => 
              prevEnemies.map(e => e.id === enemy.id ? updatedEnemy : e)
            );
          }
        }
      });
    });

    // Remove hit projectiles
    if (hitProjectileIds.length > 0) {
      setProjectiles(prevProjectiles => 
        prevProjectiles.filter(p => !hitProjectileIds.includes(p.id))
      );
    }

    // Remove defeated enemies
    if (hitEnemyIds.length > 0) {
      setEnemies(prevEnemies => 
        prevEnemies.filter(e => !hitEnemyIds.includes(e.id))
      );
    }

    // Add new XP orbs
    if (newXPOrbs.length > 0) {
      setXpOrbs(prevOrbs => [...prevOrbs, ...newXPOrbs]);
    }

    // Add new ChronoShards
    if (newShards.length > 0) {
      setChronoShards(prevShards => [...prevShards, ...newShards]);
    }
  };

  // Collision detection function for player vs XP orbs
  const checkPlayerXPCollisions = () => {
    const playerCenterX = positionRef.current.x + 20;
    const playerCenterY = positionRef.current.y + 20;
    const playerRadius = 20;
    const collectedOrbIds: string[] = [];
    let totalXP = 0;

    xpOrbs.forEach(orb => {
      const distance = Math.hypot(
        playerCenterX - orb.x,
        playerCenterY - orb.y
      );

      if (distance < playerRadius + orb.size / 2) {
        collectedOrbIds.push(orb.id);
        totalXP += orb.value;
      }
    });

    if (collectedOrbIds.length > 0) {
      // Remove collected orbs
      setXpOrbs(prevOrbs => 
        prevOrbs.filter(orb => !collectedOrbIds.includes(orb.id))
      );

      // Add XP to player
      setPlayerStats(prevStats => {
        const newXP = prevStats.xp + totalXP;
        if (newXP >= prevStats.xpToNextLevel) {
          // Level up!
          setTimeout(handleLevelUp, 0);
        }
        return {
          ...prevStats,
          xp: newXP,
        };
      });
    }
  };

  // Collision detection function for player vs ChronoShards
  const checkPlayerShardCollisions = () => {
    const playerCenterX = positionRef.current.x + 20;
    const playerCenterY = positionRef.current.y + 20;
    const playerRadius = 20;
    const collectedShardIds: string[] = [];
    let totalShards = 0;

    chronoShards.forEach(shard => {
      const distance = Math.hypot(
        playerCenterX - shard.x,
        playerCenterY - shard.y
      );

      if (distance < playerRadius + shard.size / 2) {
        collectedShardIds.push(shard.id);
        totalShards += shard.value;
      }
    });

    if (collectedShardIds.length > 0) {
      // Remove collected shards
      setChronoShards(prevShards => 
        prevShards.filter(shard => !collectedShardIds.includes(shard.id))
      );

      // Add shards to persistent store
      addShards(totalShards);
    }
  };

  // Weapon firing loop with upgrade-modified fire rate
  useEffect(() => {
    if (isGameOver) {
      if (weaponFireRef.current) {
        clearInterval(weaponFireRef.current);
        weaponFireRef.current = null;
      }
      return;
    }

    const baseFireRate = weaponData.basic_orb.fireRate;
    const fireRateReduction = getUpgradeValue('weapon_fire_rate', getUpgradeLevel('weapon_fire_rate'));
    const actualFireRate = Math.max(100, baseFireRate - fireRateReduction);

    const weaponFireId = setInterval(() => {
      fireProjectile();
    }, actualFireRate);
    
    weaponFireRef.current = weaponFireId;

    return () => {
      clearInterval(weaponFireId);
    };
  }, [isGameOver, enemies]);

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

  // Game loop for movement and collision detection
  useEffect(() => {
    if (isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoopId = setInterval(() => {
      // Move enemies towards player
      setEnemies(prevEnemies => {
        const updatedEnemies = prevEnemies.map(enemy => {
          const enemyRadius = enemy.size / 2;
          const dx = (positionRef.current.x + 20) - (enemy.x + enemyRadius);
          const dy = (positionRef.current.y + 20) - (enemy.y + enemyRadius);
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          
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

        // Check for player-enemy collisions
        const collidedEnemyIds = checkPlayerEnemyCollisions(updatedEnemies);
        
        if (collidedEnemyIds.length > 0 && !isPlayerInvincible) {
          triggerScreenShake();
          setIsPlayerInvincible(true);
          
          // Apply invincibility duration upgrade
          const baseDuration = 1000;
          const durationBonus = getUpgradeValue('invincibility_duration', getUpgradeLevel('invincibility_duration'));
          const invincibilityDuration = baseDuration + durationBonus;
          
          if (invincibilityTimeoutRef.current) {
            clearTimeout(invincibilityTimeoutRef.current);
          }
          
          invincibilityTimeoutRef.current = setTimeout(() => {
            setIsPlayerInvincible(false);
          }, invincibilityDuration);
          
          setPlayerHealth(prevHealth => {
            const newHealth = prevHealth - collidedEnemyIds.length;
            if (newHealth <= 0) {
              setIsGameOver(true);
            }
            return Math.max(0, newHealth);
          });

          return updatedEnemies.map(enemy => {
            if (collidedEnemyIds.includes(enemy.id)) {
              const newHealth = enemy.health - 1;
              return {
                ...enemy,
                health: newHealth,
              };
            }
            return enemy;
          }).filter(enemy => enemy.health > 0);
        }

        return updatedEnemies;
      });

      // Move projectiles
      setProjectiles(prevProjectiles => {
        return prevProjectiles.map(projectile => {
          const newX = projectile.x + projectile.vx;
          const newY = projectile.y + projectile.vy;
          const newDistanceTraveled = projectile.distanceTraveled + Math.hypot(projectile.vx, projectile.vy);
          
          return {
            ...projectile,
            x: newX,
            y: newY,
            distanceTraveled: newDistanceTraveled,
          };
        }).filter(projectile => {
          // Remove projectiles that are off-screen or have traveled too far
          const margin = 50;
          const inBounds = projectile.x > -margin && projectile.x < screenWidth + margin &&
                          projectile.y > -margin && projectile.y < screenHeight + margin;
          const inRange = projectile.distanceTraveled < projectile.range;
          return inBounds && inRange;
        });
      });

      // Check projectile-enemy collisions
      checkProjectileEnemyCollisions();

      // Check player-XP orb collisions
      checkPlayerXPCollisions();

      // Check player-ChronoShard collisions
      checkPlayerShardCollisions();
    }, 16); // ~60 FPS

    gameLoopRef.current = gameLoopId;

    return () => {
      clearInterval(gameLoopId);
    };
  }, [isGameOver, isPlayerInvincible, enemies, projectiles, xpOrbs, chronoShards]);

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
      if (weaponFireRef.current) {
        clearInterval(weaponFireRef.current);
        weaponFireRef.current = null;
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

      {projectiles.map(projectile => (
        <Projectile
          key={projectile.id}
          x={projectile.x}
          y={projectile.y}
          size={projectile.size}
          color={projectile.color}
        />
      ))}

      {xpOrbs.map(orb => (
        <XPOrb
          key={orb.id}
          x={orb.x}
          y={orb.y}
          size={orb.size}
          value={orb.value}
        />
      ))}

      {chronoShards.map(shard => (
        <ChronoShard
          key={shard.id}
          x={shard.x}
          y={shard.y}
          size={shard.size}
          value={shard.value}
        />
      ))}
      
      <HUD 
        score={timeElapsed}
        health={playerHealth}
        maxHealth={maxPlayerHealth}
        level={playerStats.level}
        xp={playerStats.xp}
        xpToNextLevel={playerStats.xpToNextLevel}
        isPlayerInvincible={isPlayerInvincible}
      />

      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.gameOverSubtext}>You survived {timeElapsed} seconds!</Text>
          <Text style={styles.gameOverStats}>Final Score: {timeElapsed * 10} points</Text>
          <Text style={styles.gameOverStats}>Level Reached: {playerStats.level}</Text>
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
    marginBottom: 4,
  },
});