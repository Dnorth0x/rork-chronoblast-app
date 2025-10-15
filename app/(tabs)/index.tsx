import React, { useReducer, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, PanResponder } from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';
import Explosion from '@/components/Explosion';
import Enemy from '@/components/Enemy';
import Projectile from '@/components/Projectile';
import XPOrb from '@/components/XPOrb';
import ChronoShard from '@/components/ChronoShard';
import Player from '@/components/Player';
import HUD from '@/components/HUD';
import { GameEvent } from '@/types/gameState';
import { setEventDispatcher, gameReducer, initialGameState } from '@/game/gameReducer';
import MainMenuScreen from '@/components/MainMenuScreen';

export default function HomeScreen() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [gameStarted, setGameStarted] = React.useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const enemySpawnRef = useRef<NodeJS.Timeout | null>(null);
  const projectileSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const invincibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Event handler
  const onEvent = React.useCallback((event: GameEvent) => {
    switch (event.type) {
      case 'create-explosion':
        console.log('💥 Explosion at:', event.payload.position);
        break;
      case 'enemy_death':
        console.log('☠️ Enemy defeated:', event.payload.enemyType);
        break;
      case 'xp_collected':
        console.log('✨ XP collected:', event.payload.value);
        break;
      case 'level_up':
        console.log('🎉 Level up!', event.payload.newLevel);
        break;
      case 'game_over':
        console.log('💀 Game Over! Score:', event.payload.finalScore);
        setGameStarted(false);
        break;
    }
  }, []);

  useEffect(() => {
    setEventDispatcher(onEvent);
    return () => setEventDispatcher(() => {});
  }, [onEvent]);

  // Handle explosion completion
  const handleExplosionComplete = React.useCallback((explosionId: string) => {
    dispatch({ type: 'REMOVE_EXPLOSION', payload: { id: explosionId } });
  }, []);

  // Touch controls
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => gameStarted,
    onMoveShouldSetPanResponder: () => gameStarted,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      dispatch({ 
        type: 'UPDATE_PLAYER_POSITION', 
        payload: { x: locationX - 20, y: locationY - 20 } 
      });
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      dispatch({ 
        type: 'UPDATE_PLAYER_POSITION', 
        payload: { x: locationX - 20, y: locationY - 20 } 
      });
    },
  });

  // Game loop
  useEffect(() => {
    if (!gameStarted) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (enemySpawnRef.current) clearInterval(enemySpawnRef.current);
      if (projectileSpawnRef.current) clearInterval(projectileSpawnRef.current);
      if (invincibilityTimerRef.current) clearTimeout(invincibilityTimerRef.current);
      return;
    }

    // Main game loop - 60 FPS
    gameLoopRef.current = setInterval(() => {
      dispatch({ type: 'MOVE_ENTITIES' });
      dispatch({ type: 'HANDLE_COLLISIONS' });
      dispatch({ type: 'INCREMENT_TIME' });
    }, 1000 / 60);

    // Enemy spawning
    const spawnEnemy = () => {
      dispatch({ type: 'SPAWN_ENEMY' });
    };
    spawnEnemy(); // Spawn first enemy immediately
    enemySpawnRef.current = setInterval(spawnEnemy, gameState.spawnRate);

    // Projectile spawning
    projectileSpawnRef.current = setInterval(() => {
      dispatch({ type: 'SPAWN_PROJECTILE' });
    }, 500); // Fire every 500ms

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (enemySpawnRef.current) clearInterval(enemySpawnRef.current);
      if (projectileSpawnRef.current) clearInterval(projectileSpawnRef.current);
      if (invincibilityTimerRef.current) clearTimeout(invincibilityTimerRef.current);
    };
  }, [gameStarted, gameState.spawnRate]);

  // Handle invincibility timer
  useEffect(() => {
    if (gameState.isPlayerInvincible) {
      if (invincibilityTimerRef.current) clearTimeout(invincibilityTimerRef.current);
      invincibilityTimerRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PLAYER_INVINCIBLE', payload: false });
      }, 1000); // 1 second invincibility
    }
  }, [gameState.isPlayerInvincible]);

  // Update enemy spawn rate dynamically
  useEffect(() => {
    if (gameStarted && enemySpawnRef.current) {
      clearInterval(enemySpawnRef.current);
      enemySpawnRef.current = setInterval(() => {
        dispatch({ type: 'SPAWN_ENEMY' });
      }, gameState.spawnRate);
    }
  }, [gameState.spawnRate, gameStarted]);

  const handleStartGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <MainMenuScreen onStartGame={handleStartGame} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container} {...panResponder.panHandlers}>
        <Canvas style={styles.canvas}>
          <Fill color="#0a0a1a" />
          
          {/* Player */}
          <Player
            x={gameState.playerPosition.x}
            y={gameState.playerPosition.y}
            radius={20}
            color="#00FFFF"
            isInvincible={gameState.isPlayerInvincible}
          />
          
          {/* Enemies */}
          {gameState.enemies.map(enemy => (
            <Enemy key={enemy.id} enemy={enemy} />
          ))}
          
          {/* Projectiles */}
          {gameState.projectiles.map(projectile => (
            <Projectile
              key={projectile.id}
              x={projectile.x}
              y={projectile.y}
              size={projectile.size}
              color={projectile.color}
            />
          ))}
          
          {/* XP Orbs */}
          {gameState.xpOrbs.map(orb => (
            <XPOrb
              key={orb.id}
              x={orb.x}
              y={orb.y}
              size={orb.size}
              value={orb.value}
            />
          ))}
          
          {/* Chrono Shards */}
          {gameState.chronoShards.map(shard => (
            <ChronoShard
              key={shard.id}
              x={shard.x}
              y={shard.y}
              size={shard.size}
              value={shard.value}
            />
          ))}
          
          {/* Explosions */}
          {gameState.explosions.map(explosion => (
            <Explosion 
              key={explosion.id} 
              explosion={explosion}
              onComplete={handleExplosionComplete}
            />
          ))}
        </Canvas>
        
        <HUD
          health={gameState.playerHealth}
          maxHealth={gameState.maxPlayerHealth}
          level={gameState.playerStats.level}
          xp={gameState.playerStats.xp}
          xpToNextLevel={gameState.playerStats.xpToNextLevel}
          timeElapsed={gameState.timeElapsed}
          onPause={() => setGameStarted(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  canvas: {
    flex: 1,
  },
});