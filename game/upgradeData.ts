export interface UpgradeConfig {
  id: string;
  label: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  icon: string;
  category: 'combat' | 'survival' | 'utility';
}

export const upgradeData: Record<string, UpgradeConfig> = {
  player_health: {
    id: 'player_health',
    label: 'Reinforced Core',
    description: 'Increases maximum health by 25 per level',
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 1.5,
    icon: 'heart',
    category: 'survival',
  },
  player_speed: {
    id: 'player_speed',
    label: 'Neural Boost',
    description: 'Increases movement speed by 15% per level',
    maxLevel: 8,
    baseCost: 75,
    costMultiplier: 1.6,
    icon: 'zap',
    category: 'utility',
  },
  weapon_damage: {
    id: 'weapon_damage',
    label: 'Plasma Amplifier',
    description: 'Increases weapon damage by 1 per level',
    maxLevel: 15,
    baseCost: 40,
    costMultiplier: 1.4,
    icon: 'target',
    category: 'combat',
  },
  weapon_fire_rate: {
    id: 'weapon_fire_rate',
    label: 'Rapid Cycling',
    description: 'Reduces weapon fire rate by 50ms per level',
    maxLevel: 6,
    baseCost: 100,
    costMultiplier: 1.8,
    icon: 'clock',
    category: 'combat',
  },
  xp_multiplier: {
    id: 'xp_multiplier',
    label: 'Data Harvester',
    description: 'Increases XP gain by 25% per level',
    maxLevel: 5,
    baseCost: 120,
    costMultiplier: 2.0,
    icon: 'trending-up',
    category: 'utility',
  },
  invincibility_duration: {
    id: 'invincibility_duration',
    label: 'Shield Matrix',
    description: 'Increases invincibility duration by 200ms per level',
    maxLevel: 4,
    baseCost: 80,
    costMultiplier: 1.7,
    icon: 'shield',
    category: 'survival',
  },
};

export const upgradeCategories = {
  combat: {
    label: 'Combat',
    color: '#FF6B6B',
    description: 'Enhance your offensive capabilities',
  },
  survival: {
    label: 'Survival',
    color: '#4ECDC4',
    description: 'Improve your defensive systems',
  },
  utility: {
    label: 'Utility',
    color: '#45B7D1',
    description: 'Optimize your efficiency',
  },
};

export const getUpgradeCost = (upgradeId: string, currentLevel: number): number => {
  const upgrade = upgradeData[upgradeId];
  if (!upgrade || currentLevel >= upgrade.maxLevel) return 0;
  
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
};

export const getUpgradeValue = (upgradeId: string, level: number): number => {
  switch (upgradeId) {
    case 'player_health':
      return level * 25;
    case 'player_speed':
      return level * 0.15; // 15% per level
    case 'weapon_damage':
      return level * 1;
    case 'weapon_fire_rate':
      return level * 50; // 50ms reduction per level
    case 'xp_multiplier':
      return level * 0.25; // 25% per level
    case 'invincibility_duration':
      return level * 200; // 200ms per level
    default:
      return 0;
  }
};