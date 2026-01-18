// レシピ選択画面 - 抽出用

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../../store';
import { Recipe } from '../../types';

export default function RecipeSelectScreen({ navigation }: any) {
  const { recipes, selectRecipe } = useRecipeStore();

  const handleSelect = (recipe: Recipe) => {
    selectRecipe(recipe);
    navigation.navigate('BrewingSession');
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeItem} onPress={() => handleSelect(item)}>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeMeta}>
          {item.coffeeGrams}g · {item.totalWaterMl}ml · {item.waterTemperature}℃
        </Text>
        <Text style={styles.stepsCount}>{item.steps.length}ステップ</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>レシピがありません</Text>
            <TouchableOpacity
              style={styles.createLink}
              onPress={() => navigation.navigate('Recipes', { screen: 'RecipeEditor' })}
            >
              <Text style={styles.createLinkText}>レシピを作成する →</Text>
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
    padding: 24,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  recipeMeta: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  stepsCount: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  createLink: {
    paddingVertical: 8,
  },
  createLinkText: {
    fontSize: 14,
    color: '#1a1a1a',
    textDecorationLine: 'underline',
  },
});
