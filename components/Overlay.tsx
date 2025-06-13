import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { PT } from '@/constants/gameConfig';
import { router } from 'expo-router';

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

  React.useEffect(() => {
    // Calculate and award CC when game ends
    if (!gameActive && !isPaused && score > 0 && gameEndReward === 0) {
      const isNewHighScore = score > highScore;
      const reward = calculateGameReward(score, maxCombo, isNewHighScore);
      addCurrency(reward);
      setGameEndReward(reward);
    }
    
    // Reset reward when starting new game
    if (gameActive && gameEndReward > 0) {
      setGameEndReward(0);
    }
  }, [gameActive, isPaused, score, highScore, maxCombo, calculateGameReward, addCurrency, gameEndReward]);

  const handleButtonPress = async (action: () => void) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
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

  if (gameStarting) {
    return (
      <View style={[styles.overlay, styles.active]}>
        <Text style={styles.countdown}>Get Ready!</Text>
        <Text style={styles.countdownSubtext}>Game starting...</Text>
      </View>
    );
  }

  if (!gameActive && !isPaused) {
    if (score > 0) {
      // Game Over Screen
      return (
        <View style={[styles.overlay, styles.active]}>
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
                <Text style={styles.rewardText}>💎 +{gameEndReward} CC Earned!</Text>
              </View>
            )}
            <View style={styles.gameOverButtons}>
              <TouchableOpacity 
                onPress={() => handleButtonPress(startGame)} 
                style={[styles.button, styles.primaryButton]}
              >
                <Text style={styles.buttonText}>Play Again</Text>
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
        </View>
      );
    } else if (showTutorial) {
      // Tutorial Screen
      return (
        <View style={[styles.overlay, styles.active]}>
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
              <Text style={styles.buttonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (showStats) {
      // Stats Screen
      return (
        <View style={[styles.overlay, styles.active]}>
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
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      // Main Menu - Professional redesign with better spacing and no overlapping
      return (
        <View style={[styles.overlay, styles.active]}>
          <View style={styles.mainMenuContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>ChronoBurst</Text>
              <Text style={styles.subtitle}>Collect particles, harness powers, beat the clock!</Text>
            </View>
            
            {/* Currency Display */}
            <View style={styles.currencySection}>
              <View style={styles.currencyDisplay}>
                <Text style={styles.currencyIcon}>💎</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyAmount}>{formatNumber(chronoCurrency)}</Text>
                  <Text style={styles.currencyLabel}>Chrono Currency</Text>
                </View>
              </View>
            </View>
            
            {/* Main Action */}
            <View style={styles.primaryActionSection}>
              <TouchableOpacity 
                onPress={() => handleButtonPress(startGame)} 
                style={[styles.button, styles.primaryButton, styles.startButton]}
              >
                <Text style={[styles.buttonText, styles.startButtonText]}>Start Game</Text>
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
                  onPress={() => handleButtonPress(() => setShowStats(true))} 
                  style={[styles.button, styles.secondaryButton, styles.halfButton]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.secondaryButtonIcon}>📊</Text>
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>Stats</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={() => handleButtonPress(() => setShowTutorial(true))} 
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
        </View>
      );
    }
  } else if (isPaused) {
    // Pause Screen
    return (
      <View style={[styles.overlay, styles.active]}>
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
              <Text style={styles.buttonText}>Resume</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
  
  // Main Menu Styles - Professional redesign with better spacing
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
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
  
  // Button Styles - Enhanced for professional look
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
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
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
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