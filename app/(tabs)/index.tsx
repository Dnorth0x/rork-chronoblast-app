import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Canvas, Fill } from '@shopify/react-native-skia';
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
        <Canvas style={styles.canvas}>
          <Fill color={Colors.background} />
        </Canvas>
        <View style={styles.gameContent}>
          <GameCanvas />
          <GameUI />
          <Overlay />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Ensures canvas is behind all other content
  },
  gameContent: {
    flex: 1,
    zIndex: 1,
  },
});