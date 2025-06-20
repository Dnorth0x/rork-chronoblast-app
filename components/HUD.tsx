import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/constants/theme';

interface HUDProps {
  score: number;
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  isPlayerInvincible?: boolean;
}

export default function HUD({ score, health, maxHealth, level, xp, xpToNextLevel, isPlayerInvincible = false }: HUDProps) {
  const healthPercentage = Math.max(0, (health / maxHealth) * 100);
  const xpPercentage = (xp / xpToNextLevel) * 100;

  const getHealthBarColor = () => {
    if (healthPercentage > 60) return Colors.success;
    if (healthPercentage > 30) return Colors.warning;
    return Colors.danger;
  };

  return (
    <>
      {/* Health Display - Top Left */}
      <View style={styles.healthContainer}>
        <Text style={[styles.healthLabel, isPlayerInvincible && styles.invincibleText]}>
          HEALTH
        </Text>
        <View style={styles.healthBarContainer}>
          <View style={styles.healthBarBackground} />
          <View 
            style={[
              styles.healthBarFill, 
              { 
                width: `${healthPercentage}%`,
                backgroundColor: isPlayerInvincible ? Colors.accent : getHealthBarColor()
              }
            ]} 
          />
          <View style={styles.healthBarGlow} />
        </View>
        <Text style={[styles.healthText, isPlayerInvincible && styles.invincibleText]}>
          {health}/{maxHealth}
        </Text>
        {isPlayerInvincible && (
          <Text style={styles.invincibleLabel}>SHIELD ACTIVE</Text>
        )}
      </View>

      {/* Score Display - Top Center */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score * 10}</Text>
      </View>

      {/* Level and XP Display - Top Right */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>LVL {level}</Text>
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBackground} />
          <View 
            style={[
              styles.xpBarFill, 
              { width: `${xpPercentage}%` }
            ]} 
          />
          <View style={styles.xpBarGlow} />
        </View>
        <Text style={styles.xpText}>{xp}/{xpToNextLevel}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  healthContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  healthLabel: {
    color: Colors.muted,
    fontSize: FontSizes.small,
    fontFamily: Fonts.bold,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  healthBarContainer: {
    position: 'relative',
    width: 120,
    height: 12,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  healthBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.sm,
  },
  healthBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: BorderRadius.sm,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  healthBarGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthText: {
    color: Colors.text,
    fontSize: FontSizes.small,
    fontFamily: Fonts.bold,
  },
  invincibleText: {
    color: Colors.accent,
  },
  invincibleLabel: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -75 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 150,
  },
  scoreLabel: {
    color: Colors.muted,
    fontSize: FontSizes.small,
    fontFamily: Fonts.bold,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  scoreValue: {
    color: Colors.accent,
    fontSize: FontSizes.large,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  levelContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelText: {
    color: Colors.warning,
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.bold,
    marginBottom: Spacing.xs,
    textShadowColor: Colors.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  xpBarContainer: {
    position: 'relative',
    width: 140,
    height: 8,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  xpBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: BorderRadius.sm,
  },
  xpBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  xpBarGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  xpText: {
    color: 'rgba(245, 158, 11, 0.8)',
    fontSize: FontSizes.small,
    fontFamily: Fonts.main,
  },
});