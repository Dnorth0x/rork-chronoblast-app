export interface EnemyObject {
  id: string;
  x: number;
  y: number;
  color: string;
  type: string;
  health: number;
  speed: number;
  size: number;
}

export interface ProjectileObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  size: number;
  color: string;
  range: number;
  distanceTraveled: number;
}

export interface XPOrbObject {
  id: string;
  x: number;
  y: number;
  value: number;
  size: number;
}

export interface ChronoShardObject {
  id: string;
  x: number;
  y: number;
  value: number;
  size: number;
}

export interface ExplosionParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface ExplosionObject {
  id: string;
  x: number;
  y: number;
  particles: ExplosionParticle[];
  createdAt: number;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface GameState {
  // Player state
  playerPosition: PlayerPosition;
  playerHealth: number;
  maxPlayerHealth: number;
  playerStats: PlayerStats;
  isPlayerInvincible: boolean;
  
  // Game entities
  enemies: EnemyObject[];
  projectiles: ProjectileObject[];
  xpOrbs: XPOrbObject[];
  chronoShards: ChronoShardObject[];
  explosions: ExplosionObject[];
  
  // Game status
  isGameOver: boolean;
  timeElapsed: number;
  spawnRate: number;
  
  // Counters for ID generation
  enemyIdCounter: number;
  projectileIdCounter: number;
  xpOrbIdCounter: number;
  shardIdCounter: number;
  explosionIdCounter: number;
}

// Action types
export type GameAction =
  | { type: 'UPDATE_PLAYER_POSITION'; payload: PlayerPosition }
  | { type: 'SPAWN_ENEMY'; payload: EnemyObject }
  | { type: 'SPAWN_PROJECTILE'; payload: ProjectileObject }
  | { type: 'SPAWN_XP_ORB'; payload: XPOrbObject }
  | { type: 'SPAWN_CHRONO_SHARD'; payload: ChronoShardObject }
  | { type: 'CREATE_EXPLOSION'; payload: { x: number; y: number; color?: string } }
  | { type: 'UPDATE_ENEMIES'; payload: EnemyObject[] }
  | { type: 'UPDATE_PROJECTILES'; payload: ProjectileObject[] }
  | { type: 'UPDATE_EXPLOSIONS' }
  | { type: 'REMOVE_PROJECTILES'; payload: string[] }
  | { type: 'REMOVE_ENEMIES'; payload: string[] }
  | { type: 'REMOVE_XP_ORBS'; payload: string[] }
  | { type: 'REMOVE_CHRONO_SHARDS'; payload: string[] }
  | { type: 'REMOVE_EXPLOSIONS'; payload: string[] }
  | { type: 'DAMAGE_PLAYER'; payload: number }
  | { type: 'SET_PLAYER_INVINCIBLE'; payload: boolean }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'INCREMENT_TIME' }
  | { type: 'UPDATE_SPAWN_RATE'; payload: number }
  | { type: 'MOVE_ENTITIES' }
  | { type: 'HANDLE_COLLISIONS' }
  | { type: 'RESET_GAME' };