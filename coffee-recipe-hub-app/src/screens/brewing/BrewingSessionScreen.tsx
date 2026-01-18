// 抽出セッション画面 - ミニマルデザイン

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRecipeStore } from '../../store';

export default function BrewingSessionScreen({ navigation }: any) {
  const { selectedRecipe } = useRecipeStore();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  return (
    <View style={styles.container}>
      {!selectedRecipe ? (
        <View style={styles.noRecipe}>
          <Text style={styles.noRecipeText}>レシピを選択してください</Text>
          <TouchableOpacity style={styles.selectLink} onPress={() => navigation.navigate('Recipes')}>
            <Text style={styles.selectLinkText}>レシピを選ぶ →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName}>{selectedRecipe.title}</Text>
            <Text style={styles.recipeParams}>
              {selectedRecipe.coffeeGrams}g · {selectedRecipe.totalWaterMl}ml · {selectedRecipe.waterTemperature}℃
            </Text>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>リセット</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, isRunning && styles.primaryButtonActive]}
              onPress={handleStartStop}
            >
              <Text style={styles.primaryButtonText}>{isRunning ? '一時停止' : 'スタート'}</Text>
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
    backgroundColor: '#fff',
    padding: 24,
  },
  noRecipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecipeText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  selectLink: {
    paddingVertical: 8,
  },
  selectLinkText: {
    fontSize: 14,
    color: '#1a1a1a',
    textDecorationLine: 'underline',
  },
  recipeInfo: {
    alignItems: 'center',
    paddingTop: 32,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1a1a1a',
  },
  recipeParams: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    color: '#1a1a1a',
    letterSpacing: -2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 32,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  primaryButtonActive: {
    backgroundColor: '#666',
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
});
