import { create } from 'zustand';
import { GameState, GameAction, initialGameState, gameReducer } from '@/game/gameReducer';
import ExplosionSystem from '@/systems/ExplosionSystem';

interface GameStore {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;
  isRunning: boolean;
}

let gameLoopInterval: NodeJS.Timeout | null = null;
let weaponFireInterval: NodeJS.Timeout | null = null;
let enemySpawnInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialGameState,
  isRunning: false,

  dispatch: (action: GameAction) => {
    set((state) => ({
      gameState: gameReducer(state.gameState, action),
    }));
  },

  startGameLoop: () => {
    const { dispatch } = get();
    
    set({ isRunning: true });

    // Main game loop - 60 FPS
    gameLoopInterval = setInterval(() => {
      const currentState = get().gameState;
      
      if (currentState.isGameOver) {
        get().stopGameLoop();
        return;
      }

      // Update explosions using the ExplosionSystem
      ExplosionSystem.update(currentState, dispatch);
      
      // Move all entities
      dispatch({ type: 'MOVE_ENTITIES' });
      
      // Handle collisions
      dispatch({ type: 'HANDLE_COLLISIONS' });
      
      // Increment time
      dispatch({ type: 'INCREMENT_TIME' });
      
      // Reset player invincibility after a short time
      if (currentState.isPlayerInvincible) {
        setTimeout(() => {
          dispatch({ type: 'SET_PLAYER_INVINCIBLE', payload: false });
        }, 1000);
      }
    }, 1000 / 60); // 60 FPS

    // Weapon firing loop
    weaponFireInterval = setInterval(() => {
      const currentState = get().gameState;
      if (!currentState.isGameOver && currentState.enemies.length > 0) {
        dispatch({ type: 'SPAWN_PROJECTILE', payload: {} as any });
      }
    }, 500); // Fire every 500ms

    // Enemy spawning loop
    enemySpawnInterval = setInterval(() => {
      const currentState = get().gameState;
      if (!currentState.isGameOver) {
        dispatch({ type: 'SPAWN_ENEMY', payload: {} as any });
      }
    }, get().gameState.spawnRate);
  },

  stopGameLoop: () => {
    set({ isRunning: false });
    
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }
    
    if (weaponFireInterval) {
      clearInterval(weaponFireInterval);
      weaponFireInterval = null;
    }
    
    if (enemySpawnInterval) {
      clearInterval(enemySpawnInterval);
      enemySpawnInterval = null;
    }
  },
}));