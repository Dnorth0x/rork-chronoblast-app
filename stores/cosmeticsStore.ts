import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COSMETIC_ITEMS, CosmeticItem, CC_REWARDS } from '@/constants/cosmetics';

interface CosmeticsState {
  chronoCurrency: number;
  ownedItems: string[];
  equippedItems: {
    player: string;
    trail: string;
    background: string;
    particles: string;
  };
  lastDailyLogin: string;
  totalEarned: number;
  totalSpent: number;
  
  // Actions
  addCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  getEquippedItem: (category: string) => CosmeticItem | null;
  getOwnedItems: () => CosmeticItem[];
  getShopItems: () => CosmeticItem[];
  calculateGameReward: (score: number, maxCombo: number, isNewHighScore: boolean) => number;
  claimDailyLogin: () => number;
  resetProgress: () => void;
}

export const useCosmeticsStore = create<CosmeticsState>()(
  persist(
    (set, get) => ({
      chronoCurrency: 150, // Starting currency increased
      ownedItems: ['player_classic', 'trail_none', 'bg_space'],
      equippedItems: {
        player: 'player_classic',
        trail: 'trail_none',
        background: 'bg_space',
        particles: '',
      },
      lastDailyLogin: '',
      totalEarned: 150,
      totalSpent: 0,

      addCurrency: (amount) => set(state => ({
        chronoCurrency: state.chronoCurrency + amount,
        totalEarned: state.totalEarned + amount,
      })),

      spendCurrency: (amount) => {
        const state = get();
        if (state.chronoCurrency >= amount) {
          set({
            chronoCurrency: state.chronoCurrency - amount,
            totalSpent: state.totalSpent + amount,
          });
          return true;
        }
        return false;
      },

      purchaseItem: (itemId) => {
        const state = get();
        const item = COSMETIC_ITEMS.find(i => i.id === itemId);
        
        if (!item || state.ownedItems.includes(itemId)) {
          return false;
        }

        if (state.chronoCurrency >= item.price) {
          set({
            chronoCurrency: state.chronoCurrency - item.price,
            totalSpent: state.totalSpent + item.price,
            ownedItems: [...state.ownedItems, itemId],
          });
          return true;
        }
        return false;
      },

      equipItem: (itemId) => {
        const state = get();
        const item = COSMETIC_ITEMS.find(i => i.id === itemId);
        
        if (!item || !state.ownedItems.includes(itemId)) {
          return;
        }

        set({
          equippedItems: {
            ...state.equippedItems,
            [item.category]: itemId,
          },
        });
      },

      getEquippedItem: (category) => {
        const state = get();
        const itemId = state.equippedItems[category as keyof typeof state.equippedItems];
        return COSMETIC_ITEMS.find(item => item.id === itemId) || null;
      },

      getOwnedItems: () => {
        const state = get();
        return COSMETIC_ITEMS.filter(item => state.ownedItems.includes(item.id));
      },

      getShopItems: () => {
        const state = get();
        return COSMETIC_ITEMS.map(item => ({
          ...item,
          unlocked: state.ownedItems.includes(item.id),
          equipped: state.equippedItems[item.category] === item.id,
        }));
      },

      calculateGameReward: (score, maxCombo, isNewHighScore) => {
        let reward = CC_REWARDS.BASE_GAME_REWARD;
        
        // Score-based reward
        reward += Math.floor(score * CC_REWARDS.SCORE_MULTIPLIER);
        
        // Combo bonus
        if (maxCombo > 1) {
          reward += (maxCombo - 1) * CC_REWARDS.COMBO_BONUS;
        }
        
        // High score bonus
        if (isNewHighScore) {
          reward += CC_REWARDS.HIGH_SCORE_BONUS;
        }
        
        // Perfect game bonus (for high combo streaks)
        if (maxCombo >= 10) {
          reward += CC_REWARDS.PERFECT_GAME_BONUS;
        }
        
        // Minimum reward
        return Math.max(reward, CC_REWARDS.BASE_GAME_REWARD);
      },

      claimDailyLogin: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastDailyLogin !== today) {
          set({
            lastDailyLogin: today,
            chronoCurrency: state.chronoCurrency + CC_REWARDS.DAILY_LOGIN,
            totalEarned: state.totalEarned + CC_REWARDS.DAILY_LOGIN,
          });
          return CC_REWARDS.DAILY_LOGIN;
        }
        return 0;
      },

      resetProgress: () => set({
        chronoCurrency: 150,
        ownedItems: ['player_classic', 'trail_none', 'bg_space'],
        equippedItems: {
          player: 'player_classic',
          trail: 'trail_none',
          background: 'bg_space',
          particles: '',
        },
        lastDailyLogin: '',
        totalEarned: 150,
        totalSpent: 0,
      }),
    }),
    {
      name: 'chronoBurstCosmetics',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);