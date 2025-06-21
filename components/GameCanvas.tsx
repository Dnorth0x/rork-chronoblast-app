import React from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import { StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '@/stores/gameStore';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import XPOrb from './XPOrb';
import ChronoShard from './ChronoShard';
import Explosion from './Explosion';

const { width, height } = Dimensions.get('window');

const GameCanvas: React.FC = () => {
  const { gameState } = useGameStore();

  return (
    <Canvas style={styles.canvas}>
      <Group>
        {/* Render Player */}
        <Player 
          x={gameState.playerPosition.x} 
          y={gameState.playerPosition.y} 
        />
        
        {/* Render Enemies */}
        {gameState.enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            x={enemy.x}
            y={enemy.y}
            size={enemy.size}
            color={enemy.color}
            health={enemy.health}
          />
        ))}
        
        {/* Render Projectiles */}
        {gameState.projectiles.map((projectile) => (
          <Projectile
            key={projectile.id}
            x={projectile.x}
            y={projectile.y}
            size={projectile.size}
            color={projectile.color}
          />
        ))}
        
        {/* Render XP Orbs */}
        {gameState.xpOrbs.map((orb) => (
          <XPOrb
            key={orb.id}
            x={orb.x}
            y={orb.y}
            size={orb.size}
            value={orb.value}
          />
        ))}
        
        {/* Render Chrono Shards */}
        {gameState.chronoShards.map((shard) => (
          <ChronoShard
            key={shard.id}
            x={shard.x}
            y={shard.y}
            size={shard.size}
            value={shard.value}
          />
        ))}
        
        {/* Render Explosions - This is the key addition for the particle system */}
        {gameState.explosions.map((explosion) => (
          <Explosion
            key={explosion.id}
            particles={explosion.particles}
          />
        ))}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width,
    height,
  },
});

export default GameCanvas;