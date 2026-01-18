// COFFEE RECIPE HUB - メインエントリーポイント

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { useThemeStore } from './src/store';

export default function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <SafeAreaProvider>
      <Navigation />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
