// レシピ作成・編集画面 - 改善版

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../../store';
import { Equipment, GrindSize, RecipeStep } from '../../types';

const equipmentOptions: { value: Equipment; label: string; icon: string }[] = [
  { value: 'V60', label: 'V60', icon: 'cafe-outline' },
  { value: 'KALITA_WAVE', label: 'カリタ', icon: 'cafe-outline' },
  { value: 'CHEMEX', label: 'ケメックス', icon: 'cafe-outline' },
  { value: 'AEROPRESS', label: 'エアロプレス', icon: 'cafe-outline' },
  { value: 'FRENCH_PRESS', label: 'フレンチ', icon: 'cafe-outline' },
];

const grindOptions: { value: GrindSize; label: string }[] = [
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
  ]);

  // 計算値
  const totalStepWater = useMemo(() => steps.reduce((sum, step) => sum + step.waterMl, 0), [steps]);
  const totalTime = useMemo(() => (steps.length > 0 ? steps[steps.length - 1].timeSeconds + 30 : 0), [steps]);
  const ratio = useMemo(() => {
    const coffee = parseFloat(coffeeGrams) || 1;
    const water = parseInt(totalWaterMl) || 0;
    return (water / coffee).toFixed(1);
  }, [coffeeGrams, totalWaterMl]);

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    setSteps([
      ...steps,
      {
        order: steps.length + 1,
        label: `${steps.length}投目`,
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
        {/* レシピ名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="レシピ名を入力"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* 器具選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>器具</Text>
          <View style={styles.equipmentGrid}>
            {equipmentOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.equipmentCard, equipment === opt.value && styles.equipmentCardActive]}
                onPress={() => setEquipment(opt.value)}
              >
                <Ionicons name={opt.icon as any} size={20} color={equipment === opt.value ? '#fff' : '#999'} />
                <Text style={[styles.equipmentLabel, equipment === opt.value && styles.equipmentLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* パラメータ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>パラメータ</Text>
          <View style={styles.paramGrid}>
            <View style={styles.paramCard}>
              <Text style={styles.paramLabel}>粉量</Text>
              <View style={styles.paramInputRow}>
                <TextInput
                  style={styles.paramInput}
                  value={coffeeGrams}
                  onChangeText={setCoffeeGrams}
                  keyboardType="numeric"
                />
                <Text style={styles.paramUnit}>g</Text>
              </View>
            </View>
            <View style={styles.paramCard}>
              <Text style={styles.paramLabel}>湯量</Text>
              <View style={styles.paramInputRow}>
                <TextInput
                  style={styles.paramInput}
                  value={totalWaterMl}
                  onChangeText={setTotalWaterMl}
                  keyboardType="numeric"
                />
                <Text style={styles.paramUnit}>ml</Text>
              </View>
            </View>
            <View style={styles.paramCard}>
              <Text style={styles.paramLabel}>温度</Text>
              <View style={styles.paramInputRow}>
                <TextInput
                  style={styles.paramInput}
                  value={waterTemperature}
                  onChangeText={setWaterTemperature}
                  keyboardType="numeric"
                />
                <Text style={styles.paramUnit}>℃</Text>
              </View>
            </View>
          </View>

          {/* 比率表示 */}
          <View style={styles.ratioRow}>
            <Text style={styles.ratioText}>比率 1:{ratio}</Text>
          </View>
        </View>

        {/* 挽き目 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>挽き目</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.grindRow}>
              {grindOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.grindButton, grindSize === opt.value && styles.grindButtonActive]}
                  onPress={() => setGrindSize(opt.value)}
                >
                  <Text style={[styles.grindText, grindSize === opt.value && styles.grindTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 注湯ステップ */}
        <View style={styles.section}>
          <View style={styles.stepHeader}>
            <Text style={styles.sectionTitle}>注湯ステップ</Text>
            <Text style={styles.stepSummary}>
              合計 {totalStepWater}ml · 約{Math.floor(totalTime / 60)}分{totalTime % 60}秒
            </Text>
          </View>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <TextInput
                  style={styles.stepLabelInput}
                  value={step.label}
                  onChangeText={(v) => updateStep(index, 'label', v)}
                  placeholder="ラベル"
                  placeholderTextColor="#ccc"
                />
                <View style={styles.stepParams}>
                  <View style={styles.stepParamItem}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <TextInput
                      style={styles.stepParamInput}
                      value={step.timeSeconds.toString()}
                      onChangeText={(v) => updateStep(index, 'timeSeconds', parseInt(v) || 0)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.stepParamUnit}>秒</Text>
                  </View>
                  <View style={styles.stepParamItem}>
                    <Ionicons name="water-outline" size={14} color="#999" />
                    <TextInput
                      style={styles.stepParamInput}
                      value={step.waterMl.toString()}
                      onChangeText={(v) => updateStep(index, 'waterMl', parseInt(v) || 0)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.stepParamUnit}>ml</Text>
                  </View>
                </View>
              </View>
              {steps.length > 1 && (
                <TouchableOpacity style={styles.removeStepButton} onPress={() => removeStep(index)}>
                  <Ionicons name="close" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Ionicons name="add" size={18} color="#999" />
            <Text style={styles.addStepText}>ステップを追加</Text>
          </TouchableOpacity>
        </View>

        {/* 保存ボタン */}
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
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  equipmentCardActive: {
    backgroundColor: '#1a1a1a',
  },
  equipmentLabel: {
    fontSize: 13,
    color: '#666',
  },
  equipmentLabelActive: {
    color: '#fff',
  },
  paramGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paramCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  paramLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  paramInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  paramInput: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
    flex: 1,
  },
  paramUnit: {
    fontSize: 14,
    color: '#999',
  },
  ratioRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  ratioText: {
    fontSize: 13,
    color: '#666',
  },
  grindRow: {
    flexDirection: 'row',
    gap: 8,
  },
  grindButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  grindButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  grindText: {
    fontSize: 13,
    color: '#666',
  },
  grindTextActive: {
    color: '#fff',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepSummary: {
    fontSize: 12,
    color: '#999',
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
  stepLabelInput: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  stepParams: {
    flexDirection: 'row',
    gap: 16,
  },
  stepParamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepParamInput: {
    fontSize: 14,
    color: '#1a1a1a',
    width: 40,
    textAlign: 'center',
  },
  stepParamUnit: {
    fontSize: 12,
    color: '#999',
  },
  removeStepButton: {
    padding: 4,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
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
    marginTop: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
