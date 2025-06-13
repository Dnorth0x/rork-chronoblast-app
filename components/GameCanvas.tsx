import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Platform, Text, Animated } from 'react-native';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { GAME_CONFIG } from '@/constants/gameConfig';

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

  // Throttle player position updates to improve performance - increased throttling
  const throttledUpdatePlayerPosition = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastPlayerUpdateTime.current > 32) { // Reduced from 16ms to 32ms (30fps instead of 60fps)
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
      // Timer interval - reduced frequency
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        if (!gameActive || isPaused || gameStarting) return;
        useGameStore.setState(state => ({
          timeLeft: Math.max(0, state.timeLeft - 0.02), // Reduced from 0.01 to 0.02
          gameActive: state.timeLeft > 0.02 ? state.gameActive : false,
        }));
      }, 20); // Increased from 10ms to 20ms

      // Particle spawner
      if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
      const createSpawner = () => {
        if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
        particleSpawnerInterval.current = setInterval(() => {
          if (gameActive && !isPaused && !gameStarting) spawnParticle();
        }, useGameStore.getState().currentParticleSpawnInterval);
      };
      createSpawner();

      // Spawn rate updater
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
      }, GAME_CONFIG.SPAWN_RATE_UPDATE_INTERVAL);
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (particleSpawnerInterval.current) clearInterval(particleSpawnerInterval.current);
      if (spawnRateUpdateInterval.current) clearInterval(spawnRateUpdateInterval.current);
    };
  }, [gameActive, isPaused, gameStarting, spawnParticle]);

  // Canvas rendering for web
  useEffect(() => {
    if (Platform.OS === 'web' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Set canvas size
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Render background stars (if not in performance mode)
        if (!performanceMode) {
          backgroundStars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = 'rgba(220,220,255,0.6)';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }

        // Render particles
        particles.forEach(particle => {
          ctx.save();
          
          // Create gradient for particle
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.7, particle.color + '80');
          gradient.addColorStop(1, particle.glowColor + '30');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect for power-up particles
          if (particle.isPowerUpParticle) {
            ctx.strokeStyle = particle.glowColor;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          ctx.restore();
        });

        // Render collection effects
        collectionEffects.forEach(effect => {
          effect.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha * 0.9;
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        });

        // Render player
        const equippedPlayerSkin = getEquippedItem('player');
        const playerColors = equippedPlayerSkin?.colors || ['#00FFFF', '#00CCCC', '#008B8B'];
        
        const currentRadius = player.isPopping && Date.now() < player.popEndTime
          ? player.baseRadius * (1 + (GAME_CONFIG.PLAYER_COLLECT_POP_SCALE - 1) * Math.sin((1 - (player.popEndTime - Date.now()) / GAME_CONFIG.PLAYER_COLLECT_POP_DURATION) * Math.PI))
          : player.radius;
        
        const dashElongationFactor = player.isDashing ? 1 + 0.4 * Math.sin(((Date.now() - player.dashEndTime + GAME_CONFIG.PLAYER_DASH_DURATION) / GAME_CONFIG.PLAYER_DASH_DURATION) * Math.PI) : 1;

        // Rainbow effect for legendary skin
        const isRainbow = equippedPlayerSkin?.effect === 'rainbow';
        const rainbowColor = isRainbow 
          ? playerColors[Math.floor((Date.now() / 150) % playerColors.length)]
          : playerColors[0];

        // Invulnerability effect
        const isInvulnerable = player.invulnerable && Date.now() < player.invulnerableEndTime;
        const invulnerabilityAlpha = isInvulnerable ? 0.6 + 0.4 * Math.sin(Date.now() * 0.02) : 1;

        ctx.save();
        ctx.globalAlpha = invulnerabilityAlpha;
        
        // Create player gradient
        const playerGradient = ctx.createRadialGradient(
          player.x, player.y, 0,
          player.x, player.y, currentRadius
        );
        playerGradient.addColorStop(0, rainbowColor);
        playerGradient.addColorStop(0.6, playerColors[1] || rainbowColor);
        playerGradient.addColorStop(1, (playerColors[2] || rainbowColor) + '4D');
        
        ctx.fillStyle = playerGradient;
        ctx.beginPath();
        ctx.ellipse(
          player.x, 
          player.y, 
          currentRadius * dashElongationFactor, 
          currentRadius / dashElongationFactor, 
          0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Player stroke
        ctx.strokeStyle = rainbowColor;
        ctx.lineWidth = isInvulnerable ? 2 : 1;
        ctx.stroke();
        
        // Dash trail effect
        if (player.isDashing) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = rainbowColor;
          ctx.beginPath();
          ctx.arc(
            player.x - (player.dashTargetX - player.x) * 0.3,
            player.y - (player.dashTargetY - player.y) * 0.3,
            currentRadius * 0.6,
            0, Math.PI * 2
          );
          ctx.fill();
        }
        
        ctx.restore();
      };

      render();
    }
  }, [
    canvasWidth, canvasHeight, player, particles, collectionEffects, 
    backgroundStars, performanceMode, getEquippedItem
  ]);

  // Game loop with performance optimizations - reduced frequency
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastUpdate) setLastUpdate(timestamp);
      const deltaTime = timestamp - lastUpdate;
      setLastUpdate(timestamp);
      
      // FPS calculation (less frequent updates)
      setFrameCount(prev => prev + 1);
      if (timestamp - lastFpsUpdate > 2000) { // Increased from 1000ms to 2000ms
        const fps = frameCount / ((timestamp - lastFpsUpdate) / 1000);
        updatePerformanceMode(fps);
        setFrameCount(0);
        setLastFpsUpdate(timestamp);
      }
      
      if (gameActive && !isPaused && !gameStarting) {
        updateGame(deltaTime);
        checkCollisions();
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
  }, [gameActive, isPaused, gameStarting, updateGame, checkCollisions, lastUpdate, frameCount, lastFpsUpdate, updatePerformanceMode]);

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

  // Mobile rendering using React Native components
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.gameArea}>
        {/* Background Stars */}
        {!performanceMode && backgroundStars.map(star => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.radius * 2,
                height: star.radius * 2,
                opacity: star.alpha,
              }
            ]}
          />
        ))}

        {/* Particles */}
        {particles.map(particle => (
          <View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x - particle.radius,
                top: particle.y - particle.radius,
                width: particle.radius * 2,
                height: particle.radius * 2,
                backgroundColor: particle.color,
                borderColor: particle.isPowerUpParticle ? particle.glowColor : 'transparent',
                borderWidth: particle.isPowerUpParticle ? 2 : 0,
                shadowColor: particle.glowColor,
                shadowOpacity: 0.8,
                shadowRadius: particle.radius * 0.5,
              }
            ]}
          />
        ))}

        {/* Collection Effects */}
        {collectionEffects.map(effect => 
          effect.particles.map((p, index) => (
            <View
              key={`${effect.id}-${index}`}
              style={[
                styles.effectParticle,
                {
                  left: p.x - p.radius,
                  top: p.y - p.radius,
                  width: p.radius * 2,
                  height: p.radius * 2,
                  backgroundColor: effect.color,
                  opacity: p.alpha,
                }
              ]}
            />
          ))
        )}

        {/* Player */}
        <View
          style={[
            styles.player,
            {
              left: player.x - player.radius,
              top: player.y - player.radius,
              width: player.radius * 2,
              height: player.radius * 2,
              backgroundColor: getEquippedItem('player')?.colors?.[0] || '#00FFFF',
              opacity: player.invulnerable ? 0.7 : 1,
              transform: [
                { 
                  scale: player.isPopping && Date.now() < player.popEndTime 
                    ? GAME_CONFIG.PLAYER_COLLECT_POP_SCALE 
                    : 1 
                },
                {
                  scaleX: player.isDashing ? 1.4 : 1
                },
                {
                  scaleY: player.isDashing ? 0.7 : 1
                }
              ],
            }
          ]}
        />
      </View>
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
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(220,220,255,0.6)',
    borderRadius: 50,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  effectParticle: {
    position: 'absolute',
    borderRadius: 50,
  },
  player: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
});

export default GameCanvas;