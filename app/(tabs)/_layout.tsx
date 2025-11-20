import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        headerTitle: '',
      }}>
      <Tabs.Screen
        name="requests"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/list_white.png')}
              style={{ width: 32, height: 32, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/qrcode_white.png')}
              style={{ width: 32, height: 32, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}