import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CosmeticShop from '@/components/Shop';
import { Colors, Spacing } from '@/constants/theme';

export default function ShopScreen() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Shop',
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.background, Colors.primary]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.8}
            >
              <ArrowLeft size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Shop Content */}
          <CosmeticShop />
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
});