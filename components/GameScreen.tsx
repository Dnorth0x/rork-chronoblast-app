import React, { useReducer, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Text, Animated } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import XPOrb from './XPOrb';
import ChronoShard from './ChronoShard';
import HUD from './HUD';
import { gameReducer, initialGameState } from '@/game/gameReducer';
import { useUpgradeStore } from '@/stores/upgradeStore';
import { getUpgradeValue } from '@/game/upgradeData';
import { soundManager } from '@/utils/SoundManager';
import { weaponData } from '@/game/weaponData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const { addShards, getUpgradeLevel } = useUpgradeStore();
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Use refs for player position to avoid re-renders
  const positionRef = useRef({
    x: screenWidth / 2 - 20,
    y: screenHeight / 2 - 20,
  });
  
  const playerRef = useRef<View>(null);
  const containerRef = useRef<View>(null);
  const shakeAnimation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Timer refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const weaponFireRef = useRef<NodeJS.Timeout | null>(null);
  const invincibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound tracking refs
  const lastPlayerLevel = useRef(1);
  const gameStartSoundPlayed = useRef(false);

  // Calculate movement speed with upgrades
  const baseMovementSpeed = 0.8;
  const speedMultiplier = 1 + getUpgradeValue('player_speed', getUpgradeLevel('player_speed'));
  const movementSpeed = baseMovementSpeed * speedMultiplier;

  // Initialize sound manager
  useEffect(() => {
    soundManager.init();
    
    if (!gameStartSoundPlayed.current) {
      soundManager.playSystemSound('game_start');
      gameStartSoundPlayed.current = true;
    }
  }, []);

  // Level up sound effect
  useEffect(() => {
    if (gameState.playerStats.level > lastPlayerLevel.current) {
      soundManager.playSystemSound('level_up');
      lastPlayerLevel.current = gameState.playerStats.level;
    }
  }, [gameState.playerStats.level]);

  // Game over sound effect
  useEffect(() => {
    if (gameState.isGameOver) {
      soundManager.playSystemSound('game_over');
    }
  }, [gameState.isGameOver]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderMove: (event, gestureState) => {
      if (gameState.isGameOver) return;
      
      const newX = Math.max(0, Math.min(screenWidth - 40, gestureState.moveX - 20));
      const newY = Math.max(0, Math.min(screenHeight - 40, gestureState.moveY - 20));
      
      positionRef.current = { x: newX, y: newY };
      dispatch({ type: 'UPDATE_PLAYER_POSITION', payload: { x: newX, y: newY } });

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
    soundManager.play('screen_shake', 0.6);
    
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: { x: -10, y: -5 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: 10, y: 5 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: -8, y: -3 },
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: { x: 8, y: 3 },
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

  // Weapon firing loop with upgrade-modified fire rate
  useEffect(() => {
    if (gameState.isGameOver) {
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
      dispatch({ type: 'SPAWN_PROJECTILE', payload: {} as any });
      soundManager.playGameSound('weapon_fire');
    }, actualFireRate);
    
    weaponFireRef.current = weaponFireId;

    return () => {
      clearInterval(weaponFireId);
    };
  }, [gameState.isGameOver, gameState.enemies]);

  // Enemy spawner loop
  useEffect(() => {
    if (gameState.isGameOver) {
      if (spawnerRef.current) {
        clearInterval(spawnerRef.current);
        spawnerRef.current = null;
      }
      return;
    }

    const spawnerId = setInterval(() => {
      dispatch({ type: 'SPAWN_ENEMY', payload: {} as any });
    }, gameState.spawnRate);
    
    spawnerRef.current = spawnerId;

    return () => {
      clearInterval(spawnerId);
    };
  }, [gameState.spawnRate, gameState.isGameOver]);

  // Timer for elapsed time and difficulty scaling
  useEffect(() => {
    if (gameState.isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const difficultyTimerId = setInterval(() => {
      dispatch({ type: 'INCREMENT_TIME' });
      
      // Play time warning at 30 seconds
      if (gameState.timeElapsed === 29) { // Will be 30 after increment
        soundManager.play('time_warning', 0.8);
      }
    }, 1000);

    timerRef.current = difficultyTimerId;

    return () => {
      clearInterval(difficultyTimerId);
    };
  }, [gameState.isGameOver, gameState.timeElapsed]);

  // Game loop for movement and collision detection
  useEffect(() => {
    if (gameState.isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoopId = setInterval(() => {
      // Move entities
      dispatch({ type: 'MOVE_ENTITIES' });
      
      // Handle collisions
      dispatch({ type: 'HANDLE_COLLISIONS' });
    }, 16); // ~60 FPS

    gameLoopRef.current = gameLoopId;

    return () => {
      clearInterval(gameLoopId);
    };
  }, [gameState.isGameOver]);

  // Handle invincibility timeout
  useEffect(() => {
    if (gameState.isPlayerInvincible) {
      soundManager.play('invincibility', 0.4);
      triggerScreenShake();
      
      const baseDuration = 1000;
      const durationBonus = getUpgradeValue('invincibility_duration', getUpgradeLevel('invincibility_duration'));
      const invincibilityDuration = baseDuration + durationBonus;
      
      if (invincibilityTimeoutRef.current) {
        clearTimeout(invincibilityTimeoutRef.current);
      }
      
      invincibilityTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PLAYER_INVINCIBLE', payload: false });
      }, invincibilityDuration);
    }
  }, [gameState.isPlayerInvincible]);

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
      <Canvas style={styles.gameCanvas}>
        <Player 
          x={gameState.playerPosition.x + 20} 
          y={gameState.playerPosition.y + 20} 
          radius={20}
          color="#00FFFF"
          isInvincible={gameState.isPlayerInvincible}
        />
        
        {gameState.enemies.map(enemy => (
          <Enemy 
            key={enemy.id}
            x={enemy.x + enemy.size / 2} 
            y={enemy.y + enemy.size / 2} 
            color={enemy.color}
            size={enemy.size}
          />
        ))}

        {gameState.projectiles.map(projectile => (
          <Projectile
            key={projectile.id}
            x={projectile.x}
            y={projectile.y}
            size={projectile.size}
            color={projectile.color}
          />
        ))}

        {gameState.xpOrbs.map(orb => (
          <XPOrb
            key={orb.id}
            x={orb.x + orb.size / 2}
            y={orb.y + orb.size / 2}
            size={orb.size}
            value={orb.value}
          />
        ))}

        {gameState.chronoShards.map(shard => (
          <ChronoShard
            key={shard.id}
            x={shard.x + shard.size / 2}
            y={shard.y + shard.size / 2}
            size={shard.size}
            value={shard.value}
          />
        ))}
      </Canvas>
      
      <HUD 
        score={gameState.timeElapsed}
        health={gameState.playerHealth}
        maxHealth={gameState.maxPlayerHealth}
        level={gameState.playerStats.level}
        xp={gameState.playerStats.xp}
        xpToNextLevel={gameState.playerStats.xpToNextLevel}
        isPlayerInvincible={gameState.isPlayerInvincible}
      />

      {gameState.isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.gameOverSubtext}>You survived {gameState.timeElapsed} seconds!</Text>
          <Text style={styles.gameOverStats}>Final Score: {gameState.timeElapsed * 10} points</Text>
          <Text style={styles.gameOverStats}>Level Reached: {gameState.playerStats.level}</Text>
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
  gameCanvas: {
    flex: 1,
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