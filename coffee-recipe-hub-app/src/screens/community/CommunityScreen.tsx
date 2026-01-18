// コミュニティ画面

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store';
import { Typography, Spacing, BorderRadius, LightTheme, DarkTheme } from '../../utils/theme';

export default function CommunityScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>コミュニティ</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>みんなのレシピを見つけよう</Text>
      </View>

      <View style={[styles.comingSoon, { backgroundColor: theme.surface }]}>
        <Text style={styles.icon}>🌐</Text>
        <Text style={[styles.comingSoonText, { color: theme.text }]}>Coming Soon</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          コミュニティ機能は現在開発中です。{'\n'}
          レシピの共有やフォロー機能が追加される予定です。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing['2xl'],
  },
  title: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.xs,
  },
  comingSoon: {
    margin: Spacing.lg,
    padding: Spacing['3xl'],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  comingSoonText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
