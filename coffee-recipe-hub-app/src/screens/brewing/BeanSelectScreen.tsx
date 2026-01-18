// 豆選択画面 - 抽出用

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBeanStore } from '../../store';
import { Bean } from '../../types';

export default function BeanSelectScreen({ navigation }: any) {
  const { beans, selectBean, fetchBeans } = useBeanStore();

  React.useEffect(() => {
    fetchBeans();
  }, [fetchBeans]);

  const handleSelect = (bean: Bean) => {
    selectBean(bean);
    navigation.navigate('BrewingSession');
  };

  const renderBeanItem = ({ item }: { item: Bean }) => (
    <TouchableOpacity style={styles.beanItem} onPress={() => handleSelect(item)}>
      <View style={styles.beanInfo}>
        <Text style={styles.beanName}>{item.name}</Text>
        <Text style={styles.beanMeta}>
          {item.roasterName} · {item.origin}
        </Text>
        <Text style={styles.beanRoast}>{item.roastLevel}</Text>
      </View>
      <View style={styles.stockContainer}>
        <Text style={styles.stock}>{item.stockGrams}g</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={beans}
        renderItem={renderBeanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>豆が登録されていません</Text>
            <TouchableOpacity
              style={styles.createLink}
              onPress={() => navigation.navigate('Beans', { screen: 'BeanAdd' })}
            >
              <Text style={styles.createLinkText}>豆を登録する →</Text>
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
  beanRoast: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createLink: {
    paddingVertical: 8,
  },
  createLinkText: {
    fontSize: 14,
    color: '#1a1a1a',
    textDecorationLine: 'underline',
  },
});
