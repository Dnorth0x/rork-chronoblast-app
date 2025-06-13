import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_CONFIG, PT, PARTICLE_TYPES } from '@/constants/gameConfig';

interface Particle {
  id: string;
  type: string;
  x: number;
  y: number;
  radiusBase: number;
  radius: number;
  color: string;
  points: number;
  timeBonus: number;
  powerUpType: string | null;
  effectParticleCount: number;
  glowColor: string;
  shape: string;
  isPowerUpParticle: boolean;
  baseSpeed: number;
  baseVx: number;
  baseVy: number;
  rotation: number;
  rotationSpeed: number;
  breatheAngle: number;
  trail: { x: number; y: number }[];
  spawnTime: number;
}

interface CollectEffect {
  id: string;
  x: number;
  y: number;
  color: string;
  particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; decay: number }[];
  spawnTime: number;
}

interface Star {
  id: string;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
  twinklePhase: number;
}

interface PowerUpState {
  active: boolean;
  endTime: number;
}

interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  totalTimeSpent: number;
  bestCombo: number;
  particlesCollected: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  highScore: number;
  gameActive: boolean;
  isPaused: boolean;
  gameStarting: boolean;
  currentParticleSpawnInterval: number;
  particles: Particle[];
  collectionEffects: CollectEffect[];
  backgroundStars: Star[];
  activePowerUps: {
    [PT.SCORE_BOOST]: PowerUpState;
    [PT.SLOW_ENEMY]: PowerUpState;
    [PT.CONFUSION_ORB]: PowerUpState;
  };
  currentCombo: number;
  maxCombo: number;
  lastCollectTime: number;
  gameStartTime: number;
  performanceMode: boolean;
  frameRate: number;
  stats: GameStats;
  player: {
    x: number;
    y: number;
    baseRadius: number;
    radius: number;
    color: string;
    targetX: number;
    targetY: number;
    lerpFactor: number;
    pulseAngle: number;
    pulseSpeed: number;
    pulseMagnitude: number;
    isPopping: boolean;
    popEndTime: number;
    isDashing: boolean;
    dashTargetX: number;
    dashTargetY: number;
    dashEndTime: number;
    dashReady: boolean;
    lastDashStartTime: number;
    invulnerable: boolean;
    invulnerableEndTime: number;
  };
  canvasWidth: number;
  canvasHeight: number;
  setCanvasSize: (width: number, height: number) => void;
  startGame: () => void;
  endGame: () => void;
  togglePause: () => void;
  goToMainMenu: () => void;
  updatePlayerPosition: (x: number, y: number) => void;
  triggerDash: () => boolean;
  updateGame: (deltaTime: number) => void;
  spawnParticle: () => void;
  checkCollisions: () => void;
  activatePowerUp: (type: string) => void;
  updatePerformanceMode: (fps: number) => void;
  resetStats: () => void;
}

