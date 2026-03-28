export interface WeaponData {
  damage: number;
  speed: number;
  fireRate: number; // milliseconds between shots
  range: number;
  projectileSize: number;
  color: string;
}

export const weaponData: Record<string, WeaponData> = {
  basic_orb: {
    damage: 1,
    speed: 8,
    fireRate: 500, // fires every 500ms
    range: 300,
    projectileSize: 8,
    color: '#00FFFF',
  },
};

export const weaponTypes = Object.keys(weaponData);