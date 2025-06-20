import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import GameCanvas from '@/components/GameCanvas';
import GameUI from '@/components/GameUI';
import Overlay from '@/components/Overlay';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'ChronoBurst',
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <GameCanvas />
        <GameUI />
        <Overlay />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});