import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import GameCanvas from '@/components/GameCanvas';
import GameUI from '@/components/GameUI';
import Overlay from '@/components/Overlay';
import { useGameStore } from '@/stores/gameStore';

export default function GameScreen() {
  const { gameStarting, startGame } = useGameStore();

  useEffect(() => {
    if (gameStarting) {
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          useGameStore.setState({ gameStarting: false });
        }
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [gameStarting]);

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
    backgroundColor: '#1a1a2e',
  },
});