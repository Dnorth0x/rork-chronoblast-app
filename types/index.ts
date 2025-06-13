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

export interface PlayerProps {
  x: number;
  y: number;
  color: string;
  isInvincible?: boolean;
}

export interface EnemyProps {
  x: number;
  y: number;
  color: string;
  size: number;
}