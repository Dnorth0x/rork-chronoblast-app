import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import CosmeticShop from '@/components/CosmeticShop';

export default function ShopScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Shop',
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#00BFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShown: false, // Hide header to prevent overlap with game UI
        }} 
      />
      <View style={styles.container}>
        <CosmeticShop />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});