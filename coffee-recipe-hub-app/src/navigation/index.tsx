// ナビゲーション設定

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { Colors } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BeanListScreen from '../screens/beans/BeanListScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import BrewingSessionScreen from '../screens/brewing/BrewingSessionScreen';
import CommunityScreen from '../screens/community/CommunityScreen';

const Tab = createBottomTabNavigator();

// メインタブナビゲーター
export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary[700],
          tabBarInactiveTintColor: Colors.neutral.gray500,
          headerShown: true,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'ホーム',
            tabBarIcon: () => <Text style={styles.icon}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Beans"
          component={BeanListScreen}
          options={{
            title: '豆',
            tabBarIcon: () => <Text style={styles.icon}>🫘</Text>,
          }}
        />
        <Tab.Screen
          name="Recipes"
          component={RecipeListScreen}
          options={{
            title: 'レシピ',
            tabBarIcon: () => <Text style={styles.icon}>📝</Text>,
          }}
        />
        <Tab.Screen
          name="Brewing"
          component={BrewingSessionScreen}
          options={{
            title: '抽出',
            tabBarIcon: () => <Text style={styles.icon}>☕</Text>,
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            title: 'コミュニティ',
            tabBarIcon: () => <Text style={styles.icon}>👥</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
  },
});
