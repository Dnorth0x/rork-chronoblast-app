import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HUDProps {
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  timeElapsed: number;
  onPause?: () => void;
}

const HUD: React.FC<HUDProps> = ({
  health,
  maxHealth,
  level,
  xp,
  xpToNextLevel,
  timeElapsed,
  onPause,
}) => {
  const insets = useSafeAreaInsets();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const healthPercentage = (health / maxHealth) * 100;
  const xpPercentage = (xp / xpToNextLevel) * 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View style={styles.healthContainer}>
            <Text style={styles.label}>HP</Text>
            <View style={styles.healthBar}>
              <View 
                style={[
                  styles.healthFill, 
                  { 
                    width: `${healthPercentage}%`,
                    backgroundColor: healthPercentage > 50 ? '#00ff00' : healthPercentage > 25 ? '#ffaa00' : '#ff0000'
                  }
                ]} 
              />
            </View>
            <Text style={styles.healthText}>{health}/{maxHealth}</Text>
          </View>
          
          <View style={styles.xpContainer}>
            <Text style={styles.label}>Level {level}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
            </View>
            <Text style={styles.xpText}>{xp}/{xpToNextLevel} XP</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>TIME</Text>
            <Text style={styles.timeValue}>{formatTime(timeElapsed)}</Text>
          </View>
          
          {onPause && (
            <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
              <Text style={styles.pauseText}>⏸</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: 10,
    pointerEvents: 'box-none',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    gap: 8,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  healthContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
  },
  label: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthBar: {
    width: 150,
    height: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthFill: {
    height: '100%',
    borderRadius: 8,
  },
  healthText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  xpContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  xpBar: {
    width: 150,
    height: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#00ffff',
    borderRadius: 6,
  },
  xpText: {
    color: '#00ffff',
    fontSize: 9,
    fontWeight: '600',
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80,
  },
  timeLabel: {
    color: '#aaaaaa',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 50,
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 20,
  },
});

export default HUD;
