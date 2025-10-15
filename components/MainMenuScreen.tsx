import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AnimatedButton from '@/components/AnimatedButton';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/stores/gameStore';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';

const { width, height } = Dimensions.get('window');

interface MainMenuScreenProps {
  onStartGame?: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onStartGame }) => {
  const { highScore, stats } = useGameStore();
  const { chronoCurrency } = useCosmeticsStore();

  const handleStartGame = () => {
    if (onStartGame) {
      onStartGame();
    } else {
      router.push('/');
    }
  };

  const handleShop = () => {
    router.push('/shop');
  };

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.primary, Colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Elements */}
        <View style={styles.backgroundElements}>
          {Array.from({ length: 20 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.floatingOrb,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  animationDelay: `${Math.random() * 5}s`,
                }
              ]}
            />
          ))}
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>ChronoBlast</Text>
            <Text style={styles.subtitle}>Master time, collect energy, become legend</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(highScore)}</Text>
              <Text style={styles.statLabel}>High Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(chronoCurrency)}</Text>
              <Text style={styles.statLabel}>Chrono Currency</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalGamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
          </View>

          {/* Main Actions */}
          <View style={styles.actionsContainer}>
            <AnimatedButton 
              title="Start Game" 
              onPress={handleStartGame}
              size="large"
              style={styles.primaryAction}
            />
            
            <View style={styles.secondaryActions}>
              <AnimatedButton 
                title="Shop" 
                onPress={handleShop}
                variant="secondary"
                size="medium"
                style={styles.secondaryAction}
              />
              <AnimatedButton 
                title="Settings" 
                onPress={handleSettings}
                variant="outline"
                size="medium"
                style={styles.secondaryAction}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Collect particles • Chain combos • Beat the clock
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  floatingOrb: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.title + 14,
    color: Colors.text,
    textAlign: 'center',
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: Spacing.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: Fonts.main,
    fontSize: FontSizes.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.subtitle,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontFamily: Fonts.main,
    fontSize: FontSizes.small,
    color: Colors.muted,
    textAlign: 'center',
  },
  actionsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  primaryAction: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  secondaryAction: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontFamily: Fonts.main,
    fontSize: FontSizes.small,
    color: Colors.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MainMenuScreen;