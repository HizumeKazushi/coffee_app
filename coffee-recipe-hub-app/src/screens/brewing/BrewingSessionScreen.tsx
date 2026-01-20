// 抽出セッション画面 - ステップナビゲーション付き

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRecipeStore, useBrewLogStore, useBeanStore } from '../../store';

export default function BrewingSessionScreen({ navigation }: any) {
  const { selectedRecipe, selectRecipe } = useRecipeStore();
  const { addBrewLog } = useBrewLogStore();
  const { selectedBean, selectBean, fetchBeans } = useBeanStore();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasVibrated, setHasVibrated] = useState<number[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const steps = selectedRecipe?.steps || [];

  // サウンドの初期化
  useEffect(() => {
    let isMounted = true;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // アラート音を再生する関数
  const playAlertSound = async () => {
    try {
      // 既存のサウンドをアンロード
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // アラート音を再生
      const { sound } = await Audio.Sound.createAsync(require('../../../assets/sounds/alert.mp3'), {
        shouldPlay: true,
      });
      soundRef.current = sound;

      // バイブレーションも同時に実行
      Vibration.vibrate([0, 200, 100, 200]);
    } catch (error) {
      console.log('Sound playback error:', error);
      // フォールバック: バイブレーションのみ
      Vibration.vibrate([0, 200, 100, 200]);
    }
  };

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

  // ステップ更新とバイブレーション・サウンド
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
          // 新しいステップに入ったらバイブレーションとサウンド
          if (!hasVibrated.includes(i) && i > 0) {
            playAlertSound();
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

  const handleFinish = async () => {
    if (isFinishing) return; // 二度押し防止
    setIsFinishing(true);
    setIsRunning(false);
    // 抽出ログを保存
    if (selectedRecipe && selectedBean) {
      const log = {
        recipeId: selectedRecipe.id,
        beanId: selectedBean.id,
        actualDuration: Math.floor(elapsedMs / 1000),
        rating: 3,
        tasteNotes: [],
        memo: '',
      };
      await addBrewLog(log);
      // 在庫が更新されたので豆一覧を再取得
      await fetchBeans();
    }
    handleReset();
    selectRecipe(null);
    selectBean(null);
    setIsFinishing(false);
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
          <Text style={styles.noRecipeText}>レシピと豆を選択してください</Text>
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
        <View style={styles.beanInfo}>
          <Ionicons name="leaf-outline" size={14} color="#666" style={{ marginRight: 4 }} />
          <Text style={styles.beanName}>{selectedBean ? selectedBean.name : '豆未選択'}</Text>
        </View>
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

        <TouchableOpacity
          style={[styles.secondaryButton, isFinishing && { opacity: 0.5 }]}
          onPress={handleFinish}
          disabled={isFinishing}
        >
          <Text style={styles.secondaryButtonText}>{isFinishing ? '保存中...' : '完了'}</Text>
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
  beanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  beanName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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
