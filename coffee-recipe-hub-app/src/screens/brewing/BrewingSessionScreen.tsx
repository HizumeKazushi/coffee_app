// 抽出セッション画面（タイマー）

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useThemeStore, useRecipeStore } from '../../store';
import { Colors, Typography, Spacing, BorderRadius, LightTheme, DarkTheme } from '../../utils/theme';
import { RecipeStep } from '../../types';

export default function BrewingSessionScreen({ navigation, route }: any) {
  const { isDarkMode } = useThemeStore();
  const { selectedRecipe } = useRecipeStore();
  const theme = isDarkMode ? DarkTheme : LightTheme;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const recipe = selectedRecipe;
  const steps: RecipeStep[] = recipe?.steps || [];

  // タイマー処理
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
    const currentSeconds = elapsedMs / 1000;
    const newStepIndex = steps.findIndex(
      (step, index) =>
        index === steps.length - 1 ||
        (currentSeconds >= step.timeSeconds && currentSeconds < steps[index + 1]?.timeSeconds),
    );
    if (newStepIndex !== -1 && newStepIndex !== currentStepIndex) {
      setCurrentStepIndex(newStepIndex);
      Vibration.vibrate(200);
    }
  }, [elapsedMs, steps, currentStepIndex]);

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
  };

  const handleFinish = () => {
    setIsRunning(false);
    navigation.navigate('BrewResult', {
      recipeId: recipe?.id,
      duration: elapsedMs,
    });
  };

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const totalPoured = steps.slice(0, currentStepIndex + 1).reduce((sum, step) => sum + step.waterMl, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!recipe ? (
        <View style={styles.noRecipe}>
          <Text style={[styles.noRecipeText, { color: theme.textSecondary }]}>レシピを選択してください</Text>
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('RecipesTab')}
          >
            <Text style={styles.selectButtonText}>レシピを選ぶ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* レシピ情報 */}
          <View style={styles.recipeInfo}>
            <Text style={[styles.recipeName, { color: theme.text }]}>{recipe.title}</Text>
            <Text style={[styles.recipeParams, { color: theme.textSecondary }]}>
              {recipe.coffeeGrams}g / {recipe.totalWaterMl}ml / {recipe.waterTemperature}℃
            </Text>
          </View>

          {/* メインタイマー */}
          <View style={styles.timerContainer}>
            <Text style={[styles.timer, { color: theme.text }]}>{formatTime(elapsedMs)}</Text>
            <Text style={[styles.totalPoured, { color: theme.accent }]}>
              {totalPoured} / {recipe.totalWaterMl} ml
            </Text>
          </View>

          {/* 現在のステップ */}
          {currentStep && (
            <View style={[styles.currentStepCard, { backgroundColor: Colors.primary[100] }]}>
              <Text style={styles.stepLabel}>{currentStep.label}</Text>
              <Text style={styles.stepAction}>{currentStep.waterMl}ml 注ぐ</Text>
            </View>
          )}

          {/* 次のステップ */}
          {nextStep && (
            <View style={[styles.nextStepCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.nextStepLabel, { color: theme.textSecondary }]}>
                次: {nextStep.label} @ {nextStep.timeSeconds}s
              </Text>
            </View>
          )}

          {/* コントロールボタン */}
          <View style={styles.controls}>
            <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.mainButton,
                { backgroundColor: isRunning ? Colors.warning : Colors.success },
              ]}
              onPress={handleStartStop}
            >
              <Text style={styles.mainButtonText}>{isRunning ? '一時停止' : 'スタート'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.finishButton, { backgroundColor: theme.primary }]}
              onPress={handleFinish}
            >
              <Text style={styles.finishButtonText}>完了</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  noRecipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecipeText: {
    fontSize: Typography.fontSizes.xl,
    marginBottom: Spacing.xl,
  },
  selectButton: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  recipeInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  recipeName: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
  },
  recipeParams: {
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.xs,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: Spacing['3xl'],
  },
  timer: {
    fontSize: 72,
    fontWeight: Typography.fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  totalPoured: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.semibold,
    marginTop: Spacing.md,
  },
  currentStepCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepLabel: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary[900],
  },
  stepAction: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary[900],
    marginTop: Spacing.sm,
  },
  nextStepCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  nextStepLabel: {
    fontSize: Typography.fontSizes.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
  controlButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  resetButton: {
    backgroundColor: Colors.neutral.gray300,
  },
  resetButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.gray700,
  },
  mainButton: {
    flex: 1,
    marginHorizontal: Spacing.md,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: '#fff',
  },
  finishButton: {
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.medium,
    color: '#fff',
  },
});
