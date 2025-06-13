import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SoundType = 
  | 'button_click'
  | 'menu_open'
  | 'menu_close'
  | 'game_start'
  | 'game_over'
  | 'player_hit'
  | 'enemy_hit'
  | 'enemy_death'
  | 'level_up'
  | 'weapon_fire'
  | 'pickup_xp'
  | 'pickup_shard'
  | 'upgrade_purchase'
  | 'dash'
  | 'invincibility'
  | 'combo'
  | 'time_warning'
  | 'powerup_collect'
  | 'screen_shake';

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  pattern?: 'single' | 'double' | 'triple' | 'ascending' | 'descending';
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  button_click: { frequency: 800, duration: 100, volume: 0.3 },
  menu_open: { frequency: 600, duration: 200, volume: 0.4 },
  menu_close: { frequency: 500, duration: 150, volume: 0.3 },
  game_start: { frequency: 1200, duration: 300, volume: 0.5, pattern: 'ascending' },
  game_over: { frequency: 300, duration: 800, volume: 0.6, pattern: 'descending' },
  player_hit: { frequency: 200, duration: 200, volume: 0.7 },
  enemy_hit: { frequency: 600, duration: 80, volume: 0.4 },
  enemy_death: { frequency: 400, duration: 150, volume: 0.5, pattern: 'descending' },
  level_up: { frequency: 1000, duration: 400, volume: 0.6, pattern: 'ascending' },
  weapon_fire: { frequency: 900, duration: 50, volume: 0.2 },
  pickup_xp: { frequency: 1200, duration: 100, volume: 0.3 },
  pickup_shard: { frequency: 1500, duration: 150, volume: 0.4, pattern: 'double' },
  upgrade_purchase: { frequency: 1100, duration: 250, volume: 0.5, pattern: 'triple' },
  dash: { frequency: 700, duration: 120, volume: 0.4 },
  invincibility: { frequency: 1000, duration: 200, volume: 0.3, pattern: 'double' },
  combo: { frequency: 1300, duration: 180, volume: 0.4 },
  time_warning: { frequency: 400, duration: 300, volume: 0.6, pattern: 'double' },
  powerup_collect: { frequency: 1400, duration: 200, volume: 0.5, pattern: 'ascending' },
  screen_shake: { frequency: 150, duration: 100, volume: 0.8 },
};

const MUTE_STORAGE_KEY = '@chronoblast_sound_muted';

class SoundManager {
  private static instance: SoundManager;
  private initialized = false;
  private isMuted = false;
  private masterVolume = 1.0;
  private activeSounds: Audio.Sound[] = [];

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async init(): Promise<void> {
    if (Platform.OS === 'web' || this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load muted state from AsyncStorage
      try {
        const savedMuteState = await AsyncStorage.getItem(MUTE_STORAGE_KEY);
        if (savedMuteState !== null) {
          this.isMuted = JSON.parse(savedMuteState);
        }
      } catch (error) {
        console.log('Failed to load mute state:', error);
      }

      this.initialized = true;
      console.log('SoundManager initialized successfully, muted:', this.isMuted);
    } catch (error) {
      console.log('SoundManager initialization failed:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.toggleMute(!enabled);
  }

  async toggleMute(mute: boolean): Promise<void> {
    this.isMuted = mute;
    
    if (mute) {
      this.stopAllSounds();
    }

    // Save mute state to AsyncStorage
    try {
      await AsyncStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(mute));
    } catch (error) {
      console.log('Failed to save mute state:', error);
    }
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  async play(soundType: SoundType, volumeMultiplier: number = 1): Promise<void> {
    // Check muted state synchronously before any async operations
    if (this.isMuted || Platform.OS === 'web' || !this.initialized) return;
    
    const config = SOUND_CONFIGS[soundType];
    if (!config) return;

    try {
      const finalVolume = config.volume * this.masterVolume * volumeMultiplier;
      
      if (config.pattern && config.pattern !== 'single') {
        await this.playPattern(config, finalVolume);
      } else {
        await this.playSingleTone(config.frequency, config.duration, finalVolume);
      }
    } catch (error) {
      console.log(`Failed to play sound ${soundType}:`, error);
    }
  }

  private async playPattern(config: SoundConfig, volume: number): Promise<void> {
    const { frequency, duration, pattern } = config;
    
    switch (pattern) {
      case 'double':
        await this.playSingleTone(frequency, duration * 0.4, volume);
        await this.delay(50);
        await this.playSingleTone(frequency, duration * 0.4, volume);
        break;
        
      case 'triple':
        await this.playSingleTone(frequency, duration * 0.3, volume);
        await this.delay(40);
        await this.playSingleTone(frequency, duration * 0.3, volume);
        await this.delay(40);
        await this.playSingleTone(frequency, duration * 0.3, volume);
        break;
        
      case 'ascending':
        await this.playSingleTone(frequency * 0.8, duration * 0.3, volume);
        await this.delay(30);
        await this.playSingleTone(frequency, duration * 0.3, volume);
        await this.delay(30);
        await this.playSingleTone(frequency * 1.2, duration * 0.4, volume);
        break;
        
      case 'descending':
        await this.playSingleTone(frequency * 1.2, duration * 0.3, volume);
        await this.delay(30);
        await this.playSingleTone(frequency, duration * 0.3, volume);
        await this.delay(30);
        await this.playSingleTone(frequency * 0.8, duration * 0.4, volume);
        break;
        
      default:
        await this.playSingleTone(frequency, duration, volume);
    }
  }

  private async playSingleTone(frequency: number, duration: number, volume: number): Promise<void> {
    try {
      // Generate a simple sine wave tone (in a real app, you'd use actual sound files)
      const { sound } = await Audio.Sound.createAsync(
        { 
          uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' 
        },
        { 
          shouldPlay: false, 
          volume: Math.max(0, Math.min(1, volume)),
          rate: Math.max(0.5, Math.min(2.0, frequency / 440)) // Adjust pitch by changing playback rate
        }
      );
      
      this.activeSounds.push(sound);
      
      await sound.playAsync();
      
      // Auto-cleanup after duration
      setTimeout(() => {
        this.cleanupSound(sound);
      }, duration + 100);
      
    } catch (error) {
      console.log('Failed to play single tone:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupSound(sound: Audio.Sound): void {
    try {
      sound.unloadAsync();
      this.activeSounds = this.activeSounds.filter(s => s !== sound);
    } catch (error) {
      console.log('Error cleaning up sound:', error);
    }
  }

  private stopAllSounds(): void {
    this.activeSounds.forEach(sound => {
      try {
        sound.stopAsync();
        sound.unloadAsync();
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
    });
    this.activeSounds = [];
  }

  // Convenience methods for common sound combinations
  async playUISound(soundType: 'button_click' | 'menu_open' | 'menu_close'): Promise<void> {
    await this.play(soundType);
  }

  async playGameSound(soundType: 'player_hit' | 'enemy_hit' | 'enemy_death' | 'weapon_fire'): Promise<void> {
    await this.play(soundType);
  }

  async playPickupSound(soundType: 'pickup_xp' | 'pickup_shard' | 'powerup_collect'): Promise<void> {
    await this.play(soundType);
  }

  async playSystemSound(soundType: 'level_up' | 'game_start' | 'game_over' | 'upgrade_purchase'): Promise<void> {
    await this.play(soundType);
  }

  // Cleanup method
  destroy(): void {
    this.stopAllSounds();
    this.initialized = false;
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();