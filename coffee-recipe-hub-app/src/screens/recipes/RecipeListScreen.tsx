// レシピ一覧画面

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRecipeStore } from '../../store';
import { Recipe } from '../../types';

export default function RecipeListScreen({ navigation }: any) {
  const { recipes } = useRecipeStore();

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Text style={styles.params}>
        {item.coffeeGrams}g / {item.totalWaterMl}ml
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>レシピがありません</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>レシピを作成</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  params: {
    fontSize: 14,
    marginTop: 4,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#757575',
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#977669',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
