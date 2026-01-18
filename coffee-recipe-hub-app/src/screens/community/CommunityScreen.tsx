// コミュニティ画面 - ミニマルデザイン

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CommunityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>コミュニティ</Text>
        <Text style={styles.subtitle}>みんなのレシピを見つけよう</Text>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonLabel}>Coming Soon</Text>
          <Text style={styles.description}>
            コミュニティ機能は現在開発中です。{'\n'}
            レシピの共有やフォロー機能が追加される予定です。
          </Text>
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
  content: {
    padding: 24,
    paddingTop: 40,
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
  },
  comingSoon: {
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  comingSoonLabel: {
    fontSize: 12,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
