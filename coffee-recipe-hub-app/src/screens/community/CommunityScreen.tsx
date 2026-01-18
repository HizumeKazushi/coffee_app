// コミュニティ画面 - 公開レシピ一覧（検索・投稿者表示付き）

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store';
import { Recipe, Equipment } from '../../types';

const equipmentOptions: { value: Equipment | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全て' },
  { value: 'V60', label: 'V60' },
  { value: 'KALITA_WAVE', label: 'カリタ' },
  { value: 'CHEMEX', label: 'ケメックス' },
  { value: 'AEROPRESS', label: 'エアロプレス' },
  { value: 'FRENCH_PRESS', label: 'フレンチプレス' },
  { value: 'CLEVER', label: 'クレバー' },
  { value: 'OTHER', label: 'その他' },
];

export default function CommunityScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'ALL'>('ALL');

  const { user } = useAuthStore();

  const fetchPublicRecipes = async () => {
    try {
      const data = await api.getPublicRecipes();
      setRecipes(data);
    } catch (e) {
      console.error('Failed to fetch public recipes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublicRecipes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPublicRecipes();
  };

  // フィルタリングロジック
  const filteredRecipes = useMemo(() => {
    let result = recipes;

    // 器具フィルター
    if (selectedEquipment !== 'ALL') {
      result = result.filter((r) => r.equipment === selectedEquipment);
    }

    // 検索クエリフィルター（タイトル、タグ、投稿者名）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          r.authorName?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [recipes, searchQuery, selectedEquipment]);

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const isOwnRecipe = user?.id === item.userId;

    return (
      <TouchableOpacity style={styles.recipeCard} onPress={() => handleRecipePress(item)}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <View style={styles.badges}>
            {isOwnRecipe && (
              <View style={styles.ownBadge}>
                <Text style={styles.ownBadgeText}>自分</Text>
              </View>
            )}
            <View style={styles.likeContainer}>
              <Ionicons name="heart" size={14} color="#ff6b6b" />
              <Text style={styles.likeCount}>{item.likeCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* 投稿者 */}
        <View style={styles.authorRow}>
          <Ionicons name="person-circle-outline" size={16} color="#999" />
          <Text style={styles.authorName}>{isOwnRecipe ? 'あなた' : item.authorName || '匿名ユーザー'}</Text>
        </View>

        {/* タグ表示 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tagChip}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setSearchQuery(tag);
                }}
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
            {item.tags.length > 3 && <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>}
          </View>
        )}

        <Text style={styles.recipeMeta}>
          {item.equipment} · {item.coffeeGrams}g · {item.totalWaterMl}ml
        </Text>
        <Text style={styles.recipeParams}>
          {item.waterTemperature}℃ · {item.grindSize} · {item.steps?.length || 0}ステップ
        </Text>

        <View style={styles.cardFooter}>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="レシピ名、タグ、投稿者で検索"
            placeholderTextColor="#ccc"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* 器具フィルター */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={equipmentOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedEquipment === item.value && styles.filterChipActive]}
              onPress={() => setSelectedEquipment(item.value)}
            >
              <Text style={[styles.filterChipText, selectedEquipment === item.value && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 結果件数 */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>{filteredRecipes.length}件のレシピ</Text>
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || selectedEquipment !== 'ALL'
                ? '条件に一致するレシピがありません'
                : '公開レシピがありません'}
            </Text>
            {(searchQuery || selectedEquipment !== 'ALL') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedEquipment('ALL');
                }}
              >
                <Text style={styles.clearFiltersText}>フィルターをクリア</Text>
              </TouchableOpacity>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchSection: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  filterList: {
    paddingTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#1a1a1a',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCountText: {
    fontSize: 12,
    color: '#999',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ownBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 13,
    color: '#666',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 12,
    color: '#999',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  recipeMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  recipeParams: {
    fontSize: 12,
    color: '#999',
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
});