const getWeightedRandomParticleType = (): string => {
  const totalWeight = Object.values(PARTICLE_TYPES).reduce((sum, type) => sum + (type.spawnWeight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const [key, type] of Object.entries(PARTICLE_TYPES)) {
    random -= type.spawnWeight || 1;
    if (random <= 0) return key;
  }
  
  return PT.NORMAL;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      timeLeft: GAME_CONFIG.INITIAL_TIME,
      highScore: 0,
      gameActive: false,
      isPaused: false,
      gameStarting: false,
      currentParticleSpawnInterval: GAME_CONFIG.INITIAL_PARTICLE_SPAWN_INTERVAL,
      particles: [],
      collectionEffects: [],
      backgroundStars: [],
      activePowerUps: {
        [PT.SCORE_BOOST]: { active: false, endTime: 0 },
        [PT.SLOW_ENEMY]: { active: false, endTime: 0 },
        [PT.CONFUSION_ORB]: { active: false, endTime: 0 },
      },
      currentCombo: 0,
      maxCombo: 0,
      lastCollectTime: 0,
      gameStartTime: 0,
      performanceMode: false,
      frameRate: 60,
      stats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        totalTimeSpent: 0,
        bestCombo: 0,
        particlesCollected: 0,
      },
      player: {
        x: 0,
        y: 0,
        baseRadius: GAME_CONFIG.PLAYER_BASE_RADIUS,
        radius: GAME_CONFIG.PLAYER_BASE_RADIUS,
        color: '#00FFFF',
        targetX: 0,
        targetY: 0,
        lerpFactor: GAME_CONFIG.PLAYER_LERP_FACTOR,
        pulseAngle: 0,
        pulseSpeed: GAME_CONFIG.PLAYER_PULSE_SPEED,
        pulseMagnitude: GAME_CONFIG.PLAYER_PULSE_MAGNITUDE,
        isPopping: false,
        popEndTime: 0,
        isDashing: false,
        dashTargetX: 0,
        dashTargetY: 0,
        dashEndTime: 0,
        dashReady: true,
        lastDashStartTime: 0,
        invulnerable: false,
        invulnerableEndTime: 0,
      },
      canvasWidth: 0,
      canvasHeight: 0,
      
      setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
      
      startGame: () => {
        const currentTime = Date.now();
        set(state => ({
          score: 0,
          timeLeft: GAME_CONFIG.INITIAL_TIME,
          currentParticleSpawnInterval: GAME_CONFIG.INITIAL_PARTICLE_SPAWN_INTERVAL,
          particles: [],
          collectionEffects: [],
          currentCombo: 0,
          maxCombo: 0,
          lastCollectTime: 0,
          gameActive: true,
          isPaused: false,
          gameStarting: true,
          gameStartTime: currentTime,
          stats: {
            ...state.stats,
            totalGamesPlayed: state.stats.totalGamesPlayed + 1,
          },
        }));
        
        // Initialize background stars
        const { canvasWidth, canvasHeight } = get();
        const stars: Star[] = [];
        for (let i = 0; i < 30; i++) {
          stars.push({
            id: `star-${i}`,
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.8 + 0.2,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            twinklePhase: Math.random() * Math.PI * 2,
          });
        }
        
        set(state => ({
          backgroundStars: stars,
          player: {
            ...state.player,
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            targetX: canvasWidth / 2,
            targetY: canvasHeight / 2,
            isPopping: false,
            isDashing: false,
            dashReady: true,
            lastDashStartTime: 0,
            invulnerable: false,
            invulnerableEndTime: 0,
          },
          activePowerUps: {
            [PT.SCORE_BOOST]: { active: false, endTime: 0 },
            [PT.SLOW_ENEMY]: { active: false, endTime: 0 },
            [PT.CONFUSION_ORB]: { active: false, endTime: 0 },
          },
        }));

        // End game starting phase after a short delay
        setTimeout(() => {
          set(state => ({ gameStarting: false }));
        }, 1000);
      },
      
      endGame: () => {
        set(state => {
          const gameTime = Date.now() - state.gameStartTime;
          const newHighScore = state.score > state.highScore ? state.score : state.highScore;
          const newBestCombo = state.maxCombo > state.stats.bestCombo ? state.maxCombo : state.stats.bestCombo;
          
          return {
            gameActive: false,
            isPaused: false,
            gameStarting: false,
            highScore: newHighScore,
            stats: {
              ...state.stats,
              totalScore: state.stats.totalScore + state.score,
              totalTimeSpent: state.stats.totalTimeSpent + gameTime,
              bestCombo: newBestCombo,
            },
          };
        });
      },
      
      togglePause: () => set(state => ({ isPaused: !state.isPaused })),
      
      goToMainMenu: () => {
        set({
          gameActive: false,
          isPaused: false,
          gameStarting: false,
          score: 0,
          timeLeft: GAME_CONFIG.INITIAL_TIME,
          currentCombo: 0,
          maxCombo: 0,
          particles: [],
          collectionEffects: [],
          backgroundStars: [],
          activePowerUps: {
            [PT.SCORE_BOOST]: { active: false, endTime: 0 },
            [PT.SLOW_ENEMY]: { active: false, endTime: 0 },
            [PT.CONFUSION_ORB]: { active: false, endTime: 0 },
          },
        });
        
        const { canvasWidth, canvasHeight } = get();
        set(state => ({
          player: {
            ...state.player,
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            targetX: canvasWidth / 2,
            targetY: canvasHeight / 2,
            isPopping: false,
            isDashing: false,
            dashReady: true,
            invulnerable: false,
          },
        }));
      },
      
      updatePlayerPosition: (x, y) => set(state => {
        const clampedX = Math.max(state.player.baseRadius, Math.min(state.canvasWidth - state.player.baseRadius, x));
        const clampedY = Math.max(state.player.baseRadius, Math.min(state.canvasHeight - state.player.baseRadius, y));
        
        return {
          player: {
            ...state.player,
            targetX: clampedX,
            targetY: clampedY,
          },
        };
      }),
      
      triggerDash: () => {
        const state = get();
        if (!state.player.dashReady || state.player.isDashing || !state.gameActive || state.isPaused) return false;
        
        const angle = Math.atan2(state.player.targetY - state.player.y, state.player.targetX - state.player.x);
        const distToTarget = Math.hypot(state.player.targetX - state.player.x, state.player.targetY - state.player.y);
        
        let dashTargetX, dashTargetY;
        if (distToTarget < 10) {
          dashTargetX = state.player.x + GAME_CONFIG.PLAYER_DASH_STRENGTH;
          dashTargetY = state.player.y;
        } else {
          dashTargetX = state.player.x + Math.cos(angle) * GAME_CONFIG.PLAYER_DASH_STRENGTH;
          dashTargetY = state.player.y + Math.sin(angle) * GAME_CONFIG.PLAYER_DASH_STRENGTH;
        }
        
        dashTargetX = Math.max(state.player.baseRadius, Math.min(state.canvasWidth - state.player.baseRadius, dashTargetX));
        dashTargetY = Math.max(state.player.baseRadius, Math.min(state.canvasHeight - state.player.baseRadius, dashTargetY));
        
        set(state => ({
          player: {
            ...state.player,
            dashReady: false,
            isDashing: true,
            dashTargetX,
            dashTargetY,
            dashEndTime: Date.now() + GAME_CONFIG.PLAYER_DASH_DURATION,
            lastDashStartTime: Date.now(),
            invulnerable: true,
            invulnerableEndTime: Date.now() + GAME_CONFIG.PLAYER_DASH_DURATION + 100,
          },
        }));
        
        setTimeout(() => {
          set(state => ({
            player: {
              ...state.player,
              dashReady: true,
            },
          }));
        }, GAME_CONFIG.PLAYER_DASH_COOLDOWN);
        
        return true;
      },
      
      updateGame: (deltaTime) => {
        set(state => {
          if (!state.gameActive || state.isPaused || state.gameStarting) return state;
          
          let newTimeLeft = state.timeLeft;
          if (state.timeLeft > 0) {
            newTimeLeft = Math.max(0, state.timeLeft - deltaTime / 1000);
            if (newTimeLeft <= 0) {
              return { ...state, timeLeft: 0, gameActive: false };
            }
          }
          
          const player = { ...state.player };
          const currentTime = Date.now();
          
          // Update player invulnerability
          if (player.invulnerable && currentTime >= player.invulnerableEndTime) {
            player.invulnerable = false;
          }
          
          // Update player movement with optimized lerp factor
          const lerpFactor = state.performanceMode ? player.lerpFactor * 0.8 : player.lerpFactor;
          
          if (player.isDashing) {
            const dashProgress = Math.min(1, (currentTime - player.dashEndTime + GAME_CONFIG.PLAYER_DASH_DURATION) / GAME_CONFIG.PLAYER_DASH_DURATION);
            const easeOut = 1 - Math.pow(1 - dashProgress, 3); // Cubic ease-out
            player.x += (player.dashTargetX - player.x) * 0.4;
            player.y += (player.dashTargetY - player.y) * 0.4;
            
            if (currentTime >= player.dashEndTime) {
              player.isDashing = false;
            }
          } else {
            const dx = player.targetX - player.x;
            const dy = player.targetY - player.y;
            
            if (state.activePowerUps[PT.CONFUSION_ORB].active) {
              player.x -= dx * lerpFactor;
              player.y -= dy * lerpFactor;
            } else {
              player.x += dx * lerpFactor;
              player.y += dy * lerpFactor;
            }
          }
          
          // Clamp player position
          player.x = Math.max(player.baseRadius, Math.min(state.canvasWidth - player.baseRadius, player.x));
          player.y = Math.max(player.baseRadius, Math.min(state.canvasHeight - player.baseRadius, player.y));
          
          // Update player pulse
          player.pulseAngle += player.pulseSpeed;
          if (!player.isPopping && !player.isDashing) {
            player.radius = player.baseRadius + Math.sin(player.pulseAngle) * player.pulseMagnitude;
          }
          
          // Update player pop effect
          if (player.isPopping && currentTime >= player.popEndTime) {
            player.isPopping = false;
          }
          
          // Update particles with performance optimizations
          const speedMultiplier = state.activePowerUps[PT.SLOW_ENEMY].active ? 0.5 : 1;
          const maxParticles = state.performanceMode ? 25 : GAME_CONFIG.MAX_PARTICLES_ON_SCREEN;
          
          const particles = state.particles.slice(0, maxParticles).map(p => {
            const newP = {
              ...p,
              x: p.x + p.baseVx * speedMultiplier,
              y: p.y + p.baseVy * speedMultiplier,
              rotation: p.rotation + p.rotationSpeed,
              breatheAngle: p.breatheAngle + GAME_CONFIG.PARTICLE_BREATHE_SPEED,
              radius: p.radiusBase * (1 + Math.sin(p.breatheAngle) * GAME_CONFIG.PARTICLE_BREATHE_MAGNITUDE),
              trail: [...p.trail.slice(-4), { x: p.x, y: p.y }],
            };
            return newP;
          }).filter(p => {
            const margin = p.radius * 3;
            return !(p.x < -margin || p.x > state.canvasWidth + margin || 
                    p.y < -margin || p.y > state.canvasHeight + margin);
          });
          
          // Update collection effects (limit in performance mode)
          const maxEffects = state.performanceMode ? 5 : 20;
          const collectionEffects = state.collectionEffects
            .slice(0, maxEffects)
            .map(e => ({
              ...e,
              particles: e.particles
                .map(p => ({
                  ...p,
                  x: p.x + p.vx,
                  y: p.y + p.vy,
                  alpha: p.alpha - p.decay,
                  radius: p.radius * 0.97,
                }))
                .filter(p => p.alpha > 0 && p.radius > 0.3),
            }))
            .filter(e => e.particles.length > 0);
          
          // Update background stars
          const backgroundStars = state.backgroundStars.map(s => {
            let x = s.x + s.vx;
            let y = s.y + s.vy;
            
            if (x < -s.radius) x = state.canvasWidth + s.radius;
            if (x > state.canvasWidth + s.radius) x = -s.radius;
            if (y < -s.radius) y = state.canvasHeight + s.radius;
            if (y > state.canvasHeight + s.radius) y = -s.radius;
            
            return { 
              ...s, 
              x, 
              y, 
              twinklePhase: s.twinklePhase + 0.02,
              alpha: s.alpha * (0.8 + 0.4 * Math.sin(s.twinklePhase))
            };
          });
          
          // Update power-ups
          const activePowerUps = { ...state.activePowerUps };
          for (const type in activePowerUps) {
            if (activePowerUps[type].active && currentTime > activePowerUps[type].endTime) {
              activePowerUps[type].active = false;
            }
          }
          
          return {
            ...state,
            timeLeft: newTimeLeft,
            player,
            particles,
            collectionEffects,
            backgroundStars,
            activePowerUps,
          };
        });
      },
      
      spawnParticle: () => {
        set(state => {
          const maxParticles = state.performanceMode ? 20 : GAME_CONFIG.MAX_PARTICLES_ON_SCREEN;
          if (state.particles.length >= maxParticles || !state.canvasWidth || !state.canvasHeight) {
            return state;
          }
          
          const typeKey = getWeightedRandomParticleType();
          const typeDetails = PARTICLE_TYPES[typeKey];
          const radiusBase = typeDetails.radiusBase * (Math.random() * 0.4 + 0.8);
          const color = typeDetails.colorRange[Math.floor(Math.random() * typeDetails.colorRange.length)];
          
          // Spawn from edges with better distribution
          const edge = Math.floor(Math.random() * 4);
          let x, y;
          const margin = radiusBase * 2;
          
          if (edge === 0) { // Top
            x = Math.random() * state.canvasWidth;
            y = -margin;
          } else if (edge === 1) { // Right
            x = state.canvasWidth + margin;
            y = Math.random() * state.canvasHeight;
          } else if (edge === 2) { // Bottom
            x = Math.random() * state.canvasWidth;
            y = state.canvasHeight + margin;
          } else { // Left
            x = -margin;
            y = Math.random() * state.canvasHeight;
          }
          
          // Improved targeting towards center with some randomness
          const centerX = state.canvasWidth / 2;
          const centerY = state.canvasHeight / 2;
          const angleToCenter = Math.atan2(centerY - y, centerX - x);
          const randomOffset = (Math.random() - 0.5) * 0.6;
          const angle = angleToCenter + randomOffset;
          
          const baseSpeed = Math.random() * (typeDetails.speedRange[1] - typeDetails.speedRange[0]) + typeDetails.speedRange[0];
          const baseVx = Math.cos(angle) * baseSpeed;
          const baseVy = Math.sin(angle) * baseSpeed;
          
          const newParticle: Particle = {
            id: Math.random().toString(36).substr(2, 9),
            type: typeKey,
            x,
            y,
            radiusBase,
            radius: radiusBase,
            color,
            points: typeDetails.points,
            timeBonus: typeDetails.time || 0,
            powerUpType: typeDetails.powerUp || null,
            effectParticleCount: typeDetails.effectParticles,
            glowColor: typeDetails.glow || color,
            shape: typeDetails.shape || 'crystal',
            isPowerUpParticle: !!typeDetails.powerUp,
            baseSpeed,
            baseVx,
            baseVy,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.04,
            breatheAngle: Math.random() * Math.PI * 2,
            trail: [],
            spawnTime: Date.now(),
          };
          
          return {
            ...state,
            particles: [...state.particles, newParticle],
          };
        });
      },
      
      checkCollisions: () => {
        set(state => {
          const player = state.player;
          const particles = state.particles;
          let newScore = state.score;
          let newTimeLeft = state.timeLeft;
          let newCombo = state.currentCombo;
          let newMaxCombo = state.maxCombo;
          let newLastCollectTime = state.lastCollectTime;
          let particlesCollected = 0;
          
          const newParticles = [...particles];
          const newCollectionEffects = [...state.collectionEffects];
          const currentTime = Date.now();
          
          // Skip collision detection if player is invulnerable
          if (player.invulnerable) {
            return state;
          }
          
          for (let i = newParticles.length - 1; i >= 0; i--) {
            const p = newParticles[i];
            const dist = Math.hypot(player.x - p.x, player.y - p.y);
            
            if (dist < player.radius + p.radius) {
              // Trigger player pop effect
              player.isPopping = true;
              player.popEndTime = currentTime + GAME_CONFIG.PLAYER_COLLECT_POP_DURATION;
              
              // Calculate points with power-up multipliers
              let actualPoints = p.points;
              if (state.activePowerUps[PT.SCORE_BOOST].active) {
                actualPoints *= 2;
              }
              
              // Handle combo system
              if (currentTime - newLastCollectTime <= GAME_CONFIG.COMBO_TIMEOUT) {
                newCombo++;
              } else {
                newCombo = 1;
              }
              newLastCollectTime = currentTime;
              newMaxCombo = Math.max(newMaxCombo, newCombo);
              
              // Add combo bonus
              let comboBonus = 0;
              if (newCombo > 1) {
                comboBonus = (newCombo - 1) * GAME_CONFIG.COMBO_BASE_BONUS;
                if (state.activePowerUps[PT.SCORE_BOOST].active) {
                  comboBonus *= 2;
                }
                actualPoints += comboBonus;
              }
              
              newScore += actualPoints;
              particlesCollected++;
              
              // Handle time bonus
              if (p.timeBonus > 0) {
                newTimeLeft = Math.min(newTimeLeft + p.timeBonus, GAME_CONFIG.MAX_TIME_CAP);
              }
              
              // Handle power-ups
              if (p.powerUpType) {
                state.activePowerUps[p.powerUpType].active = true;
                state.activePowerUps[p.powerUpType].endTime = currentTime + GAME_CONFIG.POWERUP_DURATION;
              }
              
              // Create collection effect (limit particles in performance mode)
              const effectParticleCount = state.performanceMode ? Math.min(p.effectParticleCount, 5) : p.effectParticleCount;
              newCollectionEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                x: p.x,
                y: p.y,
                color: p.glowColor,
                spawnTime: currentTime,
                particles: Array.from({ length: effectParticleCount }, () => {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 4 + 2;
                  return {
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * (p.radius * 0.4) + 1.5,
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.02,
                  };
                }),
              });
              
              newParticles.splice(i, 1);
            }
          }
          
          return {
            ...state,
            score: newScore,
            timeLeft: newTimeLeft,
            currentCombo: newCombo,
            maxCombo: newMaxCombo,
            lastCollectTime: newLastCollectTime,
            particles: newParticles,
            collectionEffects: newCollectionEffects,
            player: { ...player },
            stats: {
              ...state.stats,
              particlesCollected: state.stats.particlesCollected + particlesCollected,
            },
          };
        });
      },
      
      activatePowerUp: (type) => set(state => ({
        activePowerUps: {
          ...state.activePowerUps,
          [type]: {
            active: true,
            endTime: Date.now() + GAME_CONFIG.POWERUP_DURATION,
          },
        },
      })),
      
      updatePerformanceMode: (fps) => set(state => ({
        frameRate: fps,
        performanceMode: fps < GAME_CONFIG.PERFORMANCE_MODE_THRESHOLD,
      })),
      
      resetStats: () => set(state => ({
        stats: {
          totalGamesPlayed: 0,
          totalScore: 0,
          totalTimeSpent: 0,
          bestCombo: 0,
          particlesCollected: 0,
        },
      })),
    }),
    {
      name: 'chronoBurstGame',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ 
        highScore: state.highScore,
        stats: state.stats,
      }),
    }
  )
);