// レシピ一覧画面

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useThemeStore, useRecipeStore } from '../../store';
import { Typography, Spacing, BorderRadius, LightTheme, DarkTheme } from '../../utils/theme';
import { Recipe, Equipment } from '../../types';

const equipmentLabels: Record<Equipment, string> = {
  V60: 'V60',
  KALITA_WAVE: 'カリタウェーブ',
  CHEMEX: 'ケメックス',
  AEROPRESS: 'エアロプレス',
  FRENCH_PRESS: 'フレンチプレス',
  CLEVER: 'クレバー',
  OTHER: 'その他',
};

export default function RecipeListScreen({ navigation }: any) {
  const { isDarkMode } = useThemeStore();
  const { recipes } = useRecipeStore();
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={[styles.recipeCard, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Text style={[styles.recipeTitle, { color: theme.text }]}>{item.title}</Text>
      <View style={styles.recipeMeta}>
        <Text style={[styles.equipment, { color: theme.textSecondary }]}>{equipmentLabels[item.equipment]}</Text>
        <Text style={[styles.separator, { color: theme.textSecondary }]}>•</Text>
        <Text style={[styles.params, { color: theme.textSecondary }]}>
          {item.coffeeGrams}g / {item.totalWaterMl}ml
        </Text>
      </View>
      <View style={styles.stepsPreview}>
        {item.steps.slice(0, 3).map((step, index) => (
          <View key={index} style={[styles.stepBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.stepText, { color: theme.text }]}>
              {step.timeSeconds}s: {step.waterMl}ml
            </Text>
          </View>
        ))}
        {item.steps.length > 3 && (
          <Text style={[styles.moreSteps, { color: theme.textSecondary }]}>+{item.steps.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>レシピがありません</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('RecipeEditor')}
            >
              <Text style={styles.addButtonText}>レシピを作成</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {recipes.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('RecipeEditor')}
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
  recipeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  recipeTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  equipment: {
    fontSize: Typography.fontSizes.md,
  },
  separator: {
    marginHorizontal: Spacing.sm,
  },
  params: {
    fontSize: Typography.fontSizes.md,
  },
  stepsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  stepBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  stepText: {
    fontSize: Typography.fontSizes.xs,
  },
  moreSteps: {
    fontSize: Typography.fontSizes.sm,
    marginLeft: Spacing.xs,
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
