import { Dimensions } from 'react-native';
import { GameState, GameAction, EnemyObject, ProjectileObject } from '@/types/gameState';
import { enemyData, enemyTypes } from './enemyData';
import { weaponData } from './weaponData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const initialGameState: GameState = {
  playerPosition: {
    x: screenWidth / 2 - 20,
    y: screenHeight / 2 - 20,
  },
  playerHealth: 100,
  maxPlayerHealth: 100,
  playerStats: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
  },
  isPlayerInvincible: false,
  enemies: [],
  projectiles: [],
  xpOrbs: [],
  chronoShards: [],
  isGameOver: false,
  timeElapsed: 0,
  spawnRate: 2000,
  enemyIdCounter: 0,
  projectileIdCounter: 0,
  xpOrbIdCounter: 0,
  shardIdCounter: 0,
};

// Helper functions for game logic
const generateOffScreenPosition = (enemySize: number) => {
  const side = Math.floor(Math.random() * 4);
  
  switch (side) {
    case 0: // Top
      return { x: Math.random() * screenWidth, y: -enemySize };
    case 1: // Right
      return { x: screenWidth + enemySize, y: Math.random() * screenHeight };
    case 2: // Bottom
      return { x: Math.random() * screenWidth, y: screenHeight + enemySize };
    case 3: // Left
      return { x: -enemySize, y: Math.random() * screenHeight };
    default:
      return { x: -enemySize, y: -enemySize };
  }
};

const findNearestEnemy = (playerPos: { x: number; y: number }, enemies: EnemyObject[]) => {
  if (enemies.length === 0) return null;
  
  const playerCenterX = playerPos.x + 20;
  const playerCenterY = playerPos.y + 20;
  
  let nearestEnemy = enemies[0];
  let nearestDistance = Math.hypot(
    nearestEnemy.x + nearestEnemy.size / 2 - playerCenterX,
    nearestEnemy.y + nearestEnemy.size / 2 - playerCenterY
  );
  
  for (let i = 1; i < enemies.length; i++) {
    const enemy = enemies[i];
    const distance = Math.hypot(
      enemy.x + enemy.size / 2 - playerCenterX,
      enemy.y + enemy.size / 2 - playerCenterY
    );
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestEnemy = enemy;
    }
  }
  
  return nearestDistance <= weaponData.basic_orb.range ? nearestEnemy : null;
};

const checkPlayerEnemyCollisions = (playerPos: { x: number; y: number }, enemies: EnemyObject[]) => {
  const playerCenterX = playerPos.x + 20;
  const playerCenterY = playerPos.y + 20;
  const playerRadius = 20;
  const collidedEnemyIds: string[] = [];

  enemies.forEach(enemy => {
    const enemyRadius = enemy.size / 2;
    const enemyCenterX = enemy.x + enemyRadius;
    const enemyCenterY = enemy.y + enemyRadius;
    const collisionDistance = playerRadius + enemyRadius;
    
    const distance = Math.sqrt(
      Math.pow(playerCenterX - enemyCenterX, 2) + 
      Math.pow(playerCenterY - enemyCenterY, 2)
    );

    if (distance < collisionDistance) {
      collidedEnemyIds.push(enemy.id);
    }
  });

  return collidedEnemyIds;
};

const checkProjectileEnemyCollisions = (projectiles: ProjectileObject[], enemies: EnemyObject[]) => {
  const hitProjectileIds: string[] = [];
  const hitEnemyIds: string[] = [];
  const newXPOrbs: any[] = [];
  const newShards: any[] = [];

  projectiles.forEach(projectile => {
    enemies.forEach(enemy => {
      const enemyRadius = enemy.size / 2;
      const enemyCenterX = enemy.x + enemyRadius;
      const enemyCenterY = enemy.y + enemyRadius;
      const projectileRadius = projectile.size / 2;
      
      const distance = Math.hypot(
        projectile.x - enemyCenterX,
        projectile.y - enemyCenterY
      );

      if (distance < projectileRadius + enemyRadius) {
        hitProjectileIds.push(projectile.id);
        
        const updatedEnemy = { ...enemy, health: enemy.health - projectile.damage };
        
        if (updatedEnemy.health <= 0) {
          hitEnemyIds.push(enemy.id);
          
          const baseXpValue = enemy.type === 'brute' ? 15 : 10;
          newXPOrbs.push({
            id: `xp-${Math.random().toString(36).substr(2, 9)}`,
            x: enemyCenterX,
            y: enemyCenterY,
            value: baseXpValue,
            size: 12,
          });

          if (Math.random() < 0.15) {
            const shardValue = enemy.type === 'brute' ? 3 : 1;
            newShards.push({
              id: `shard-${Math.random().toString(36).substr(2, 9)}`,
              x: enemyCenterX + (Math.random() - 0.5) * 30,
              y: enemyCenterY + (Math.random() - 0.5) * 30,
              value: shardValue,
              size: 16,
            });
          }
        }
      }
    });
  });

  return { hitProjectileIds, hitEnemyIds, newXPOrbs, newShards };
};

