import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import Colors from '@/constants/colors';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { PT } from '@/constants/gameConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Overlay Sound Manager
class OverlaySoundManager {
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
      console.log('Overlay sound initialization failed:', error);
    }
  }

  async play(soundName: string) {
    if (Platform.OS === 'web' || !this.initialized) return;
    
    try {
      let frequency = 440;
      let duration = 200;
      
      switch (soundName) {
        case 'menu_button':
          frequency = 800;
          duration = 150;
          break;
        case 'game_start':
          frequency = 1200;
          duration = 300;
          break;
        case 'menu_open':
          frequency = 600;
          duration = 250;
          break;
        case 'reward':
          frequency = 1000;
          duration = 400;
          break;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
        { shouldPlay: false, volume: 0.4 }
      );
      
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Overlay sound play failed:', error);
    }
  }
}

const overlaySoundManager = new OverlaySoundManager();

const Overlay: React.FC = () => {
  const { 
    gameActive, 
    isPaused, 
    gameStarting, 
    score, 
    highScore, 
    maxCombo,
    stats,
    startGame, 
    goToMainMenu 
  } = useGameStore();
  
  const { calculateGameReward, addCurrency, chronoCurrency } = useCosmeticsStore();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const [gameEndReward, setGameEndReward] = React.useState(0);

  // Initialize overlay sound manager
  React.useEffect(() => {
    overlaySoundManager.init();
  }, []);

  React.useEffect(() => {
    // Calculate and award CC when game ends
    if (!gameActive && !isPaused && score > 0 && gameEndReward === 0) {
      const isNewHighScore = score > highScore;
      const reward = calculateGameReward(score, maxCombo, isNewHighScore);
      addCurrency(reward);
      setGameEndReward(reward);
      
      // Play reward sound
      if (reward > 0) {
        overlaySoundManager.play('reward');
      }
    }
    
    // Reset reward when starting new game
    if (gameActive && gameEndReward > 0) {
      setGameEndReward(0);
    }
  }, [gameActive, isPaused, score, highScore, maxCombo, calculateGameReward, addCurrency, gameEndReward]);

  const handleButtonPress = async (action: () => void, soundType: string = 'menu_button') => {
    await overlaySoundManager.play(soundType);
    action();
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const navigateToShop = () => {
    router.push('/shop');
  };

  const handleStartGame = () => {
    handleButtonPress(startGame, 'game_start');
  };

  if (gameStarting) {
    return (
      <View style={[styles.overlay, styles.active]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(26, 26, 46, 0.9)']}
          style={styles.overlayGradient}
        >
          <Text style={styles.countdown}>Get Ready!</Text>
          <Text style={styles.countdownSubtext}>Game starting...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!gameActive && !isPaused) {
    if (score > 0) {
      // Game Over Screen
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(26, 26, 46, 0.95)']}
            style={styles.overlayGradient}
          >
            <View style={styles.gameOverContainer}>
              <Text style={styles.title}>Game Over!</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>Final Score: {formatNumber(score)}</Text>
                {maxCombo > 1 && (
                  <Text style={styles.comboScore}>Best Combo: x{maxCombo}</Text>
                )}
              </View>
              {gameEndReward > 0 && (
                <View style={styles.rewardContainer}>
                  <LinearGradient
                    colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']}
                    style={styles.rewardGradient}
                  >
                    <Text style={styles.rewardText}>💎 +{gameEndReward} CC Earned!</Text>
                  </LinearGradient>
                </View>
              )}
              <View style={styles.gameOverButtons}>
                <TouchableOpacity 
                  onPress={handleStartGame} 
                  style={[styles.button, styles.primaryButton]}
                >
                  <LinearGradient
                    colors={[Colors.light.tint, '#00CCCC']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Play Again</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleButtonPress(goToMainMenu)} 
                  style={[styles.button, styles.secondaryButton]}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Main Menu</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.highScore}>High Score: {formatNumber(highScore)}</Text>
            </View>
          </LinearGradient>
        </View>
      );
    } else if (showTutorial) {
      // Tutorial Screen
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.95)', 'rgba(26, 26, 46, 0.98)']}
            style={styles.overlayGradient}
          >
            <View style={styles.tutorialContainer}>
              <Text style={styles.title}>How to Play</Text>
              <ScrollView 
                style={styles.tutorialContent} 
                contentContainerStyle={styles.tutorialScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.tutorialHeading}>🎮 Controls:</Text>
                <Text style={styles.tutorialText}>• Drag your finger to guide your <Text style={{ color: Colors.light.tint }}>cyan orb</Text></Text>
                <Text style={styles.tutorialText}>• Tap <Text style={{ color: Colors.light.tint }}>Dash</Text> button for quick movement (has cooldown)</Text>
                
                <Text style={styles.tutorialHeading}>🎯 Objective:</Text>
                <Text style={styles.tutorialText}>• Collect particles before time runs out!</Text>
                <Text style={styles.tutorialText}>• Chain collections for <Text style={{ color: '#FFD700' }}>Combos</Text> to multiply your score!</Text>
                
                <Text style={styles.tutorialHeading}>✨ Particles:</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: Colors.light.secondary }}>Normal (Pink):</Text> Standard points</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#39FF14' }}>Fast (Green):</Text> More points, moves quickly</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#FFA500' }}>Large Bonus (Orange):</Text> Lots of points!</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#87CEEB' }}>Time Bonus (Blue):</Text> Adds seconds to clock</Text>
                
                <Text style={styles.tutorialHeading}>⚡ Power-Ups:</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#FFFF00' }}>Score Boost (Yellow):</Text> 2x points temporarily</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#4169E1' }}>Slow Enemy (Blue):</Text> Slows all particles</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: '#9370DB' }}>Confusion Orb (Purple):</Text> Reverses controls!</Text>
                
                <Text style={styles.tutorialHeading}>💎 Chrono Currency:</Text>
                <Text style={styles.tutorialText}>• Earn CC by playing and achieving high scores</Text>
                <Text style={styles.tutorialText}>• Spend CC in the shop for cosmetic upgrades</Text>
                <Text style={styles.tutorialText}>• Get daily login bonuses!</Text>
                
                <Text style={styles.tutorialHeading}>🏆 Good Luck, Collector!</Text>
              </ScrollView>
              <TouchableOpacity 
                onPress={() => handleButtonPress(() => setShowTutorial(false))} 
                style={[styles.button, styles.primaryButton]}
              >
                <LinearGradient
                  colors={[Colors.light.tint, '#00CCCC']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Got It!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    } else if (showStats) {
      // Stats Screen
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.95)', 'rgba(26, 26, 46, 0.98)']}
            style={styles.overlayGradient}
          >
            <View style={styles.statsContainer}>
              <Text style={styles.title}>Statistics</Text>
              <ScrollView 
                style={styles.statsScrollView}
                contentContainerStyle={styles.statsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Games Played</Text>
                  <Text style={styles.statValue}>{stats.totalGamesPlayed}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Score</Text>
                  <Text style={styles.statValue}>{formatNumber(stats.totalScore)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Time Played</Text>
                  <Text style={styles.statValue}>{formatTime(stats.totalTimeSpent)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Combo</Text>
                  <Text style={styles.statValue}>x{stats.bestCombo}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Particles Collected</Text>
                  <Text style={styles.statValue}>{formatNumber(stats.particlesCollected)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>High Score</Text>
                  <Text style={styles.statValue}>{formatNumber(highScore)}</Text>
                </View>
              </ScrollView>
              <TouchableOpacity 
                onPress={() => handleButtonPress(() => setShowStats(false))} 
                style={[styles.button, styles.primaryButton]}
              >
                <LinearGradient
                  colors={[Colors.light.tint, '#00CCCC']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    } else {
      // Main Menu - Enhanced with better gradients and sound
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(26, 26, 46, 0.95)']}
            style={styles.overlayGradient}
          >
            <View style={styles.mainMenuContainer}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>ChronoBurst</Text>
                <Text style={styles.subtitle}>Collect particles, harness powers, beat the clock!</Text>
              </View>
              
              {/* Currency Display */}
              <View style={styles.currencySection}>
                <View style={styles.currencyDisplay}>
                  <LinearGradient
                    colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
                    style={styles.currencyGradient}
                  >
                    <Text style={styles.currencyIcon}>💎</Text>
                    <View style={styles.currencyInfo}>
                      <Text style={styles.currencyAmount}>{formatNumber(chronoCurrency)}</Text>
                      <Text style={styles.currencyLabel}>Chrono Currency</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
              
              {/* Main Action */}
              <View style={styles.primaryActionSection}>
                <TouchableOpacity 
                  onPress={handleStartGame} 
                  style={[styles.button, styles.primaryButton, styles.startButton]}
                >
                  <LinearGradient
                    colors={[Colors.light.tint, '#00CCCC', '#008B8B']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.buttonText, styles.startButtonText]}>Start Game</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {/* Secondary Actions */}
              <View style={styles.secondaryActionsSection}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    onPress={() => handleButtonPress(navigateToShop)} 
                    style={[styles.button, styles.secondaryButton, styles.halfButton]}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.secondaryButtonIcon}>🛍️</Text>
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>Shop</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleButtonPress(() => setShowStats(true), 'menu_open')} 
                    style={[styles.button, styles.secondaryButton, styles.halfButton]}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.secondaryButtonIcon}>📊</Text>
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>Stats</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={() => handleButtonPress(() => setShowTutorial(true), 'menu_open')} 
                  style={[styles.button, styles.tertiaryButton]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.tertiaryButtonIcon}>❓</Text>
                    <Text style={[styles.buttonText, styles.tertiaryButtonText]}>How to Play</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Footer */}
              <View style={styles.footerSection}>
                <Text style={styles.highScore}>High Score: {formatNumber(highScore)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    }
  } else if (isPaused) {
    // Pause Screen
    return (
      <View style={[styles.overlay, styles.active]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(26, 26, 46, 0.95)']}
          style={styles.overlayGradient}
        >
          <View style={styles.pauseContainer}>
            <Text style={styles.title}>Paused</Text>
            <View style={styles.pauseInfo}>
              <Text style={styles.pauseScore}>Current Score: {formatNumber(score)}</Text>
              {maxCombo > 1 && (
                <Text style={styles.pauseCombo}>Current Best Combo: x{maxCombo}</Text>
              )}
            </View>
            <View style={styles.pauseButtons}>
              <TouchableOpacity 
                onPress={() => handleButtonPress(() => useGameStore.setState({ isPaused: false }))} 
                style={[styles.button, styles.primaryButton]}
              >
                <LinearGradient
                  colors={[Colors.light.tint, '#00CCCC']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleButtonPress(goToMainMenu)} 
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Main Menu</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.highScore}>High Score: {formatNumber(highScore)}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return null;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    opacity: 0,
    display: 'none',
  },
  active: {
    opacity: 1,
    display: 'flex',
  },
  overlayGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Main Menu Styles - Enhanced with gradients
  mainMenuContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 32,
    paddingVertical: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    flex: 0.25,
    justifyContent: 'center',
    minHeight: 120,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.light.tint,
    textShadowColor: Colors.light.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#b0b0b0',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '400',
    maxWidth: 320,
  },
  currencySection: {
    width: '100%',
    alignItems: 'center',
    flex: 0.15,
    justifyContent: 'center',
    minHeight: 80,
  },
  currencyDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  currencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 255, 0.25)',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    minWidth: 220,
    justifyContent: 'center',
  },
  currencyIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  currencyInfo: {
    alignItems: 'flex-start',
  },
  currencyAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
    letterSpacing: 0.5,
  },
  currencyLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  primaryActionSection: {
    width: '100%',
    alignItems: 'center',
    flex: 0.15,
    justifyContent: 'center',
    minHeight: 80,
  },
  secondaryActionsSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    flex: 0.25,
    justifyContent: 'center',
    minHeight: 140,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  footerSection: {
    alignItems: 'center',
    flex: 0.1,
    justifyContent: 'center',
    minHeight: 40,
  },
  
  // Enhanced Button Styles
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    shadowColor: Colors.light.tint,
  },
  startButton: {
    width: '100%',
    paddingVertical: 20,
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
  },
  halfButton: {
    flex: 1,
    paddingVertical: 16,
  },
  tertiaryButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  secondaryButtonText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonIcon: {
    fontSize: 18,
  },
  tertiaryButtonText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
  },
  tertiaryButtonIcon: {
    fontSize: 18,
  },
  highScore: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  // Game Over Styles
  gameOverContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  score: {
    fontSize: 20,
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  comboScore: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  rewardContainer: {
    marginBottom: 24,
  },
  rewardGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  
  // Pause Styles
  pauseContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  pauseInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pauseScore: {
    fontSize: 18,
    color: '#f0f0f0',
    marginBottom: 8,
    fontWeight: '600',
  },
  pauseCombo: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  pauseButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  
  // Tutorial Styles
  tutorialContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  tutorialContent: {
    flex: 1,
    marginVertical: 24,
  },
  tutorialScrollContent: {
    paddingBottom: 20,
  },
  tutorialHeading: {
    fontSize: 18,
    color: Colors.light.tint,
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '700',
  },
  tutorialText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#d0d0d0',
    lineHeight: 22,
  },
  
  // Stats Styles
  statsContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  statsScrollView: {
    flex: 1,
    marginVertical: 24,
  },
  statsScrollContent: {
    paddingBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '700',
  },
  
  // Countdown Styles
  countdown: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.light.tint,
    textShadowColor: Colors.light.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 16,
  },
  countdownSubtext: {
    fontSize: 18,
    color: '#e0e0e0',
    opacity: 0.8,
  },
});

export default Overlay;