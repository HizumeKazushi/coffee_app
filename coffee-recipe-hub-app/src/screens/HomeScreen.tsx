// ホーム画面 - ミニマルデザイン

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coffee Recipe Hub</Text>
        <Text style={styles.subtitle}>今日も美味しいコーヒーを</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>クイックアクション</Text>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Brewing')}>
          <View style={styles.actionLeft}>
            <Ionicons name="cafe-outline" size={20} color="#1a1a1a" />
            <Text style={styles.actionText}>抽出を始める</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Beans')}>
          <View style={styles.actionLeft}>
            <Ionicons name="leaf-outline" size={20} color="#1a1a1a" />
            <Text style={styles.actionText}>豆を管理</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Recipes')}>
          <View style={styles.actionLeft}>
            <Ionicons name="document-text-outline" size={20} color="#1a1a1a" />
            <Text style={styles.actionText}>レシピを作成</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>最近の抽出</Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontWeight: '400',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  emptyState: {
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
  },
});
