import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface HUDProps {
  score: number;
  health: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  isPlayerInvincible?: boolean;
}

export default function HUD({ score, health, level, xp, xpToNextLevel, isPlayerInvincible = false }: HUDProps) {
  const healthPercentage = Math.max(0, health);
  const healthBarWidth = (healthPercentage / 100) * 120; // 120px max width
  const xpPercentage = (xp / xpToNextLevel) * 100;
  const xpBarWidth = (xpPercentage / 100) * 140; // 140px max width

  return (
    <>
      {/* Health Display - Top Left */}
      <View style={styles.healthContainer}>
        <Text style={[styles.healthText, isPlayerInvincible && styles.invincibleText]}>
          {health}
        </Text>
        <View style={styles.healthBarContainer}>
          <View style={styles.healthBarBackground} />
          <View 
            style={[
              styles.healthBarFill, 
              { width: healthBarWidth },
              isPlayerInvincible && styles.invincibleHealthBar
            ]} 
          />
        </View>
        {isPlayerInvincible && (
          <Text style={styles.invincibleLabel}>SHIELD</Text>
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
              { width: xpBarWidth }
            ]} 
          />
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
  },
  healthText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  invincibleText: {
    color: '#FFD700',
  },
  healthBarContainer: {
    position: 'relative',
    width: 120,
    height: 8,
    marginBottom: 4,
  },
  healthBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  healthBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 4,
  },
  invincibleHealthBar: {
    backgroundColor: '#FFD700',
  },
  invincibleLabel: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  levelContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
  },
  levelText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  xpBarContainer: {
    position: 'relative',
    width: 140,
    height: 6,
    marginBottom: 4,
  },
  xpBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 3,
  },
  xpBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  xpText: {
    color: 'rgba(255, 215, 0, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
});