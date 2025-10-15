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

// PHASE 1: Single Source of Truth for Game Events
export type GameEvent =
  | { type: 'player_hit'; payload: { damage: number; enemyId: string } }
  | { type: 'enemy_hit'; payload: { enemyId: string; damage: number; projectileId: string } }
  | { type: 'enemy_death'; payload: { enemyId: string; position: { x: number; y: number }; enemyType: string } }
  | { type: 'weapon_fire'; payload: { projectileId: string; position: { x: number; y: number } } }
  | { type: 'create-explosion'; payload: { position: { x: number; y: number }; color?: string; intensity?: number } }
  | { type: 'xp_collected'; payload: { orbId: string; value: number; position: { x: number; y: number } } }
  | { type: 'shard_collected'; payload: { shardId: string; value: number; position: { x: number; y: number } } }
  | { type: 'level_up'; payload: { newLevel: number; position: { x: number; y: number } } }
  | { type: 'power_up_activated'; payload: { powerUpType: string; duration: number } }
  | { type: 'game_over'; payload: { finalScore: number; survivalTime: number } };

// Action types with proper event integration
export type GameAction =
  | { type: 'UPDATE_PLAYER_POSITION'; payload: PlayerPosition }
  | { type: 'SPAWN_ENEMY'; payload?: Partial<EnemyObject> }
  | { type: 'SPAWN_PROJECTILE'; payload?: Partial<ProjectileObject> }
  | { type: 'SPAWN_XP_ORB'; payload: XPOrbObject }
  | { type: 'SPAWN_CHRONO_SHARD'; payload: ChronoShardObject }
  | { type: 'CREATE_EXPLOSION'; payload: { x: number; y: number; color?: string; intensity?: number } }
  | { type: 'REMOVE_EXPLOSION'; payload: { id: string } }
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
  | { type: 'RESET_GAME' }
  | { type: 'DISPATCH_EVENT'; payload: GameEvent };