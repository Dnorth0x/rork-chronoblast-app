import React, { useReducer, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';
import GameCanvas from '@/components/GameCanvas';
import GameUI from '@/components/GameUI';
import Overlay from '@/components/Overlay';
import Explosion from '@/components/Explosion';
import Enemy from '@/components/Enemy';
import Projectile from '@/components/Projectile';
import XPOrb from '@/components/XPOrb';
import ChronoShard from '@/components/ChronoShard';
import Player from '@/components/Player';
import { Colors } from '@/constants/theme';
import { GameEvent } from '@/types/gameState';
import { setEventDispatcher, gameReducer, initialGameState } from '@/game/gameReducer';

export default function HomeScreen() {
  // Add game state management to access explosions and enemies
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Spawn a single enemy for testing the pipeline
  useEffect(() => {
    if (gameState.enemies.length === 0) {
      dispatch({ type: 'SPAWN_ENEMY' });
    }
  }, [gameState.enemies.length]); // Runs once on mount

  // PHASE 2: Properly typed event handler using SSOT
  const onEvent = React.useCallback((event: GameEvent) => {
    // Handle game events with proper typing
    switch (event.type) {
      case 'create-explosion':
        // VFX system integration - explosion creation is handled in the game reducer
        console.log('Explosion created at:', event.payload.position);
        dispatch({
          type: 'CREATE_EXPLOSION',
          payload: {
            x: event.payload.position.x,
            y: event.payload.position.y,
            color: event.payload.color,
            intensity: event.payload.intensity
          }
        });
        break;
      
      case 'enemy_death':
        console.log('Enemy defeated:', event.payload.enemyType, 'at', event.payload.position);
        break;
      
      case 'player_hit':
        console.log('Player hit by enemy:', event.payload.enemyId, 'damage:', event.payload.damage);
        break;
      
      case 'weapon_fire':
        console.log('Weapon fired:', event.payload.projectileId);
        break;
      
      case 'xp_collected':
        console.log('XP collected:', event.payload.value, 'from orb:', event.payload.orbId);
        break;
      
      case 'shard_collected':
        console.log('Chrono shard collected:', event.payload.value);
        break;
      
      case 'level_up':
        console.log('Player leveled up to:', event.payload.newLevel);
        break;
      
      case 'game_over':
        console.log('Game over! Final score:', event.payload.finalScore, 'Time survived:', event.payload.survivalTime);
        break;
      
      case 'power_up_activated':
        console.log('Power-up activated:', event.payload.powerUpType, 'duration:', event.payload.duration);
        break;
      
      default:
        console.log('Unhandled event:', event.type);
        break;
    }
  }, []);

  // Set up event dispatcher on component mount
  React.useEffect(() => {
    setEventDispatcher(onEvent);
    
    // Cleanup on unmount
    return () => {
      setEventDispatcher(() => {});
    };
  }, [onEvent]);

  // Handle explosion completion
  const handleExplosionComplete = React.useCallback((explosionId: string) => {
    dispatch({ type: 'REMOVE_EXPLOSION', payload: { id: explosionId } });
  }, []);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'ChronoBurst',
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Fill color={Colors.primary} />
          
          {/* Render player */}
          <Player
            x={gameState.playerPosition.x}
            y={gameState.playerPosition.y}
            radius={20}
            color="#38BDF8"
            isInvincible={gameState.isPlayerInvincible}
          />
          
          {/* Render enemies */}
          {gameState.enemies.map(enemy => (
            <Enemy key={enemy.id} enemy={enemy} />
          ))}
          
          {/* Render projectiles */}
          {gameState.projectiles.map(projectile => (
            <Projectile
              key={projectile.id}
              x={projectile.x}
              y={projectile.y}
              size={projectile.size}
              color={projectile.color}
            />
          ))}
          
          {/* Render XP orbs */}
          {gameState.xpOrbs.map(orb => (
            <XPOrb
              key={orb.id}
              x={orb.x}
              y={orb.y}
              size={orb.size}
              value={orb.value}
            />
          ))}
          
          {/* Render chrono shards */}
          {gameState.chronoShards.map(shard => (
            <ChronoShard
              key={shard.id}
              x={shard.x}
              y={shard.y}
              size={shard.size}
              value={shard.value}
            />
          ))}
          
          {/* Render self-animating explosions */}
          {gameState.explosions.map(explosion => (
            <Explosion 
              key={explosion.id} 
              explosion={explosion}
              onComplete={handleExplosionComplete}
            />
          ))}
        </Canvas>
        <View style={styles.gameContent}>
          <GameCanvas />
          <GameUI />
          <Overlay />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gameContent: {
    flex: 1,
    zIndex: 1,
  },
});