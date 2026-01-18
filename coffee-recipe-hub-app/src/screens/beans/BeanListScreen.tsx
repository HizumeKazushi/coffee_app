// 豆一覧画面

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useThemeStore, useBeanStore } from '../../store';
import { Colors, Typography, Spacing, BorderRadius, LightTheme, DarkTheme } from '../../utils/theme';
import { Bean, RoastLevel } from '../../types';

const roastLevelLabels: Record<RoastLevel, string> = {
  LIGHT: '浅煎り',
  MEDIUM_LIGHT: '中浅煎り',
  MEDIUM: '中煎り',
  MEDIUM_DARK: '中深煎り',
  DARK: '深煎り',
};

export default function BeanListScreen({ navigation }: any) {
  const { isDarkMode } = useThemeStore();
  const { beans } = useBeanStore();
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const renderBeanCard = ({ item }: { item: Bean }) => (
    <TouchableOpacity
      style={[styles.beanCard, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate('BeanDetail', { beanId: item.id })}
    >
      <View style={styles.beanHeader}>
        <Text style={[styles.beanName, { color: theme.text }]}>{item.name}</Text>
        <View style={[styles.stockBadge, { backgroundColor: item.stockGrams > 50 ? Colors.success : Colors.warning }]}>
          <Text style={styles.stockText}>{item.stockGrams}g</Text>
        </View>
      </View>
      <Text style={[styles.roasterName, { color: theme.textSecondary }]}>{item.roasterName}</Text>
      <View style={styles.beanMeta}>
        <View style={[styles.roastBadge, { backgroundColor: Colors.roastLevel[item.roastLevel] }]}>
          <Text style={styles.roastText}>{roastLevelLabels[item.roastLevel]}</Text>
        </View>
        <Text style={[styles.origin, { color: theme.textSecondary }]}>{item.origin}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={beans}
        renderItem={renderBeanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🫘</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>豆が登録されていません</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('BeanAdd')}
            >
              <Text style={styles.addButtonText}>豆を追加</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {beans.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('BeanAdd')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  beanCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  beanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beanName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  stockText: {
    color: '#fff',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  roasterName: {
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.xs,
  },
  beanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  roastBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  roastText: {
    color: '#fff',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  origin: {
    fontSize: Typography.fontSizes.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSizes.lg,
    marginBottom: Spacing.xl,
  },
  addButton: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addButtonText: {
    color: '#fff',
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: Typography.fontWeights.bold,
  },
});
