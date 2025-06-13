import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Trophy, Gem } from 'lucide-react-native';
import { useUpgradeStore } from '@/stores/upgradeStore';

export default function MainMenuScreen() {
  const router = useRouter();
  const { chronoShards, totalShardsEarned } = useUpgradeStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Gamepad2 size={64} color="#00FFFF" />
          </View>
          <Text style={styles.title}>ChronoBurst</Text>
          <Text style={styles.subtitle}>Collect particles, beat the clock</Text>
        </View>

        {/* ChronoShards Display */}
        <View style={styles.currencyContainer}>
          <View style={styles.currencyItem}>
            <Gem size={20} color="#9D4EDD" />
            <Text style={styles.currencyText}>{chronoShards.toLocaleString()}</Text>
            <Text style={styles.currencyLabel}>ChronoShards</Text>
          </View>
          {totalShardsEarned > 0 && (
            <Text style={styles.totalEarnedText}>
              Total Earned: {totalShardsEarned.toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/game')}
          >
            <Gamepad2 size={24} color="#1C1C1E" />
            <Text style={styles.primaryButtonText}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Trophy size={20} color="#00FFFF" />
            <Text style={styles.secondaryButtonText}>Upgrades</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  currencyContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
    width: '100%',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9D4EDD',
  },
  currencyLabel: {
    fontSize: 14,
    color: '#C77DFF',
    fontWeight: '500',
  },
  totalEarnedText: {
    fontSize: 12,
    color: 'rgba(157, 78, 221, 0.7)',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00FFFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#1C1C1E',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});