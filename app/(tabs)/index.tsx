import React from 'react';
import { Stack } from 'expo-router';
import MainMenuScreen from '@/components/MainMenuScreen';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'ChronoBurst',
          headerShown: false,
        }} 
      />
      <MainMenuScreen />
    </>
  );
}