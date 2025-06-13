export const GAME_CONFIG = {
  INITIAL_TIME: 60,
  MAX_TIME_CAP: 90,
  TIME_LOW_THRESHOLD: 15,
  PLAYER_BASE_RADIUS: 16,
  PLAYER_LERP_FACTOR: 0.15, // Reduced from 0.2 for better performance
  PLAYER_PULSE_SPEED: 0.06, // Reduced from 0.08
  PLAYER_PULSE_MAGNITUDE: 2,
  PLAYER_COLLECT_POP_SCALE: 1.2, // Reduced from 1.3
  PLAYER_COLLECT_POP_DURATION: 150, // Reduced from 200
  PLAYER_DASH_STRENGTH: 120, // Reduced from 140
  PLAYER_DASH_DURATION: 150, // Reduced from 180
  PLAYER_DASH_COOLDOWN: 2000, // Reduced from 2500
  MAX_PARTICLES_ON_SCREEN: 18, // Reduced from 25
  INITIAL_PARTICLE_SPAWN_INTERVAL: 1000, // Increased from 800
  MIN_PARTICLE_SPAWN_INTERVAL: 450, // Increased from 350
  SPAWN_INTERVAL_DECREMENT: 10, // Reduced from 12
  SPAWN_RATE_UPDATE_INTERVAL: 6000, // Increased from 5000
  STAR_COUNT: 20, // Reduced from 40
  POWERUP_DURATION: 6000, // Reduced from 7000
  COMBO_TIMEOUT: 2000,
  COMBO_BASE_BONUS: 3,
  PARTICLE_BREATHE_SPEED: 0.02, // Reduced from 0.025
  PARTICLE_BREATHE_MAGNITUDE: 0.04, // Reduced from 0.06
  PERFORMANCE_MODE_THRESHOLD: 35, // Increased from 30 - more lenient
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
    radiusBase: 8, // Reduced from 9
    points: 15, 
    speedRange: [1.0, 2.2], // Reduced from [1.2, 2.5]
    effectParticles: 8, // Reduced from 10
    glow: '#FF00FF', 
    shape: 'crystal',
    spawnWeight: 40
  },
  [PT.FAST]: { 
    colorRange: ['#39FF14', '#00FF7F', '#32CD32'], 
    radiusBase: 6, // Reduced from 7
    points: 25, 
    speedRange: [2.0, 4.0], // Reduced from [2.2, 4.5]
    effectParticles: 6, // Reduced from 8
    glow: '#39FF14', 
    shape: 'crystal',
    spawnWeight: 25
  },
  [PT.LARGE_BONUS]: { 
    colorRange: ['#FFA500', '#FF8C00', '#FFD700'], 
    radiusBase: 11, // Reduced from 13
    points: 60, 
    speedRange: [0.7, 1.6], // Reduced from [0.8, 1.8]
    effectParticles: 12, // Reduced from 15
    glow: '#FFA500', 
    shape: 'crystal',
    spawnWeight: 15
  },
  [PT.TIME_BONUS]: { 
    colorRange: ['#87CEEB', '#ADD8E6', '#B0E0E6'], 
    radiusBase: 7, // Reduced from 8
    points: 5, 
    time: 3, // Reduced from 4
    speedRange: [1.3, 2.8], // Reduced from [1.5, 3.2]
    effectParticles: 10, // Reduced from 12
    glow: '#87CEEB', 
    shape: 'clock',
    spawnWeight: 12
  },
  [PT.SCORE_BOOST]: { 
    colorRange: ['#FFFF00', '#FFEA00', '#FFD700'], 
    radiusBase: 9, // Reduced from 10
    points: 10, 
    speedRange: [1.0, 2.5], // Reduced from [1.2, 2.8]
    effectParticles: 10, // Reduced from 12
    glow: '#FFFF00', 
    shape: 'star', 
    powerUp: PT.SCORE_BOOST,
    spawnWeight: 4
  },
  [PT.SLOW_ENEMY]: { 
    colorRange: ['#4169E1', '#6495ED', '#00BFFF'], 
    radiusBase: 9, // Reduced from 10
    points: 10, 
    speedRange: [0.8, 2.0], // Reduced from [1.0, 2.2]
    effectParticles: 10, // Reduced from 12
    glow: '#00BFFF', 
    shape: 'diamond', 
    powerUp: PT.SLOW_ENEMY,
    spawnWeight: 3
  },
  [PT.CONFUSION_ORB]: { 
    colorRange: ['#9370DB', '#8A2BE2', '#DA70D6'], 
    radiusBase: 8, // Reduced from 9
    points: -5, 
    speedRange: [1.5, 3.2], // Reduced from [1.8, 3.5]
    effectParticles: 8, // Reduced from 10
    glow: '#8A2BE2', 
    shape: 'swirl', 
    powerUp: PT.CONFUSION_ORB,
    spawnWeight: 1
  },
};