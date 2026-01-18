// ホーム画面

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius, LightTheme, DarkTheme } from '../utils/theme';

export default function HomeScreen({ navigation }: any) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const quickActions = [
    { title: '抽出を始める', icon: '☕', screen: 'BrewingTab' },
    { title: '豆を追加', icon: '🫘', screen: 'BeansTab' },
    { title: 'レシピ作成', icon: '📝', screen: 'RecipesTab' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>こんにちは ☕</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>今日も美味しいコーヒーを</Text>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>クイックアクション</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>最近の抽出</Text>
        <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>まだ抽出記録がありません</Text>
        </View>
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
    paddingTop: Spacing['3xl'],
  },
  greeting: {
    fontSize: Typography.fontSizes['4xl'],
    fontWeight: Typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.lg,
    marginTop: Spacing.xs,
  },
  quickActionsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    textAlign: 'center',
  },
  section: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  emptyState: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
  },
});
