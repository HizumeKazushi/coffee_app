// 豆追加画面 - ミニマルデザイン

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useBeanStore } from '../../store';
import { RoastLevel } from '../../types';

const roastLevels: { value: RoastLevel; label: string }[] = [
  { value: 'LIGHT', label: '浅煎り' },
  { value: 'MEDIUM_LIGHT', label: '中浅煎り' },
  { value: 'MEDIUM', label: '中煎り' },
  { value: 'MEDIUM_DARK', label: '中深煎り' },
  { value: 'DARK', label: '深煎り' },
];

export default function BeanAddScreen({ navigation, route }: any) {
  const { addBean, updateBean, loading } = useBeanStore();
  const editingBean = route.params?.bean;
  const isEditing = !!editingBean;

  const [name, setName] = useState('');
  const [roasterName, setRoasterName] = useState('');
  const [origin, setOrigin] = useState('');
  const [roastLevel, setRoastLevel] = useState<RoastLevel>('MEDIUM');
  const [process, setProcess] = useState('');
  const [roastDate, setRoastDate] = useState('');
  const [stockGrams, setStockGrams] = useState('');

  React.useEffect(() => {
    if (editingBean) {
      navigation.setOptions({ title: '豆を編集' });
      setName(editingBean.name);
      setRoasterName(editingBean.roasterName);
      setOrigin(editingBean.origin);
      setRoastLevel(editingBean.roastLevel);
      setProcess(editingBean.process);
      setRoastDate(editingBean.roastDate);
      setStockGrams(editingBean.stockGrams.toString());
    }
  }, [editingBean, navigation]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '豆の名前を入力してください');
      return;
    }

    try {
      const beanData = {
        name: name.trim(),
        roasterName: roasterName.trim(),
        origin: origin.trim(),
        roastLevel,
        process: process.trim(),
        roastDate: roastDate.trim(),
        stockGrams: parseInt(stockGrams) || 0,
        flavorNotes: [],
      };

      if (isEditing) {
        await updateBean({ ...editingBean, ...beanData });
      } else {
        await addBean(beanData);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('エラー', '豆の保存に失敗しました');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>豆の名前</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="エチオピア イルガチェフェ"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>焙煎所</Text>
          <TextInput
            style={styles.input}
            value={roasterName}
            onChangeText={setRoasterName}
            placeholder="LIGHT UP COFFEE"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>産地</Text>
          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            placeholder="エチオピア"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>精製方法</Text>
          <TextInput
            style={styles.input}
            value={process}
            onChangeText={setProcess}
            placeholder="ウォッシュド"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>焙煎日</Text>
            <TextInput
              style={styles.input}
              value={roastDate}
              onChangeText={setRoastDate}
              placeholder="2026-01-15"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.label}>在庫 (g)</Text>
            <TextInput
              style={styles.input}
              value={stockGrams}
              onChangeText={setStockGrams}
              placeholder="200"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>保存</Text>}
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
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
  },
  roastLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roastLevelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  roastLevelButtonActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  roastLevelText: {
    fontSize: 13,
    color: '#666',
  },
  roastLevelTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
