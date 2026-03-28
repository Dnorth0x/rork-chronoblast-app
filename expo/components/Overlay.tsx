import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { PT } from '@/constants/gameConfig';
import { router } from 'expo-router';
import AnimatedButton from '@/components/AnimatedButton';

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
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(30, 27, 75, 0.9)']}
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
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(30, 27, 75, 0.95)']}
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
                    colors={['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.1)']}
                    style={styles.rewardGradient}
                  >
                    <Text style={styles.rewardText}>💎 +{gameEndReward} CC Earned!</Text>
                  </LinearGradient>
                </View>
              )}
              <View style={styles.gameOverButtons}>
                <AnimatedButton 
                  title="Play Again"
                  onPress={handleStartGame}
                  size="medium"
                  style={styles.gameOverButton}
                />
                <AnimatedButton 
                  title="Main Menu"
                  onPress={() => handleButtonPress(goToMainMenu)}
                  variant="outline"
                  size="medium"
                  style={styles.gameOverButton}
                />
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
            colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 27, 75, 0.98)']}
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
                <Text style={styles.tutorialText}>• Drag your finger to guide your <Text style={{ color: Colors.accent }}>cyan orb</Text></Text>
                <Text style={styles.tutorialText}>• Tap <Text style={{ color: Colors.accent }}>Dash</Text> button for quick movement (has cooldown)</Text>
                
                <Text style={styles.tutorialHeading}>🎯 Objective:</Text>
                <Text style={styles.tutorialText}>• Collect particles before time runs out!</Text>
                <Text style={styles.tutorialText}>• Chain collections for <Text style={{ color: Colors.warning }}>Combos</Text> to multiply your score!</Text>
                
                <Text style={styles.tutorialHeading}>✨ Particles:</Text>
                <Text style={styles.tutorialText}>• <Text style={{ color: Colors.secondary }}>Normal (Pink):</Text> Standard points</Text>
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
              <AnimatedButton 
                title="Got It!"
                onPress={() => handleButtonPress(() => setShowTutorial(false))}
                size="medium"
              />
            </View>
          </LinearGradient>
        </View>
      );
    } else if (showStats) {
      // Stats Screen
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 27, 75, 0.98)']}
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
              <AnimatedButton 
                title="Back"
                onPress={() => handleButtonPress(() => setShowStats(false))}
                variant="outline"
                size="medium"
              />
            </View>
          </LinearGradient>
        </View>
      );
    } else {
      // Main Menu - Enhanced with better gradients and sound
      return (
        <View style={[styles.overlay, styles.active]}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(30, 27, 75, 0.95)']}
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
                    colors={['rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.05)']}
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
                <AnimatedButton 
                  title="Start Game"
                  onPress={handleStartGame}
                  size="large"
                  style={styles.startButton}
                />
              </View>
              
              {/* Secondary Actions */}
              <View style={styles.secondaryActionsSection}>
                <View style={styles.buttonRow}>
                  <AnimatedButton 
                    title="🛍️ Shop"
                    onPress={() => handleButtonPress(navigateToShop)}
                    variant="secondary"
                    size="medium"
                    style={styles.halfButton}
                  />
                  <AnimatedButton 
                    title="📊 Stats"
                    onPress={() => handleButtonPress(() => setShowStats(true), 'menu_open')}
                    variant="secondary"
                    size="medium"
                    style={styles.halfButton}
                  />
                </View>
                <AnimatedButton 
                  title="❓ How to Play"
                  onPress={() => handleButtonPress(() => setShowTutorial(true), 'menu_open')}
                  variant="outline"
                  size="medium"
                />
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
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(30, 27, 75, 0.95)']}
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
              <AnimatedButton 
                title="Resume"
                onPress={() => handleButtonPress(() => useGameStore.setState({ isPaused: false }))}
                size="medium"
                style={styles.pauseButton}
              />
              <AnimatedButton 
                title="Main Menu"
                onPress={() => handleButtonPress(goToMainMenu)}
                variant="outline"
                size="medium"
                style={styles.pauseButton}
              />
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl * 2,
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
    fontSize: FontSizes.title + 12,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.main,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Spacing.lg,
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    minWidth: 220,
    justifyContent: 'center',
  },
  currencyIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  currencyInfo: {
    alignItems: 'flex-start',
  },
  currencyAmount: {
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  currencyLabel: {
    fontSize: FontSizes.small,
    fontFamily: Fonts.main,
    color: Colors.muted,
    marginTop: 2,
  },
  primaryActionSection: {
    width: '100%',
    alignItems: 'center',
    flex: 0.15,
    justifyContent: 'center',
    minHeight: 80,
  },
  startButton: {
    width: '100%',
  },
  secondaryActionsSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 0.25,
    justifyContent: 'center',
    minHeight: 140,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  footerSection: {
    alignItems: 'center',
    flex: 0.1,
    justifyContent: 'center',
    minHeight: 40,
  },
  highScore: {
    fontSize: FontSizes.small,
    fontFamily: Fonts.main,
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  
  // Game Over Styles
  gameOverContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  score: {
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  comboScore: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.warning,
  },
  rewardContainer: {
    marginBottom: Spacing.xl,
  },
  rewardGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  rewardText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gameOverButton: {
    flex: 1,
  },
  
  // Pause Styles
  pauseContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pauseInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pauseScore: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  pauseCombo: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.warning,
  },
  pauseButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  pauseButton: {
    flex: 1,
  },
  
  // Tutorial Styles
  tutorialContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  tutorialContent: {
    flex: 1,
    marginVertical: Spacing.xl,
  },
  tutorialScrollContent: {
    paddingBottom: Spacing.lg,
  },
  tutorialHeading: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tutorialText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.main,
    marginBottom: Spacing.sm,
    color: Colors.text,
    lineHeight: 22,
  },
  
  // Stats Styles
  statsContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  statsScrollView: {
    flex: 1,
    marginVertical: Spacing.xl,
  },
  statsScrollContent: {
    paddingBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.main,
    color: Colors.text,
  },
  statValue: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.bold,
    color: Colors.accent,
  },
  
  // Countdown Styles
  countdown: {
    fontSize: FontSizes.title + 12,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: Spacing.md,
  },
  countdownSubtext: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.main,
    color: Colors.text,
    opacity: 0.8,
  },
});

export default Overlay;