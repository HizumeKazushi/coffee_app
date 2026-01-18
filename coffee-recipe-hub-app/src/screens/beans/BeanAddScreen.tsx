// 豆追加画面

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useBeanStore } from '../../store';
import { RoastLevel } from '../../types';

const roastLevels: { value: RoastLevel; label: string }[] = [
  { value: 'LIGHT', label: '浅煎り' },
  { value: 'MEDIUM_LIGHT', label: '中浅煎り' },
  { value: 'MEDIUM', label: '中煎り' },
  { value: 'MEDIUM_DARK', label: '中深煎り' },
  { value: 'DARK', label: '深煎り' },
];

export default function BeanAddScreen({ navigation }: any) {
  const { addBean } = useBeanStore();

  const [name, setName] = useState('');
  const [roasterName, setRoasterName] = useState('');
  const [origin, setOrigin] = useState('');
  const [roastLevel, setRoastLevel] = useState<RoastLevel>('MEDIUM');
  const [process, setProcess] = useState('');
  const [roastDate, setRoastDate] = useState('');
  const [stockGrams, setStockGrams] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '豆の名前を入力してください');
      return;
    }

    try {
      // API呼び出し
      const response = await fetch('http://localhost:8080/api/v1/beans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          roasterName: roasterName.trim(),
          origin: origin.trim(),
          roastLevel,
          process: process.trim(),
          roastDate: roastDate.trim(),
          stockGrams: parseInt(stockGrams) || 0,
          flavorNotes: [],
        }),
      });

      if (!response.ok) throw new Error('Failed to create bean');

      const newBean = await response.json();
      addBean(newBean);
      Alert.alert('成功', '豆を追加しました', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      // オフライン時はローカルに保存
      const localBean = {
        id: Date.now().toString(),
        userId: 'local',
        name: name.trim(),
        roasterName: roasterName.trim(),
        origin: origin.trim(),
        roastLevel,
        process: process.trim(),
        roastDate: roastDate.trim(),
        stockGrams: parseInt(stockGrams) || 0,
        flavorNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addBean(localBean);
      Alert.alert('成功', '豆を追加しました（オフライン）', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>豆の名前 *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例: エチオピア イルガチェフェ"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>焙煎所</Text>
        <TextInput
          style={styles.input}
          value={roasterName}
          onChangeText={setRoasterName}
          placeholder="例: LIGHT UP COFFEE"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>産地</Text>
        <TextInput
          style={styles.input}
          value={origin}
          onChangeText={setOrigin}
          placeholder="例: エチオピア"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>焙煎度</Text>
        <View style={styles.roastLevelContainer}>
          {roastLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.roastLevelButton, roastLevel === level.value && styles.roastLevelButtonActive]}
              onPress={() => setRoastLevel(level.value)}
            >
              <Text style={[styles.roastLevelText, roastLevel === level.value && styles.roastLevelTextActive]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>精製方法</Text>
        <TextInput
          style={styles.input}
          value={process}
          onChangeText={setProcess}
          placeholder="例: ウォッシュド"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>焙煎日</Text>
        <TextInput
          style={styles.input}
          value={roastDate}
          onChangeText={setRoastDate}
          placeholder="例: 2026-01-15"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>在庫 (g)</Text>
        <TextInput
          style={styles.input}
          value={stockGrams}
          onChangeText={setStockGrams}
          placeholder="例: 200"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#fafafa',
  },
  roastLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roastLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roastLevelButtonActive: {
    backgroundColor: '#977669',
    borderColor: '#977669',
  },
  roastLevelText: {
    fontSize: 14,
    color: '#757575',
  },
  roastLevelTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#977669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
