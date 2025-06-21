import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Platform, Text } from 'react-native';
import { Canvas, Circle, Rect, Fill } from '@shopify/react-native-skia';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { GAME_CONFIG } from '@/constants/gameConfig';
import { Audio } from 'expo-av';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import XPOrb from './XPOrb';
import ChronoShard from './ChronoShard';
import Explosion from './Explosion';

// Sound Manager for Game Events
class GameSoundManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private initialized = false;

  async init() {
    if (Platform.OS === 'web' || this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
    } catch (error) {
      console.log('Game sound initialization failed:', error);
    }
  }

  async play(soundName: string, volume: number = 0.5) {
    if (Platform.OS === 'web' || !this.initialized) return;
    
    try {
      // Create different sound patterns for different events
      let frequency = 440;
      let duration = 200;
      
      switch (soundName) {
        case 'particle_collect':
          frequency = 800;
          duration = 150;
          break;
        case 'power_up':
          frequency = 1200;
          duration = 300;
          break;
        case 'dash':
          frequency = 600;
          duration = 100;
          break;
        case 'combo':
          frequency = 1000;
          duration = 250;
          break;
        case 'explosion':
          frequency = 200;
          duration = 400;
          break;
        case 'game_over':
          frequency = 300;
          duration = 500;
          break;
        case 'time_warning':
          frequency = 400;
          duration = 200;
          break;
      }
      
      // Simple beep sound generation (in a real app, you'd use actual sound files)
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT` },
        { shouldPlay: false, volume }
      );
      
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Game sound play failed:', error);
    }
  }
}

const gameSoundManager = new GameSoundManager();

const GameCanvas: React.FC = () => {
  const {
    player,
    particles,
    collectionEffects,
    backgroundStars,
    gameActive,
    isPaused,
    gameStarting,
    canvasWidth,
    canvasHeight,
    performanceMode,
    score,
    timeLeft,
    currentCombo,
    setCanvasSize,
    updatePlayerPosition,
    updateGame,
    checkCollisions,
    spawnParticle,
    updatePerformanceMode,
  } = useGameStore();
  
  const { getEquippedItem } = useCosmeticsStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [lastFpsUpdate, setLastFpsUpdate] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const particleSpawnerInterval = useRef<NodeJS.Timeout | null>(null);
  const spawnRateUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPlayerUpdateTime = useRef<number>(0);
  const frameSkipCounter = useRef<number>(0);
  const collisionCheckCounter = useRef<number>(0);
  
  // Sound tracking refs
  const lastScore = useRef<number>(0);
  const lastCombo = useRef<number>(0);
  const lastTimeLeft = useRef<number>(0);
  const timeWarningPlayed = useRef<boolean>(false);

  // Initialize sound manager
  useEffect(() => {
    gameSoundManager.init();
  }, []);

  // Sound effect triggers
  useEffect(() => {
    // Score increase (particle collection)
    if (score > lastScore.current && gameActive && !isPaused) {
      gameSoundManager.play('particle_collect', 0.3);
      lastScore.current = score;
    }
  }, [score, gameActive, isPaused]);

  useEffect(() => {
    // Combo sound
    if (currentCombo > lastCombo.current && currentCombo > 1 && gameActive && !isPaused) {
      gameSoundManager.play('combo', 0.4);
      lastCombo.current = currentCombo;
    }
  }, [currentCombo, gameActive, isPaused]);

  useEffect(() => {
    // Time warning
    if (timeLeft <= GAME_CONFIG.TIME_LOW_THRESHOLD && timeLeft > 0 && !timeWarningPlayed.current && gameActive && !isPaused) {
      gameSoundManager.play('time_warning', 0.6);
      timeWarningPlayed.current = true;
    }
    
    // Reset time warning when game restarts
    if (timeLeft > GAME_CONFIG.TIME_LOW_THRESHOLD) {
      timeWarningPlayed.current = false;
    }
    
    lastTimeLeft.current = timeLeft;
  }, [timeLeft, gameActive, isPaused]);

  useEffect(() => {
    // Game over sound
    if (!gameActive && !isPaused && !gameStarting && score > 0) {
      gameSoundManager.play('game_over', 0.5);
    }
  }, [gameActive, isPaused, gameStarting, score]);

  // Dash sound effect
  useEffect(() => {
    if (player.isDashing && gameActive && !isPaused) {
      gameSoundManager.play('dash', 0.4);
    }
  }, [player.isDashing, gameActive, isPaused]);

  // Heavily throttle player position updates to improve performance
  const throttledUpdatePlayerPosition = useCallback((x: number, y: number) => {
    const now = Date.now();
    // Increased throttling from 50ms to 100ms (10fps instead of 20fps)
    if (now - lastPlayerUpdateTime.current > 100) {
      updatePlayerPosition(x, y);
      lastPlayerUpdateTime.current = now;
    }
  }, [updatePlayerPosition]);

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setCanvasSize(width, height);
  }, [setCanvasSize]);

  useEffect(() => {
    if (gameActive && !isPaused && !gameStarting) {
      // Timer interval - reduced frequency significantly
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        if (!gameActive || isPaused || gameStarting) return;
        useGameStore.setState(state => ({
          timeLeft: Math.max(0, state.timeLeft - 0.05), // Increased from 0.03 to 0.05
          gameActive: state.timeLeft > 0.05 ? state.gameActive : false,
        }));
      }, 50); // Increased from 30ms to 50ms

      // Particle spawner with performance-based adjustment
      if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
      const createSpawner = () => {
        if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
        const baseInterval = useGameStore.getState().currentParticleSpawnInterval;
        const adjustedInterval = performanceMode ? baseInterval * 2 : baseInterval * 1.2; // More aggressive throttling
        particleSpawnerInterval.current = setInterval(() => {
          if (gameActive && !isPaused && !gameStarting) spawnParticle();
        }, adjustedInterval);
      };
      createSpawner();

      // Spawn rate updater - less frequent updates
      if (spawnRateUpdateInterval.current) clearInterval(spawnRateUpdateInterval.current);
      spawnRateUpdateInterval.current = setInterval(() => {
        if (gameActive && !isPaused && !gameStarting) {
          const currentInterval = useGameStore.getState().currentParticleSpawnInterval;
          if (currentInterval > GAME_CONFIG.MIN_PARTICLE_SPAWN_INTERVAL) {
            useGameStore.setState({
              currentParticleSpawnInterval: Math.max(
                GAME_CONFIG.MIN_PARTICLE_SPAWN_INTERVAL,
                currentInterval - GAME_CONFIG.SPAWN_INTERVAL_DECREMENT
              ),
            });
            createSpawner();
          }
        }
      }, GAME_CONFIG.SPAWN_RATE_UPDATE_INTERVAL * 1.5); // 50% longer intervals
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
      if (spawnRateUpdateInterval.current) clearInterval(spawnRateUpdateInterval.current);
    };
  }, [gameActive, isPaused, gameStarting, spawnParticle, performanceMode]);

  // Optimized game loop with aggressive frame skipping
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastUpdate) setLastUpdate(timestamp);
      const deltaTime = timestamp - lastUpdate;
      setLastUpdate(timestamp);
      
      // More aggressive frame skipping
      frameSkipCounter.current++;
      const shouldSkipFrame = performanceMode ? frameSkipCounter.current % 3 === 0 : frameSkipCounter.current % 2 === 0;
      
      if (!shouldSkipFrame) {
        // FPS calculation (less frequent updates)
        setFrameCount(prev => prev + 1);
        if (timestamp - lastFpsUpdate > 4000) { // Increased from 3000ms to 4000ms
          const fps = frameCount / ((timestamp - lastFpsUpdate) / 1000);
          updatePerformanceMode(fps);
          setFrameCount(0);
          setLastFpsUpdate(timestamp);
        }
        
        if (gameActive && !isPaused && !gameStarting) {
          updateGame(deltaTime);
          
          // Reduce collision check frequency significantly
          collisionCheckCounter.current++;
          const shouldCheckCollisions = performanceMode 
            ? collisionCheckCounter.current % 5 === 0 
            : collisionCheckCounter.current % 2 === 0;
          
          if (shouldCheckCollisions) {
            checkCollisions();
          }
        }
      }
      
      if (gameActive || isPaused || gameStarting) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    if (gameActive || isPaused || gameStarting) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameActive, isPaused, gameStarting, updateGame, checkCollisions, lastUpdate, frameCount, lastFpsUpdate, updatePerformanceMode, performanceMode]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => gameActive && !isPaused && !gameStarting,
    onMoveShouldSetPanResponder: () => gameActive && !isPaused && !gameStarting,
    onPanResponderGrant: (evt) => {
      throttledUpdatePlayerPosition(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
    },
    onPanResponderMove: (evt) => {
      throttledUpdatePlayerPosition(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
    },
  });

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        <canvas
          ref={canvasRef}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#1a1a2e',
          }}
        />
        <View style={styles.webOverlay}>
          <View style={styles.webFallbackContent}>
            <View style={styles.webFallbackIconContainer}>
              <Text style={styles.webFallbackIcon}>🎮</Text>
            </View>
            <Text style={styles.webFallbackText}>
              ChronoBurst is optimized for mobile devices. For the best experience, please use a mobile device or tablet.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Mobile rendering using Skia Canvas
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Canvas style={[styles.gameArea, { width: canvasWidth, height: canvasHeight }]}>
        {/* Background */}
        <Fill color="#1a1a2e" />
        
        {/* Background Stars - Skip in performance mode */}
        {!performanceMode && backgroundStars.slice(0, 15).map(star => (
          <Circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            color="rgba(220,220,255,0.6)"
            opacity={star.alpha}
          />
        ))}

        {/* Particles - aggressive limiting for performance */}
        {(performanceMode ? particles.slice(0, 10) : particles.slice(0, 15)).map(particle => (
          <Circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.radius}
            color={particle.color}
          />
        ))}

        {/* Collection Effects - skip in performance mode */}
        {!performanceMode && collectionEffects.slice(0, 2).map(effect => 
          effect.particles.slice(0, 5).map((p, index) => (
            <Circle
              key={`${effect.id}-${index}`}
              cx={p.x}
              cy={p.y}
              r={p.radius}
              color={effect.color}
              opacity={p.alpha}
            />
          ))
        )}

        {/* Player - Always visible and properly positioned */}
        <Player
          x={player.x}
          y={player.y}
          radius={player.radius}
          color={getEquippedItem('player')?.colors?.[0] || '#00FFFF'}
          isInvincible={player.invulnerable}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    pointerEvents: 'none',
  },
  webFallbackContent: {
    alignItems: 'center',
    maxWidth: 400,
    padding: 40,
  },
  webFallbackIconContainer: {
    marginBottom: 20,
  },
  webFallbackIcon: {
    fontSize: 64,
    color: '#e0e0e0',
  },
  webFallbackText: {
    color: '#e0e0e0',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
});

export default GameCanvas;