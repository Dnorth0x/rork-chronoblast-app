import React from 'react';
import { Stack } from 'expo-router';
import GameScreen from '@/components/GameScreen';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'ChronoBurst',
          headerShown: false,
        }} 
      />
      <GameScreen />
    </>
  );
}