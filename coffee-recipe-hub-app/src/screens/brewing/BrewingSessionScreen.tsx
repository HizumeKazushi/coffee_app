// 抽出セッション画面 - ステップナビゲーション付き

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore, useBrewLogStore, useBeanStore } from '../../store';
import { RecipeStep } from '../../types';

export default function BrewingSessionScreen({ navigation }: any) {
  const { selectedRecipe, selectRecipe } = useRecipeStore();
  const { addBrewLog } = useBrewLogStore();
  const { beans } = useBeanStore();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasVibrated, setHasVibrated] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = selectedRecipe?.steps || [];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedMs((prev) => prev + 100);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // ステップ更新とバイブレーション
  useEffect(() => {
    if (!selectedRecipe || steps.length === 0) return;

    const currentSeconds = elapsedMs / 1000;

    // 次のステップを探す
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nextStep = steps[i + 1];

      if (currentSeconds >= step.timeSeconds && (!nextStep || currentSeconds < nextStep.timeSeconds)) {
        if (currentStepIndex !== i) {
          setCurrentStepIndex(i);
          // 新しいステップに入ったらバイブレーション
          if (!hasVibrated.includes(i) && i > 0) {
            Vibration.vibrate(200);
            setHasVibrated((prev) => [...prev, i]);
          }
        }
        break;
      }
    }
  }, [elapsedMs, steps, currentStepIndex, hasVibrated, selectedRecipe]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setCurrentStepIndex(0);
    setHasVibrated([]);
  };

  const handleFinish = () => {
    setIsRunning(false);
    // 抽出ログを保存
    if (selectedRecipe) {
      const log = {
        id: Date.now().toString(),
        userId: 'local',
        recipeId: selectedRecipe.id,
        beanId: beans[0]?.id || '',
        brewDate: new Date().toISOString(),
        actualDuration: Math.floor(elapsedMs / 1000),
        rating: 0,
        tasteNotes: [],
        memo: '',
        createdAt: new Date().toISOString(),
      };
      addBrewLog(log);
    }
    handleReset();
    selectRecipe(null);
    navigation.navigate('Home');
  };

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const totalPoured = steps.slice(0, currentStepIndex + 1).reduce((sum, step) => sum + step.waterMl, 0);

  if (!selectedRecipe) {
    return (
      <View style={styles.container}>
        <View style={styles.noRecipe}>
          <Text style={styles.noRecipeTitle}>抽出を始める</Text>
          <Text style={styles.noRecipeText}>レシピを選択してください</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => navigation.navigate('RecipeSelect')}>
            <Text style={styles.selectButtonText}>レシピを選ぶ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* レシピ情報 */}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{selectedRecipe.title}</Text>
        <Text style={styles.recipeParams}>
          {selectedRecipe.coffeeGrams}g · {selectedRecipe.totalWaterMl}ml · {selectedRecipe.waterTemperature}℃
        </Text>
      </View>

      {/* メインタイマー */}
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
        <Text style={styles.pourProgress}>
          {totalPoured} / {selectedRecipe.totalWaterMl} ml
        </Text>
      </View>

      {/* 現在のステップ */}
      {currentStep && (
        <View style={styles.currentStep}>
          <Text style={styles.stepLabel}>{currentStep.label}</Text>
          <Text style={styles.stepWater}>{currentStep.waterMl}ml</Text>
        </View>
      )}

      {/* 次のステップ */}
      {nextStep && (
        <View style={styles.nextStep}>
          <Text style={styles.nextStepText}>
            次: {nextStep.label} @ {nextStep.timeSeconds}s
          </Text>
        </View>
      )}

      {/* ステップインジケーター */}
      <View style={styles.stepIndicators}>
        {steps.map((_, index) => (
          <View key={index} style={[styles.stepDot, index <= currentStepIndex && styles.stepDotActive]} />
        ))}
      </View>

      {/* コントロール */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryButtonText}>リセット</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, isRunning && styles.primaryButtonPause]}
          onPress={handleStartStop}
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleFinish}>
          <Text style={styles.secondaryButtonText}>完了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  noRecipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecipeTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  noRecipeText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  selectButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  recipeInfo: {
    alignItems: 'center',
    paddingTop: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  recipeParams: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    color: '#1a1a1a',
    letterSpacing: -2,
  },
  pourProgress: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  currentStep: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  stepLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  stepWater: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  nextStep: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  nextStepText: {
    fontSize: 13,
    color: '#ccc',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  stepDotActive: {
    backgroundColor: '#1a1a1a',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 'auto',
    paddingBottom: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#999',
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonPause: {
    backgroundColor: '#666',
  },
});
