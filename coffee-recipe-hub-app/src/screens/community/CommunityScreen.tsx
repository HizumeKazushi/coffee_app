// コミュニティ画面

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CommunityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>コミュニティ</Text>
        <Text style={styles.subtitle}>みんなのレシピを見つけよう</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.icon}>🌐</Text>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
        <Text style={styles.description}>
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#757575',
  },
  comingSoon: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#212121',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    color: '#757575',
  },
});
