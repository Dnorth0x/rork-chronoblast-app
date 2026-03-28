import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCosmeticsStore } from '@/stores/cosmeticsStore';
import { COSMETIC_ITEMS, RARITY_COLORS, CosmeticItem } from '@/constants/cosmetics';
import Colors from '@/constants/colors';

const CosmeticShop: React.FC = () => {
  const {
    chronoCurrency,
    purchaseItem,
    equipItem,
    getShopItems,
    claimDailyLogin,
  } = useCosmeticsStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('player');
  const [shopItems] = useState(getShopItems());

  const categories = [
    { id: 'player', name: 'Player', icon: '⭕', count: shopItems.filter(i => i.category === 'player').length },
    { id: 'trail', name: 'Trails', icon: '✨', count: shopItems.filter(i => i.category === 'trail').length },
    { id: 'background', name: 'Backgrounds', icon: '🌌', count: shopItems.filter(i => i.category === 'background').length },
  ];

  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  const handleHapticFeedback = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
  };

  const handlePurchase = async (item: CosmeticItem) => {
    await handleHapticFeedback();
    
    if (item.unlocked) {
      equipItem(item.id);
      return;
    }

    if (chronoCurrency >= item.price) {
      const success = purchaseItem(item.id);
      if (success) {
        equipItem(item.id);
        Alert.alert(
          'Purchase Successful! 🎉', 
          `You bought ${item.name} and equipped it!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
        
        if (Platform.OS !== 'web') {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            // Haptics not available
          }
        }
      }
    } else {
      Alert.alert(
        'Insufficient Funds 💸', 
        `You need ${item.price - chronoCurrency} more CC to purchase this item.`,
        [{ text: 'OK', style: 'default' }]
      );
      
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
          // Haptics not available
        }
      }
    }
  };

  const handleDailyLogin = async () => {
    await handleHapticFeedback();
    const reward = claimDailyLogin();
    if (reward > 0) {
      Alert.alert(
        'Daily Bonus! 🎁', 
        `You received ${reward} CC for logging in today!`,
        [{ text: 'Sweet!', style: 'default' }]
      );
      
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          // Haptics not available
        }
      }
    } else {
      Alert.alert(
        'Already Claimed ✅', 
        'You have already claimed your daily bonus today. Come back tomorrow!',
        [{ text: 'Got it', style: 'default' }]
      );
    }
  };

  const getRarityStyle = (rarity: string) => ({
    borderColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
    shadowColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cosmetic Shop</Text>
        <Text style={styles.subtitle}>Customize your ChronoBurst experience</Text>
      </View>

      {/* Currency Bar */}
      <View style={styles.currencySection}>
        <View style={styles.currencyBar}>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyIcon}>💎</Text>
            <View style={styles.currencyDetails}>
              <Text style={styles.currencyText}>{formatNumber(chronoCurrency)}</Text>
              <Text style={styles.currencySubtext}>Chrono Currency</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleDailyLogin} style={styles.dailyButton}>
            <Text style={styles.dailyButtonIcon}>🎁</Text>
            <Text style={styles.dailyButtonText}>Daily</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={async () => {
                await handleHapticFeedback();
                setSelectedCategory(category.id);
              }}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
              <Text style={styles.categoryCount}>({category.count})</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView 
        style={styles.itemsScrollView}
        contentContainerStyle={styles.itemsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemsGrid}>
          {filteredItems.map(item => (
            <View key={item.id} style={[styles.itemCard, getRarityStyle(item.rarity)]}>
              <View style={styles.itemHeader}>
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[item.rarity] }]}>
                  <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                </View>
                {item.equipped && (
                  <View style={styles.equippedBadge}>
                    <Text style={styles.equippedText}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.itemPreview}>
                <View style={[
                  styles.previewOrb,
                  { backgroundColor: item.colors?.[0] || Colors.light.tint }
                ]} />
                {item.effect && (
                  <Text style={styles.effectText}>{item.effect}</Text>
                )}
              </View>
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  item.unlocked && styles.equipButton,
                  item.equipped && styles.equippedButton,
                  !item.unlocked && chronoCurrency < item.price && styles.cantAffordButton,
                ]}
                onPress={() => handlePurchase(item)}
                disabled={item.equipped}
              >
                <Text style={[
                  styles.purchaseButtonText,
                  !item.unlocked && chronoCurrency < item.price && styles.cantAffordText,
                ]}>
                  {item.equipped ? '✓ Equipped' : item.unlocked ? 'Equip' : `${item.price} CC`}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.tint,
    textShadowColor: Colors.light.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  
  // Currency Section
  currencySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  currencySubtext: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  dailyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 6,
  },
  dailyButtonIcon: {
    fontSize: 16,
  },
  dailyButtonText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Category Section
  categorySection: {
    paddingVertical: 8,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 100,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: Colors.light.tint,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryTextActive: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  categoryCount: {
    color: '#888',
    fontSize: 10,
  },
  
  // Items Section
  itemsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemsScrollContent: {
    paddingBottom: 40,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rarityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rarityText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
  },
  equippedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  itemPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewOrb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    marginBottom: 8,
  },
  effectText: {
    fontSize: 10,
    color: '#aaa',
    fontStyle: 'italic',
  },
  itemInfo: {
    marginBottom: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 16,
  },
  purchaseButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  equipButton: {
    backgroundColor: Colors.light.secondary,
  },
  equippedButton: {
    backgroundColor: '#4a4a4a',
  },
  cantAffordButton: {
    backgroundColor: '#666',
  },
  purchaseButtonText: {
    color: '#1a1a2e',
    fontSize: 13,
    fontWeight: '600',
  },
  cantAffordText: {
    color: '#999',
  },
});

export default CosmeticShop;