// ホーム画面

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const quickActions = [
    { title: '抽出を始める', icon: '☕', screen: 'Brewing' },
    { title: '豆を追加', icon: '🫘', screen: 'Beans' },
    { title: 'レシピ作成', icon: '📝', screen: 'Recipes' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>こんにちは ☕</Text>
        <Text style={styles.subtitle}>今日も美味しいコーヒーを</Text>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>クイックアクション</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard} onPress={() => navigation.navigate(action.screen)}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近の抽出</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>まだ抽出記録がありません</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    color: '#757575',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#212121',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#212121',
  },
  section: {
    padding: 16,
    marginTop: 16,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
  },
});
