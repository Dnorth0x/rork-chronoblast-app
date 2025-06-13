export const GAME_CONFIG = {
  INITIAL_TIME: 60,
  MAX_TIME_CAP: 90,
  TIME_LOW_THRESHOLD: 15,
  PLAYER_BASE_RADIUS: 16,
  PLAYER_LERP_FACTOR: 0.2,
  PLAYER_PULSE_SPEED: 0.08,
  PLAYER_PULSE_MAGNITUDE: 2.5,
  PLAYER_COLLECT_POP_SCALE: 1.3,
  PLAYER_COLLECT_POP_DURATION: 200,
  PLAYER_DASH_STRENGTH: 140,
  PLAYER_DASH_DURATION: 180,
  PLAYER_DASH_COOLDOWN: 2500,
  MAX_PARTICLES_ON_SCREEN: 25,
  INITIAL_PARTICLE_SPAWN_INTERVAL: 800,
  MIN_PARTICLE_SPAWN_INTERVAL: 350,
  SPAWN_INTERVAL_DECREMENT: 12,
  SPAWN_RATE_UPDATE_INTERVAL: 5000,
  STAR_COUNT: 40,
  POWERUP_DURATION: 7000,
  COMBO_TIMEOUT: 2000,
  COMBO_BASE_BONUS: 3,
  PARTICLE_BREATHE_SPEED: 0.025,
  PARTICLE_BREATHE_MAGNITUDE: 0.06,
  PERFORMANCE_MODE_THRESHOLD: 30, // FPS threshold for performance mode
};

export const PT = {
  NORMAL: 'NORMAL',
  FAST: 'FAST',
  LARGE_BONUS: 'LARGE_BONUS',
  TIME_BONUS: 'TIME_BONUS',
  SCORE_BOOST: 'SCORE_BOOST',
  SLOW_ENEMY: 'SLOW_ENEMY',
  CONFUSION_ORB: 'CONFUSION_ORB',
};

export const PARTICLE_TYPES = {
  [PT.NORMAL]: { 
    colorRange: ['#FF69B4', '#FF1493', '#FF00FF'], 
    radiusBase: 9, 
    points: 15, 
    speedRange: [1.2, 2.5], 
    effectParticles: 10, 
    glow: '#FF00FF', 
    shape: 'crystal',
    spawnWeight: 40
  },
  [PT.FAST]: { 
    colorRange: ['#39FF14', '#00FF7F', '#32CD32'], 
    radiusBase: 7, 
    points: 25, 
    speedRange: [2.2, 4.5], 
    effectParticles: 8, 
    glow: '#39FF14', 
    shape: 'crystal',
    spawnWeight: 25
  },
  [PT.LARGE_BONUS]: { 
    colorRange: ['#FFA500', '#FF8C00', '#FFD700'], 
    radiusBase: 13, 
    points: 60, 
    speedRange: [0.8, 1.8], 
    effectParticles: 15, 
    glow: '#FFA500', 
    shape: 'crystal',
    spawnWeight: 15
  },
  [PT.TIME_BONUS]: { 
    colorRange: ['#87CEEB', '#ADD8E6', '#B0E0E6'], 
    radiusBase: 8, 
    points: 5, 
    time: 4, 
    speedRange: [1.5, 3.2], 
    effectParticles: 12, 
    glow: '#87CEEB', 
    shape: 'clock',
    spawnWeight: 12
  },
  [PT.SCORE_BOOST]: { 
    colorRange: ['#FFFF00', '#FFEA00', '#FFD700'], 
    radiusBase: 10, 
    points: 10, 
    speedRange: [1.2, 2.8], 
    effectParticles: 12, 
    glow: '#FFFF00', 
    shape: 'star', 
    powerUp: PT.SCORE_BOOST,
    spawnWeight: 4
  },
  [PT.SLOW_ENEMY]: { 
    colorRange: ['#4169E1', '#6495ED', '#00BFFF'], 
    radiusBase: 10, 
    points: 10, 
    speedRange: [1.0, 2.2], 
    effectParticles: 12, 
    glow: '#00BFFF', 
    shape: 'diamond', 
    powerUp: PT.SLOW_ENEMY,
    spawnWeight: 3
  },
  [PT.CONFUSION_ORB]: { 
    colorRange: ['#9370DB', '#8A2BE2', '#DA70D6'], 
    radiusBase: 9, 
    points: -5, 
    speedRange: [1.8, 3.5], 
    effectParticles: 10, 
    glow: '#8A2BE2', 
    shape: 'swirl', 
    powerUp: PT.CONFUSION_ORB,
    spawnWeight: 1
  },
};