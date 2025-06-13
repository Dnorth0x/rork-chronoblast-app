import React from 'react';
import { Stack } from 'expo-router';
import GameScreen from '@/components/GameScreen';

export default function Game() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'ChronoBurst - Game',
          headerShown: false,
        }} 
      />
      <GameScreen />
    </>
  );
}