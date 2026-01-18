// レシピ作成・編集画面 - 改善版

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore, useAuthStore } from '../../store';
import { Equipment, GrindSize, RecipeStep } from '../../types';
import { api } from '../../lib/api';

const equipmentOptions: { value: Equipment; label: string; icon: string }[] = [
  { value: 'V60', label: 'V60', icon: 'caret-down-outline' }, // Ioniconsにcafe-outlineがない場合もあるのでcaret等で代用。元に戻します
  { value: 'KALITA_WAVE', label: 'カリタ', icon: 'caret-down-outline' },
  { value: 'CHEMEX', label: 'ケメックス', icon: 'flask-outline' },
  { value: 'AEROPRESS', label: 'エアロプレス', icon: 'stopwatch-outline' },
  { value: 'FRENCH_PRESS', label: 'フレンチ', icon: 'filter-outline' },
];
// icon name修正済み

const grindOptions: { value: GrindSize; label: string }[] = [
  { value: 'FINE', label: '細挽き' },
  { value: 'MEDIUM_FINE', label: '中細挽き' },
  { value: 'MEDIUM', label: '中挽き' },
  { value: 'MEDIUM_COARSE', label: '中粗挽き' },
  { value: 'COARSE', label: '粗挽き' },
];

export default function RecipeEditorScreen({ navigation, route }: any) {
  const { addRecipe, updateRecipe, deleteRecipe, loading } = useRecipeStore();
  const { user } = useAuthStore();
  const editingRecipe = route.params?.recipe;
  const isEditing = !!editingRecipe;

  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState<Equipment>('V60');
  const [coffeeGrams, setCoffeeGrams] = useState('15');
  const [totalWaterMl, setTotalWaterMl] = useState('250');
  const [waterTemperature, setWaterTemperature] = useState('92');
  const [grindSize, setGrindSize] = useState<GrindSize>('MEDIUM');
  const [endTimeSeconds, setEndTimeSeconds] = useState('180'); // 終了時間（秒）
  const [isPublic, setIsPublic] = useState(false); // 公開設定
  const [tags, setTags] = useState<string[]>([]); // タグ
  const [tagInput, setTagInput] = useState(''); // タグ入力
  const [steps, setSteps] = useState<RecipeStep[]>([
    { order: 1, label: '蒸らし', timeSeconds: 0, waterMl: 30 },
    { order: 2, label: '1投目', timeSeconds: 30, waterMl: 70 },
    { order: 3, label: '2投目', timeSeconds: 60, waterMl: 80 },
  ]);

  React.useEffect(() => {
    if (editingRecipe) {
      navigation.setOptions({ title: 'レシピを編集' });
      setTitle(editingRecipe.title);
      setEquipment(editingRecipe.equipment);
      setCoffeeGrams(editingRecipe.coffeeGrams.toString());
      setTotalWaterMl(editingRecipe.totalWaterMl.toString());
      setWaterTemperature(editingRecipe.waterTemperature.toString());
      setGrindSize(editingRecipe.grindSize);
      setSteps(editingRecipe.steps);
      setIsPublic(editingRecipe.isPublic || false);
      setTags(editingRecipe.tags || []);
      // 終了時間は最後のステップ+30秒か、フィールドがあればそれを使う
      const lastStep = editingRecipe.steps[editingRecipe.steps.length - 1];
      if (lastStep) {
        setEndTimeSeconds((lastStep.timeSeconds + 30).toString());
      }
    }
  }, [editingRecipe, navigation]);

  // 計算値
  const totalStepWater = useMemo(() => steps.reduce((sum, step) => sum + step.waterMl, 0), [steps]);
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

  const performDelete = async () => {
    if (editingRecipe?.id) {
      try {
        await deleteRecipe(editingRecipe.id);
        navigation.goBack();
      } catch (e: any) {
        console.error('Delete error:', e);
        if (Platform.OS === 'web') {
          alert(`レシピの削除に失敗しました: ${e.message}`);
        } else {
          Alert.alert('エラー', `レシピの削除に失敗しました: ${e.message}`);
        }
      }
    } else {
      const msg = '削除対象のIDが見つかりません';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('エラー', msg);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('本当にこのレシピを削除しますか？')) {
        performDelete();
      }
    } else {
      Alert.alert('レシピを削除', '本当にこのレシピを削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'レシピ名を入力してください');
      return;
    }

    try {
      // 終了ステップを追加（stepsの最後に「完了」を含める）
      const endTime = parseInt(endTimeSeconds) || 180;
      const stepsWithEnd = [...steps];
      // 終了時間を明示的に記録するため、最後のステップの後に完了ステップを追加
      if (stepsWithEnd.length > 0 && stepsWithEnd[stepsWithEnd.length - 1].label !== '完了') {
        stepsWithEnd.push({
          order: stepsWithEnd.length + 1,
          label: '完了',
          timeSeconds: endTime,
          waterMl: 0,
        });
      } else if (stepsWithEnd.length > 0) {
        // 既存の完了ステップを更新
        stepsWithEnd[stepsWithEnd.length - 1].timeSeconds = endTime;
      }

      const recipeData = {
        title: title.trim(),
        // ユーザーメタデータから表示名を取得。なければ 'Coffee Lover'
        authorName: (user as any)?.user_metadata?.display_name || 'Coffee Lover',
        equipment,
        coffeeGrams: parseFloat(coffeeGrams) || 15,
        totalWaterMl: parseInt(totalWaterMl) || 250,
        waterTemperature: parseInt(waterTemperature) || 92,
        grindSize,
        steps: stepsWithEnd,
        tags,
        isPublic,
      };

      if (isEditing) {
        await updateRecipe({ ...editingRecipe, ...recipeData });
      } else {
        await addRecipe(recipeData);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('エラー', 'レシピの保存に失敗しました');
    }
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
            <Text style={styles.stepSummary}>合計 {totalStepWater}ml</Text>
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

        {/* 終了時間 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>終了時間</Text>
          <View style={styles.endTimeRow}>
            <View style={styles.endTimeInputContainer}>
              <TextInput
                style={styles.endTimeInput}
                value={endTimeSeconds}
                onChangeText={setEndTimeSeconds}
                keyboardType="numeric"
              />
              <Text style={styles.endTimeUnit}>秒</Text>
            </View>
            <Text style={styles.endTimeDisplay}>
              ({Math.floor(parseInt(endTimeSeconds) / 60)}分{parseInt(endTimeSeconds) % 60}秒)
            </Text>
          </View>
        </View>

        {/* タグ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>タグ（公開時に表示）</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tagChip}
                onPress={() => setTags(tags.filter((_, i) => i !== index))}
              >
                <Text style={styles.tagChipText}>#{tag}</Text>
                <Ionicons name="close" size={14} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="タグを入力（例: 初心者向け）"
              placeholderTextColor="#ccc"
              onSubmitEditing={() => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                  setTagInput('');
                }
              }}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.tagAddButton}
              onPress={() => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                  setTagInput('');
                }
              }}
            >
              <Ionicons name="add" size={20} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 公開設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>共有設定</Text>
          <View style={styles.publicRow}>
            <View style={styles.publicInfo}>
              <Text style={styles.publicLabel}>コミュニティに公開</Text>
              <Text style={styles.publicDescription}>オンにすると他のユーザーがこのレシピを見れます</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#e0e0e0', true: '#1a1a1a' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>保存</Text>}
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
            <Text style={styles.deleteButtonText}>このレシピを削除</Text>
          </TouchableOpacity>
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
  endTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  endTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  endTimeInput: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
    width: 80,
    textAlign: 'center',
  },
  endTimeUnit: {
    fontSize: 14,
    color: '#999',
  },
  endTimeDisplay: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagChipText: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  tagAddButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  publicInfo: {
    flex: 1,
    marginRight: 16,
  },
  publicLabel: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  publicDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 15,
    fontWeight: '500',
  },
});
