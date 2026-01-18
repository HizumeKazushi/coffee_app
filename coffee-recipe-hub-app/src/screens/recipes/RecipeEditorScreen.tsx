// レシピ作成・編集画面 - ミニマルデザイン

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../../store';
import { Equipment, GrindSize, RecipeStep } from '../../types';

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'V60', label: 'V60' },
  { value: 'KALITA_WAVE', label: 'カリタウェーブ' },
  { value: 'CHEMEX', label: 'ケメックス' },
  { value: 'AEROPRESS', label: 'エアロプレス' },
  { value: 'FRENCH_PRESS', label: 'フレンチプレス' },
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

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'レシピ名を入力してください');
      return;
    }

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
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>レシピ名</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="朝の定番レシピ"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>器具</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionRow}>
              {equipmentOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionButton, equipment === opt.value && styles.optionButtonActive]}
                  onPress={() => setEquipment(opt.value)}
                >
                  <Text style={[styles.optionText, equipment === opt.value && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>粉量 (g)</Text>
            <TextInput style={styles.input} value={coffeeGrams} onChangeText={setCoffeeGrams} keyboardType="numeric" />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.label}>湯量 (ml)</Text>
            <TextInput
              style={styles.input}
              value={totalWaterMl}
              onChangeText={setTotalWaterMl}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.label}>温度 (℃)</Text>
            <TextInput
              style={styles.input}
              value={waterTemperature}
              onChangeText={setWaterTemperature}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>注湯ステップ</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <TextInput
                style={[styles.stepInput, { flex: 2 }]}
                value={step.label}
                onChangeText={(v) => updateStep(index, 'label', v)}
                placeholder="ラベル"
              />
              <TextInput
                style={[styles.stepInput, { flex: 1 }]}
                value={step.timeSeconds.toString()}
                onChangeText={(v) => updateStep(index, 'timeSeconds', parseInt(v) || 0)}
                keyboardType="numeric"
                placeholder="秒"
              />
              <TextInput
                style={[styles.stepInput, { flex: 1 }]}
                value={step.waterMl.toString()}
                onChangeText={(v) => updateStep(index, 'waterMl', parseInt(v) || 0)}
                keyboardType="numeric"
                placeholder="ml"
              />
              {steps.length > 1 && (
                <TouchableOpacity onPress={() => removeStep(index)} style={styles.removeButton}>
                  <Ionicons name="close" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Text style={styles.addStepText}>+ ステップを追加</Text>
          </TouchableOpacity>
        </View>

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
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionButtonActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a1a1a',
  },
  removeButton: {
    padding: 4,
  },
  addStepButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addStepText: {
    fontSize: 13,
    color: '#999',
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
