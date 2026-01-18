// レシピ一覧画面 - ミニマルデザイン

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../../store';
import { Recipe } from '../../types';

export default function RecipeListScreen({ navigation }: any) {
  const { recipes, fetchRecipes } = useRecipeStore();

  React.useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeItem} onPress={() => navigation.navigate('RecipeEditor', { recipe: item })}>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeMeta}>
          {item.coffeeGrams}g · {item.totalWaterMl}ml · {item.waterTemperature}℃
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
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
            <Text style={styles.emptyText}>レシピがありません</Text>
            <TouchableOpacity style={styles.addLink} onPress={() => navigation.navigate('RecipeEditor')}>
              <Text style={styles.addLinkText}>作成する →</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {recipes.length > 0 && (
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RecipeEditor')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  addLink: {
    paddingVertical: 8,
  },
  addLinkText: {
    fontSize: 14,
    color: '#1a1a1a',
    textDecorationLine: 'underline',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
