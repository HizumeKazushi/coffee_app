// レシピ詳細画面 - コミュニティ用

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore, useAuthStore } from '../../store';
import { Recipe } from '../../types';

export default function RecipeDetailScreen({ route, navigation }: any) {
  const recipe: Recipe = route.params?.recipe;
  const { addRecipe } = useRecipeStore();
  const { user } = useAuthStore();
  const [importing, setImporting] = useState(false);

  const isOwnRecipe = user?.id === recipe?.userId;

  const handleImport = async () => {
    if (!recipe) return;
    setImporting(true);
    try {
      const importedRecipe = {
        title: `${recipe.title}（インポート）`,
        authorName: (user as any)?.user_metadata?.display_name || 'Coffee Lover',
        equipment: recipe.equipment,
        coffeeGrams: recipe.coffeeGrams,
        totalWaterMl: recipe.totalWaterMl,
        waterTemperature: recipe.waterTemperature,
        grindSize: recipe.grindSize,
        steps: recipe.steps,
        tags: recipe.tags || [],
        isPublic: false,
      };
      await addRecipe(importedRecipe);
      Alert.alert('成功', 'レシピをマイレシピに追加しました', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('エラー', 'レシピのインポートに失敗しました');
    } finally {
      setImporting(false);
    }
  };

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>レシピが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.authorBadge}>
              <Ionicons name="person-circle-outline" size={16} color="#666" />
              <Text style={styles.authorName}>{isOwnRecipe ? 'あなた' : recipe.authorName || '匿名ユーザー'}</Text>
            </View>
            <View style={styles.likeBadge}>
              <Ionicons name="heart" size={14} color="#ff6b6b" />
              <Text style={styles.likeCount}>{recipe.likeCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* タグ表示 */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* パラメータ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>パラメータ</Text>
          <View style={styles.paramsGrid}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>器具</Text>
              <Text style={styles.paramValue}>{recipe.equipment}</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>粉量</Text>
              <Text style={styles.paramValue}>{recipe.coffeeGrams}g</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>湯量</Text>
              <Text style={styles.paramValue}>{recipe.totalWaterMl}ml</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>温度</Text>
              <Text style={styles.paramValue}>{recipe.waterTemperature}℃</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>挽き目</Text>
              <Text style={styles.paramValue}>{recipe.grindSize}</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>比率</Text>
              <Text style={styles.paramValue}>1:{(recipe.totalWaterMl / recipe.coffeeGrams).toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* ステップ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>抽出ステップ</Text>
          {recipe.steps?.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <View style={styles.stepMeta}>
                  <Text style={styles.stepMetaText}>
                    <Ionicons name="time-outline" size={12} color="#999" /> {step.timeSeconds}秒
                  </Text>
                  <Text style={styles.stepMetaText}>
                    <Ionicons name="water-outline" size={12} color="#999" /> {step.waterMl}ml
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* インポートボタン（自分のレシピでない場合のみ） */}
        {!isOwnRecipe && (
          <TouchableOpacity style={styles.importButton} onPress={handleImport} disabled={importing}>
            {importing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.importButtonText}>マイレシピに追加</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isOwnRecipe && (
          <View style={styles.ownRecipeNotice}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.ownRecipeText}>これはあなたのレシピです</Text>
          </View>
        )}
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
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  authorName: {
    fontSize: 13,
    color: '#666',
  },
  likeCount: {
    fontSize: 13,
    color: '#ff6b6b',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paramItem: {
    width: '33.33%',
    marginBottom: 16,
  },
  paramLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  paramValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stepMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  stepMetaText: {
    fontSize: 12,
    color: '#999',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  importButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  ownRecipeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f0fff0',
    borderRadius: 8,
    marginTop: 8,
  },
  ownRecipeText: {
    fontSize: 14,
    color: '#4CAF50',
  },
});
