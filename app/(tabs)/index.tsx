import React, { useReducer, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';
import GameCanvas from '@/components/GameCanvas';
import GameUI from '@/components/GameUI';
import Overlay from '@/components/Overlay';
import Explosion from '@/components/Explosion';
import { Colors } from '@/constants/theme';
import { GameEvent } from '@/types/gameState';
import { setEventDispatcher, gameReducer, initialGameState } from '@/game/gameReducer';

export default function HomeScreen() {
  // Add game state management to access explosions
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

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