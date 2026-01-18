// 豆一覧画面

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useBeanStore } from '../../store';
import { Bean } from '../../types';

export default function BeanListScreen({ navigation }: any) {
  const { beans } = useBeanStore();

  const renderBeanCard = ({ item }: { item: Bean }) => (
    <TouchableOpacity style={styles.beanCard}>
      <View style={styles.beanHeader}>
        <Text style={styles.beanName}>{item.name}</Text>
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>{item.stockGrams}g</Text>
        </View>
      </View>
      <Text style={styles.roasterName}>{item.roasterName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={beans}
        renderItem={renderBeanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🫘</Text>
            <Text style={styles.emptyText}>豆が登録されていません</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('BeanAdd')}>
              <Text style={styles.addButtonText}>豆を追加</Text>
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
  beanCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  beanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beanName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    color: '#212121',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  roasterName: {
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
