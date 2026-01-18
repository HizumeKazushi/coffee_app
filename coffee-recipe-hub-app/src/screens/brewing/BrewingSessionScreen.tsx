// 抽出セッション画面（タイマー）

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
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
          <TouchableOpacity style={styles.selectButton} onPress={() => navigation.navigate('Recipes')}>
            <Text style={styles.selectButtonText}>レシピを選ぶ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: isRunning ? '#ff9800' : '#4caf50' }]}
              onPress={handleStartStop}
            >
              <Text style={styles.mainButtonText}>{isRunning ? '一時停止' : 'スタート'}</Text>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  noRecipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecipeText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#757575',
  },
  selectButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#977669',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 48,
  },
  timer: {
    fontSize: 72,
    fontWeight: '700',
    color: '#212121',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
    gap: 16,
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#616161',
  },
  mainButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
