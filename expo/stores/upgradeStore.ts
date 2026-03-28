import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { upgradeData, getUpgradeCost } from '@/game/upgradeData';

interface UpgradeState {
  chronoShards: number;
  upgradeLevels: Record<string, number>;
  totalShardsEarned: number;
  totalShardsSpent: number;
  
  // Actions
  addShards: (amount: number) => void;
  spendShards: (amount: number) => boolean;
  purchaseUpgrade: (upgradeId: string) => boolean;
  getUpgradeLevel: (upgradeId: string) => number;
  canAffordUpgrade: (upgradeId: string) => boolean;
  resetUpgrades: () => void;
}

export const useUpgradeStore = create<UpgradeState>()(
  persist(
    (set, get) => ({
      chronoShards: 0,
      upgradeLevels: {},
      totalShardsEarned: 0,
      totalShardsSpent: 0,

      addShards: (amount) => set(state => ({
        chronoShards: state.chronoShards + amount,
        totalShardsEarned: state.totalShardsEarned + amount,
      })),

      spendShards: (amount) => {
        const state = get();
        if (state.chronoShards >= amount) {
          set(prevState => ({
            chronoShards: prevState.chronoShards - amount,
            totalShardsSpent: prevState.totalShardsSpent + amount,
          }));
          return true;
        }
        return false;
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get();
        const currentLevel = state.upgradeLevels[upgradeId] || 0;
        const upgrade = upgradeData[upgradeId];
        
        if (!upgrade || currentLevel >= upgrade.maxLevel) {
          return false;
        }
        
        const cost = getUpgradeCost(upgradeId, currentLevel);
        
        if (state.chronoShards >= cost) {
          set(prevState => ({
            chronoShards: prevState.chronoShards - cost,
            totalShardsSpent: prevState.totalShardsSpent + cost,
            upgradeLevels: {
              ...prevState.upgradeLevels,
              [upgradeId]: currentLevel + 1,
            },
          }));
          return true;
        }
        
        return false;
      },

      getUpgradeLevel: (upgradeId) => {
        const state = get();
        return state.upgradeLevels[upgradeId] || 0;
      },

      canAffordUpgrade: (upgradeId) => {
        const state = get();
        const currentLevel = state.upgradeLevels[upgradeId] || 0;
        const upgrade = upgradeData[upgradeId];
        
        if (!upgrade || currentLevel >= upgrade.maxLevel) {
          return false;
        }
        
        const cost = getUpgradeCost(upgradeId, currentLevel);
        return state.chronoShards >= cost;
      },

      resetUpgrades: () => set({
        upgradeLevels: {},
        // Keep shards but reset upgrades
      }),
    }),
    {
      name: 'chronoBurst-upgrades',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);