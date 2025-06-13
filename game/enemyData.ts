export interface EnemyConfig {
  size: number;
  color: string;
  speed: number;
  health: number;
}

export const enemyData: Record<string, EnemyConfig> = {
  standard: {
    size: 30,
    color: '#FF6B6B',
    speed: 1.5,
    health: 1,
  },
  brute: {
    size: 45,
    color: '#8B0000',
    speed: 0.8,
    health: 3,
  },
};

export const enemyTypes = Object.keys(enemyData);