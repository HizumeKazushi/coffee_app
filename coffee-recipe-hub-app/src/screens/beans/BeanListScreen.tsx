// 豆一覧画面 - ミニマルデザイン

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBeanStore } from '../../store';
import { Bean } from '../../types';

export default function BeanListScreen({ navigation }: any) {
  const { beans } = useBeanStore();

  const renderBeanCard = ({ item }: { item: Bean }) => (
    <TouchableOpacity style={styles.beanItem}>
      <View style={styles.beanInfo}>
        <Text style={styles.beanName}>{item.name}</Text>
        <Text style={styles.beanMeta}>
          {item.roasterName} · {item.origin}
        </Text>
      </View>
      <Text style={styles.stock}>{item.stockGrams}g</Text>
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
            <Text style={styles.emptyText}>豆が登録されていません</Text>
            <TouchableOpacity style={styles.addLink} onPress={() => navigation.navigate('BeanAdd')}>
              <Text style={styles.addLinkText}>追加する →</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {beans.length > 0 && (
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('BeanAdd')}>
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
  beanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  beanInfo: {
    flex: 1,
  },
  beanName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  beanMeta: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  stock: {
    fontSize: 14,
    color: '#666',
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
