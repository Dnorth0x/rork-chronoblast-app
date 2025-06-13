import React from 'react';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from 'expo-router';
import Colors from '@/constants/colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: 'rgba(0, 255, 255, 0.2)',
          borderTopWidth: 1,
        },
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ChronoBurst",
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
          tabBarLabel: "Game",
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Cosmetic Shop",
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
          tabBarLabel: "Shop",
        }}
      />
    </Tabs>
  );
}