// レシピ作成・編集画面

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRecipeStore } from '../../store';
import { Equipment, GrindSize, RecipeStep } from '../../types';

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'V60', label: 'V60' },
  { value: 'KALITA_WAVE', label: 'カリタウェーブ' },
  { value: 'CHEMEX', label: 'ケメックス' },
  { value: 'AEROPRESS', label: 'エアロプレス' },
  { value: 'FRENCH_PRESS', label: 'フレンチプレス' },
  { value: 'OTHER', label: 'その他' },
];

const grindSizeOptions: { value: GrindSize; label: string }[] = [
  { value: 'FINE', label: '細挽き' },
  { value: 'MEDIUM_FINE', label: '中細挽き' },
  { value: 'MEDIUM', label: '中挽き' },
  { value: 'MEDIUM_COARSE', label: '中粗挽き' },
  { value: 'COARSE', label: '粗挽き' },
];

export default function RecipeEditorScreen({ navigation }: any) {
  const { addRecipe } = useRecipeStore();

  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState<Equipment>('V60');
  const [coffeeGrams, setCoffeeGrams] = useState('15');
  const [totalWaterMl, setTotalWaterMl] = useState('250');
  const [waterTemperature, setWaterTemperature] = useState('92');
  const [grindSize, setGrindSize] = useState<GrindSize>('MEDIUM');
  const [steps, setSteps] = useState<RecipeStep[]>([
    { order: 1, label: '蒸らし', timeSeconds: 0, waterMl: 30 },
    { order: 2, label: '1投目', timeSeconds: 30, waterMl: 70 },
    { order: 3, label: '2投目', timeSeconds: 60, waterMl: 80 },
    { order: 4, label: '3投目', timeSeconds: 90, waterMl: 70 },
  ]);

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    setSteps([
      ...steps,
      {
        order: steps.length + 1,
        label: `${steps.length + 1}投目`,
        timeSeconds: lastStep ? lastStep.timeSeconds + 30 : 0,
        waterMl: 50,
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'レシピ名を入力してください');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          equipment,
          coffeeGrams: parseFloat(coffeeGrams) || 15,
          totalWaterMl: parseInt(totalWaterMl) || 250,
          waterTemperature: parseInt(waterTemperature) || 92,
          grindSize,
          steps,
          isPublic: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create recipe');

      const newRecipe = await response.json();
      addRecipe(newRecipe);
      Alert.alert('成功', 'レシピを作成しました', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      // オフライン時
      const localRecipe = {
        id: Date.now().toString(),
        userId: 'local',
        title: title.trim(),
        equipment,
        coffeeGrams: parseFloat(coffeeGrams) || 15,
        totalWaterMl: parseInt(totalWaterMl) || 250,
        waterTemperature: parseInt(waterTemperature) || 92,
        grindSize,
        steps,
        isPublic: false,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addRecipe(localRecipe);
      Alert.alert('成功', 'レシピを作成しました（オフライン）', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>レシピ名 *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="例: 朝の定番レシピ"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>器具</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionRow}>
            {equipmentOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionButton, equipment === opt.value && styles.optionButtonActive]}
                onPress={() => setEquipment(opt.value)}
              >
                <Text style={[styles.optionText, equipment === opt.value && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>粉量 (g)</Text>
            <TextInput style={styles.input} value={coffeeGrams} onChangeText={setCoffeeGrams} keyboardType="numeric" />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>総湯量 (ml)</Text>
            <TextInput
              style={styles.input}
              value={totalWaterMl}
              onChangeText={setTotalWaterMl}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>温度 (℃)</Text>
            <TextInput
              style={styles.input}
              value={waterTemperature}
              onChangeText={setWaterTemperature}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>挽き目</Text>
            <View style={styles.grindPicker}>
              {grindSizeOptions.slice(0, 3).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.grindButton, grindSize === opt.value && styles.grindButtonActive]}
                  onPress={() => setGrindSize(opt.value)}
                >
                  <Text style={grindSize === opt.value ? styles.grindTextActive : styles.grindText}>
                    {opt.label.substring(0, 2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>注湯ステップ</Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <TextInput
                style={styles.stepLabel}
                value={step.label}
                onChangeText={(v) => updateStep(index, 'label', v)}
              />
              {steps.length > 1 && (
                <TouchableOpacity onPress={() => removeStep(index)}>
                  <Text style={styles.removeStep}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.stepInputs}>
              <View style={styles.stepInputGroup}>
                <Text style={styles.stepInputLabel}>秒</Text>
                <TextInput
                  style={styles.stepInput}
                  value={step.timeSeconds.toString()}
                  onChangeText={(v) => updateStep(index, 'timeSeconds', parseInt(v) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.stepInputGroup}>
                <Text style={styles.stepInputLabel}>ml</Text>
                <TextInput
                  style={styles.stepInput}
                  value={step.waterMl.toString()}
                  onChangeText={(v) => updateStep(index, 'waterMl', parseInt(v) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
          <Text style={styles.addStepText}>+ ステップを追加</Text>
        </TouchableOpacity>

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
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#977669',
    borderColor: '#977669',
  },
  optionText: {
    fontSize: 14,
    color: '#757575',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  grindPicker: {
    flexDirection: 'row',
    gap: 4,
  },
  grindButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  grindButtonActive: {
    backgroundColor: '#977669',
  },
  grindText: {
    fontSize: 12,
    color: '#757575',
  },
  grindTextActive: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  removeStep: {
    fontSize: 18,
    color: '#f44336',
    padding: 4,
  },
  stepInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  stepInputGroup: {
    flex: 1,
  },
  stepInputLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  stepInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  addStepButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#977669',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addStepText: {
    color: '#977669',
    fontSize: 14,
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
