import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '@/stores/gameStore';
import Colors from '@/constants/colors';
import { PT, GAME_CONFIG } from '@/constants/gameConfig';
import { usePathname } from 'expo-router';

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
          <TouchableOpacity onPress={togglePause} style={styles.pauseButton}>
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

      {/* Dash Controls */}
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
          onPress={triggerDash} 
          style={[
            styles.dashButton, 
            !player.dashReady && styles.dashButtonDisabled
          ]} 
          disabled={!player.dashReady}
        >
          <Text style={[styles.buttonText, !player.dashReady && styles.disabledButtonText]}>
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
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 191, 255, 0.5)',
    borderRadius: 20,
    padding: 12,
    flexWrap: 'wrap',
    gap: 8,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#666',
  },
  comboContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  comboText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  powerUpArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 8,
    gap: 8,
  },
  powerUpIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  powerUpText: {
    color: '#f0f0f0',
    fontSize: 11,
    fontWeight: '600',
  },
  scoreBoost: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderColor: 'rgba(255,215,0,0.6)',
  },
  slowEnemy: {
    backgroundColor: 'rgba(135,206,250,0.3)',
    borderColor: 'rgba(135,206,250,0.6)',
  },
  confusion: {
    backgroundColor: 'rgba(128,0,128,0.4)',
    borderColor: 'rgba(128,0,128,0.7)',
  },
  performanceIndicator: {
    position: 'absolute',
    top: 100,
    right: 15,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
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
    gap: 8,
  },
  dashCooldownContainer: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dashCooldownFill: {
    height: '100%',
    borderRadius: 3,
  },
  dashReady: {
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  dashOnCooldown: {
    backgroundColor: '#FF6347',
  },
  dashButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    minWidth: 80,
  },
  dashButtonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0.3,
  },
});

export default GameUI;