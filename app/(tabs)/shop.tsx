import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Gem, Heart, Zap, Target, Clock, TrendingUp, Shield } from 'lucide-react-native';
import { useUpgradeStore } from '@/stores/upgradeStore';
import { upgradeData, upgradeCategories, getUpgradeCost, getUpgradeValue } from '@/game/upgradeData';

const iconMap = {
  heart: Heart,
  zap: Zap,
  target: Target,
  clock: Clock,
  'trending-up': TrendingUp,
  shield: Shield,
};

export default function ShopScreen() {
  const { 
    chronoShards, 
    getUpgradeLevel, 
    purchaseUpgrade, 
    canAffordUpgrade,
    totalShardsSpent 
  } = useUpgradeStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('combat');

  const handlePurchaseUpgrade = (upgradeId: string) => {
    const upgrade = upgradeData[upgradeId];
    const currentLevel = getUpgradeLevel(upgradeId);
    const cost = getUpgradeCost(upgradeId, currentLevel);
    
    if (currentLevel >= upgrade.maxLevel) {
      Alert.alert('Max Level', `${upgrade.label} is already at maximum level.`);
      return;
    }
    
    if (!canAffordUpgrade(upgradeId)) {
      Alert.alert('Insufficient Shards', `You need ${cost} ChronoShards to purchase this upgrade.`);
      return;
    }
    
    const success = purchaseUpgrade(upgradeId);
    if (success) {
      Alert.alert('Upgrade Purchased!', `${upgrade.label} upgraded to level ${currentLevel + 1}.`);
    }
  };

  const filteredUpgrades = Object.values(upgradeData).filter(
    upgrade => upgrade.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Upgrades',
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      {/* Currency Display */}
      <View style={styles.currencyHeader}>
        <View style={styles.currencyItem}>
          <Gem size={24} color="#9D4EDD" />
          <Text style={styles.currencyText}>{chronoShards.toLocaleString()}</Text>
        </View>
        <Text style={styles.spentText}>Spent: {totalShardsSpent.toLocaleString()}</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {Object.entries(upgradeCategories).map(([key, category]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryTab,
              selectedCategory === key && styles.categoryTabActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(key)}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === key && { color: category.color }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Description */}
      <View style={styles.categoryDescription}>
        <Text style={[
          styles.categoryDescriptionText,
          { color: upgradeCategories[selectedCategory].color }
        ]}>
          {upgradeCategories[selectedCategory].description}
        </Text>
      </View>

      {/* Upgrades List */}
      <ScrollView style={styles.upgradesList} showsVerticalScrollIndicator={false}>
        {filteredUpgrades.map(upgrade => {
          const currentLevel = getUpgradeLevel(upgrade.id);
          const cost = getUpgradeCost(upgrade.id, currentLevel);
          const canAfford = canAffordUpgrade(upgrade.id);
          const isMaxLevel = currentLevel >= upgrade.maxLevel;
          const IconComponent = iconMap[upgrade.icon as keyof typeof iconMap];
          const currentValue = getUpgradeValue(upgrade.id, currentLevel);
          const nextValue = getUpgradeValue(upgrade.id, currentLevel + 1);

          return (
            <View key={upgrade.id} style={styles.upgradeCard}>
              <View style={styles.upgradeHeader}>
                <View style={styles.upgradeIcon}>
                  <IconComponent size={24} color={upgradeCategories[upgrade.category].color} />
                </View>
                <View style={styles.upgradeInfo}>
                  <Text style={styles.upgradeName}>{upgrade.label}</Text>
                  <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
                </View>
                <View style={styles.upgradeLevelBadge}>
                  <Text style={styles.upgradeLevelText}>
                    {currentLevel}/{upgrade.maxLevel}
                  </Text>
                </View>
              </View>

              {/* Current/Next Value Display */}
              <View style={styles.upgradeValues}>
                <Text style={styles.upgradeValueText}>
                  Current: {upgrade.id.includes('multiplier') || upgrade.id.includes('speed') 
                    ? `+${(currentValue * 100).toFixed(0)}%` 
                    : `+${currentValue}`}
                </Text>
                {!isMaxLevel && (
                  <Text style={styles.upgradeNextValueText}>
                    Next: {upgrade.id.includes('multiplier') || upgrade.id.includes('speed') 
                      ? `+${(nextValue * 100).toFixed(0)}%` 
                      : `+${nextValue}`}
                  </Text>
                )}
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  !canAfford && !isMaxLevel && styles.purchaseButtonDisabled,
                  isMaxLevel && styles.purchaseButtonMaxLevel,
                ]}
                onPress={() => handlePurchaseUpgrade(upgrade.id)}
                disabled={!canAfford || isMaxLevel}
              >
                <View style={styles.purchaseButtonContent}>
                  {isMaxLevel ? (
                    <Text style={styles.purchaseButtonTextMaxLevel}>MAX LEVEL</Text>
                  ) : (
                    <>
                      <Gem size={16} color={canAfford ? '#1C1C1E' : '#666'} />
                      <Text style={[
                        styles.purchaseButtonText,
                        !canAfford && styles.purchaseButtonTextDisabled
                      ]}>
                        {cost.toLocaleString()}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(157, 78, 221, 0.2)',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9D4EDD',
  },
  spentText: {
    fontSize: 14,
    color: 'rgba(157, 78, 221, 0.7)',
    fontWeight: '500',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryDescription: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryDescriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  upgradesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  upgradeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  upgradeLevelBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upgradeLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FFFF',
  },
  upgradeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  upgradeValueText: {
    fontSize: 14,
    color: '#00FF88',
    fontWeight: '500',
  },
  upgradeNextValueText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  purchaseButton: {
    backgroundColor: '#9D4EDD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
  },
  purchaseButtonMaxLevel: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  purchaseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  purchaseButtonTextDisabled: {
    color: '#666',
  },
  purchaseButtonTextMaxLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF88',
  },
});