const checkPlayerXPCollisions = (playerPos: { x: number; y: number }, xpOrbs: any[]) => {
  const playerCenterX = playerPos.x + 20;
  const playerCenterY = playerPos.y + 20;
  const playerRadius = 20;
  const collectedOrbIds: string[] = [];
  let totalXP = 0;

  xpOrbs.forEach(orb => {
    const distance = Math.hypot(
      playerCenterX - orb.x,
      playerCenterY - orb.y
    );

    if (distance < playerRadius + orb.size / 2) {
      collectedOrbIds.push(orb.id);
      totalXP += orb.value;
    }
  });

  return { collectedOrbIds, totalXP };
};

const checkPlayerShardCollisions = (playerPos: { x: number; y: number }, chronoShards: any[]) => {
  const playerCenterX = playerPos.x + 20;
  const playerCenterY = playerPos.y + 20;
  const playerRadius = 20;
  const collectedShardIds: string[] = [];
  let totalShards = 0;

  chronoShards.forEach(shard => {
    const distance = Math.hypot(
      playerCenterX - shard.x,
      playerCenterY - shard.y
    );

    if (distance < playerRadius + shard.size / 2) {
      collectedShardIds.push(shard.id);
      totalShards += shard.value;
    }
  });

  return { collectedShardIds, totalShards };
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        playerPosition: action.payload,
      };

    case 'SPAWN_ENEMY': {
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemyConfig = enemyData[randomType];
      const position = generateOffScreenPosition(enemyConfig.size);
      
      const newEnemy: EnemyObject = {
        id: `enemy-${state.enemyIdCounter}`,
        x: position.x,
        y: position.y,
        color: enemyConfig.color,
        type: randomType,
        health: enemyConfig.health,
        speed: enemyConfig.speed,
        size: enemyConfig.size,
      };

      return {
        ...state,
        enemies: [...state.enemies, newEnemy],
        enemyIdCounter: state.enemyIdCounter + 1,
      };
    }

    case 'SPAWN_PROJECTILE': {
      const nearestEnemy = findNearestEnemy(state.playerPosition, state.enemies);
      if (!nearestEnemy) return state;
      
      const weapon = weaponData.basic_orb;
      const playerCenterX = state.playerPosition.x + 20;
      const playerCenterY = state.playerPosition.y + 20;
      const enemyCenterX = nearestEnemy.x + nearestEnemy.size / 2;
      const enemyCenterY = nearestEnemy.y + nearestEnemy.size / 2;
      
      const angle = Math.atan2(enemyCenterY - playerCenterY, enemyCenterX - playerCenterX);
      const vx = Math.cos(angle) * weapon.speed;
      const vy = Math.sin(angle) * weapon.speed;
      
      const newProjectile: ProjectileObject = {
        id: `projectile-${state.projectileIdCounter}`,
        x: playerCenterX,
        y: playerCenterY,
        vx,
        vy,
        damage: weapon.damage,
        size: weapon.projectileSize,
        color: weapon.color,
        range: weapon.range,
        distanceTraveled: 0,
      };
      
      return {
        ...state,
        projectiles: [...state.projectiles, newProjectile],
        projectileIdCounter: state.projectileIdCounter + 1,
      };
    }

    case 'MOVE_ENTITIES': {
      // Move enemies towards player
      const updatedEnemies = state.enemies.map(enemy => {
        const enemyRadius = enemy.size / 2;
        const dx = (state.playerPosition.x + 20) - (enemy.x + enemyRadius);
        const dy = (state.playerPosition.y + 20) - (enemy.y + enemyRadius);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const normalizedDx = (dx / distance) * enemy.speed;
          const normalizedDy = (dy / distance) * enemy.speed;
          
          return {
            ...enemy,
            x: enemy.x + normalizedDx,
            y: enemy.y + normalizedDy,
          };
        }
        
        return enemy;
      });

      // Move projectiles
      const updatedProjectiles = state.projectiles.map(projectile => {
        const newX = projectile.x + projectile.vx;
        const newY = projectile.y + projectile.vy;
        const newDistanceTraveled = projectile.distanceTraveled + Math.hypot(projectile.vx, projectile.vy);
        
        return {
          ...projectile,
          x: newX,
          y: newY,
          distanceTraveled: newDistanceTraveled,
        };
      }).filter(projectile => {
        const margin = 50;
        const inBounds = projectile.x > -margin && projectile.x < screenWidth + margin &&
                        projectile.y > -margin && projectile.y < screenHeight + margin;
        const inRange = projectile.distanceTraveled < projectile.range;
        return inBounds && inRange;
      });

      return {
        ...state,
        enemies: updatedEnemies,
        projectiles: updatedProjectiles,
      };
    }

    case 'HANDLE_COLLISIONS': {
      let newState = { ...state };

      // Check player-enemy collisions
      if (!state.isPlayerInvincible) {
        const collidedEnemyIds = checkPlayerEnemyCollisions(state.playerPosition, state.enemies);
        
        if (collidedEnemyIds.length > 0) {
          newState.isPlayerInvincible = true;
          newState.playerHealth = Math.max(0, state.playerHealth - collidedEnemyIds.length);
          
          if (newState.playerHealth <= 0) {
            newState.isGameOver = true;
          }

          newState.enemies = state.enemies.map(enemy => {
            if (collidedEnemyIds.includes(enemy.id)) {
              return { ...enemy, health: enemy.health - 1 };
            }
            return enemy;
          }).filter(enemy => enemy.health > 0);
        }
      }

      // Check projectile-enemy collisions
      const { hitProjectileIds, hitEnemyIds, newXPOrbs, newShards } = 
        checkProjectileEnemyCollisions(newState.projectiles, newState.enemies);

      if (hitProjectileIds.length > 0) {
        newState.projectiles = newState.projectiles.filter(p => !hitProjectileIds.includes(p.id));
      }

      if (hitEnemyIds.length > 0) {
        newState.enemies = newState.enemies.filter(e => !hitEnemyIds.includes(e.id));
        newState.xpOrbs = [...newState.xpOrbs, ...newXPOrbs];
        newState.chronoShards = [...newState.chronoShards, ...newShards];
      }

      // Check player-XP orb collisions
      const { collectedOrbIds, totalXP } = checkPlayerXPCollisions(state.playerPosition, newState.xpOrbs);
      
      if (collectedOrbIds.length > 0) {
        newState.xpOrbs = newState.xpOrbs.filter(orb => !collectedOrbIds.includes(orb.id));
        newState.playerStats = {
          ...newState.playerStats,
          xp: newState.playerStats.xp + totalXP,
        };

        if (newState.playerStats.xp >= newState.playerStats.xpToNextLevel) {
          newState.playerStats = {
            level: newState.playerStats.level + 1,
            xp: newState.playerStats.xp - newState.playerStats.xpToNextLevel,
            xpToNextLevel: newState.playerStats.xpToNextLevel + 50,
          };
        }
      }

      // Check player-ChronoShard collisions
      const { collectedShardIds } = checkPlayerShardCollisions(state.playerPosition, newState.chronoShards);
      
      if (collectedShardIds.length > 0) {
        newState.chronoShards = newState.chronoShards.filter(shard => !collectedShardIds.includes(shard.id));
      }

      return newState;
    }

    case 'SET_PLAYER_INVINCIBLE':
      return {
        ...state,
        isPlayerInvincible: action.payload,
      };

    case 'INCREMENT_TIME':
      const newTimeElapsed = state.timeElapsed + 1;
      let newSpawnRate = state.spawnRate;
      
      // Every 10 seconds, increase difficulty
      if (newTimeElapsed % 10 === 0) {
        newSpawnRate = Math.max(500, Math.floor(state.spawnRate * 0.9));
      }
      
      return {
        ...state,
        timeElapsed: newTimeElapsed,
        spawnRate: newSpawnRate,
      };

    case 'SET_GAME_OVER':
      return {
        ...state,
        isGameOver: action.payload,
      };

    case 'RESET_GAME':
      return {
        ...initialGameState,
        playerPosition: {
          x: screenWidth / 2 - 20,
          y: screenHeight / 2 - 20,
        },
      };

    default:
      return state;
  }
}