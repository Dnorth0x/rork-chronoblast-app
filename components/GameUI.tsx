import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useGameStore } from '@/stores/gameStore';
import Colors from '@/constants/colors';
import { PT, GAME_CONFIG } from '@/constants/gameConfig';
import { usePathname } from 'expo-router';
import { Audio } from 'expo-av';

// UI Sound Manager
class UISoundManager {
  private initialized = false;

  async init() {
    if (Platform.OS === 'web' || this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
    } catch (error) {
      console.log('UI sound initialization failed:', error);
    }
  }

  async play(soundName: string) {
    if (Platform.OS === 'web' || !this.initialized) return;
    
    try {
      let frequency = 440;
      let duration = 150;
      
      switch (soundName) {
        case 'button_press':
          frequency = 800;
          duration = 100;
          break;
        case 'pause':
          frequency = 600;
          duration = 200;
          break;
        case 'dash_ready':
          frequency = 1000;
          duration = 100;
          break;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
        { shouldPlay: false, volume: 0.3 }
      );
      
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('UI sound play failed:', error);
    }
  }
}

const uiSoundManager = new UISoundManager();

const GameUI: React.FC = () => {
  const pathname = usePathname();
  const { 
    score, 
    timeLeft, 
    highScore, 
    isPaused, 
    gameActive, 
    currentCombo,
    performanceMode,
    frameRate,
    togglePause, 
    triggerDash, 
    activePowerUps, 
    player 
  } = useGameStore();

  // Initialize UI sound manager
  React.useEffect(() => {
    uiSoundManager.init();
  }, []);

  // Only show GameUI on the main game screen (index route) - more specific check
  if (pathname !== '/' && !pathname.endsWith('/(tabs)') && !pathname.endsWith('/index')) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (time: number): string => {
    return time.toFixed(2);
  };

  const getDashCooldownProgress = (): number => {
    if (player.dashReady) return 100;
    const elapsed = Date.now() - player.lastDashStartTime;
    return Math.min(100, (elapsed / GAME_CONFIG.PLAYER_DASH_COOLDOWN) * 100);
  };

  const handlePausePress = async () => {
    await uiSoundManager.play('pause');
    togglePause();
  };

  const handleDashPress = async () => {
    if (player.dashReady) {
      await uiSoundManager.play('button_press');
      triggerDash();
    }
  };

  // Play sound when dash becomes ready
  React.useEffect(() => {
    if (player.dashReady && gameActive && !isPaused) {
      uiSoundManager.play('dash_ready');
    }
  }, [player.dashReady, gameActive, isPaused]);

  return (
    <View style={styles.container}>
      {/* Main UI Bar */}
      <View style={styles.uiBar}>
        <View style={styles.uiElement}>
          <Text style={styles.uiText}>
            Score: <Text style={styles.highlight}>{formatNumber(score)}</Text>
          </Text>
        </View>
        <View style={styles.uiElement}>
          <Text style={[
            styles.uiText, 
            timeLeft <= GAME_CONFIG.TIME_LOW_THRESHOLD && gameActive && !isPaused && styles.warning
          ]}>
            Time: <Text style={styles.highlight}>{formatTime(timeLeft)}s</Text>
          </Text>
        </View>
        <View style={styles.uiElement}>
          <Text style={styles.uiText}>
            High: <Text style={styles.highlight}>{formatNumber(highScore)}</Text>
          </Text>
        </View>
        <View style={styles.uiElement}>
          <TouchableOpacity onPress={handlePausePress} style={styles.pauseButton}>
            <Text style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Combo Display */}
      {currentCombo > 1 && gameActive && !isPaused && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>COMBO x{currentCombo}!</Text>
        </View>
      )}

      {/* Power-up Indicators */}
      <View style={styles.powerUpArea}>
        {Object.entries(activePowerUps).map(([key, powerUp]) => {
          if (!powerUp.active) return null;
          const remainingTime = Math.max(0, Math.ceil((powerUp.endTime - Date.now()) / 1000));
          let text = '';
          let style = {};
          
          if (key === PT.SCORE_BOOST) {
            text = '2x Score';
            style = styles.scoreBoost;
          } else if (key === PT.SLOW_ENEMY) {
            text = 'Slowdown';
            style = styles.slowEnemy;
          } else if (key === PT.CONFUSION_ORB) {
            text = 'Confused!';
            style = styles.confusion;
          }
          
          return (
            <View key={key} style={[styles.powerUpIndicator, style]}>
              <Text style={styles.powerUpText}>{`${text} (${remainingTime}s)`}</Text>
            </View>
          );
        })}
      </View>

      {/* Performance Indicator */}
      {performanceMode && (
        <View style={styles.performanceIndicator}>
          <Text style={styles.performanceText}>Performance Mode</Text>
        </View>
      )}

      {/* Enhanced Dash Controls */}
      <View style={styles.dashContainer}>
        <View style={styles.dashCooldownContainer}>
          <View 
            style={[
              styles.dashCooldownFill, 
              player.dashReady ? styles.dashReady : styles.dashOnCooldown,
              { width: `${getDashCooldownProgress()}%` }
            ]} 
          />
        </View>
        <TouchableOpacity 
          onPress={handleDashPress} 
          style={[
            styles.dashButton, 
            !player.dashReady && styles.dashButtonDisabled,
            player.dashReady && styles.dashButtonReady
          ]} 
          disabled={!player.dashReady}
        >
          <Text style={[
            styles.buttonText, 
            !player.dashReady && styles.disabledButtonText,
            player.dashReady && styles.readyButtonText
          ]}>
            {player.isDashing ? 'Dashing!' : 'Dash'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    paddingTop: 40,
    paddingHorizontal: 15,
    zIndex: 5,
  },
  uiBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 40, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 191, 255, 0.6)',
    borderRadius: 20,
    padding: 12,
    flexWrap: 'wrap',
    gap: 8,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  uiElement: {
    minWidth: 70,
  },
  uiText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: Colors.light.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  highlight: {
    color: Colors.light.tint,
    fontWeight: '700',
  },
  warning: {
    color: '#FF4500',
    transform: [{ scale: 1.05 }],
  },
  pauseButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#666',
  },
  readyButtonText: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  comboContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  comboText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  powerUpArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 8,
    gap: 8,
  },
  powerUpIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  powerUpText: {
    color: '#f0f0f0',
    fontSize: 11,
    fontWeight: '600',
  },
  scoreBoost: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderColor: 'rgba(255,215,0,0.6)',
    shadowColor: '#FFD700',
  },
  slowEnemy: {
    backgroundColor: 'rgba(135,206,250,0.3)',
    borderColor: 'rgba(135,206,250,0.6)',
    shadowColor: '#87CEEB',
  },
  confusion: {
    backgroundColor: 'rgba(128,0,128,0.4)',
    borderColor: 'rgba(128,0,128,0.7)',
    shadowColor: '#800080',
  },
  performanceIndicator: {
    position: 'absolute',
    top: 100,
    right: 15,
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceText: {
    color: '#1a1a2e',
    fontSize: 10,
    fontWeight: '600',
  },
  dashContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    gap: 10,
  },
  dashCooldownContainer: {
    width: 90,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(0, 191, 255, 0.6)',
    borderRadius: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dashCooldownFill: {
    height: '100%',
    borderRadius: 4,
  },
  dashReady: {
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  dashOnCooldown: {
    backgroundColor: '#FF6347',
  },
  dashButton: {
    backgroundColor: '#555',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'rgba(0, 191, 255, 0.3)',
    elevation: 4,
  },
  dashButtonDisabled: {
    backgroundColor: '#444',
    shadowOpacity: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dashButtonReady: {
    backgroundColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOpacity: 0.8,
    borderColor: Colors.light.tint,
  },
});

export default GameUI;