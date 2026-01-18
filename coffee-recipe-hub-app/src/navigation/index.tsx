// ナビゲーション設定

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';

import { Colors } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BeanListScreen from '../screens/beans/BeanListScreen';
import BeanAddScreen from '../screens/beans/BeanAddScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import RecipeEditorScreen from '../screens/recipes/RecipeEditorScreen';
import BrewingSessionScreen from '../screens/brewing/BrewingSessionScreen';
import CommunityScreen from '../screens/community/CommunityScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bean Stack Navigator
function BeanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BeanList" component={BeanListScreen} options={{ title: '豆' }} />
      <Stack.Screen name="BeanAdd" component={BeanAddScreen} options={{ title: '豆を追加' }} />
    </Stack.Navigator>
  );
}

// Recipe Stack Navigator
function RecipeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ title: 'レシピ' }} />
      <Stack.Screen name="RecipeEditor" component={RecipeEditorScreen} options={{ title: 'レシピ作成' }} />
    </Stack.Navigator>
  );
}

// メインタブナビゲーター
export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#977669',
          tabBarInactiveTintColor: '#9e9e9e',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'ホーム',
            headerShown: true,
            tabBarIcon: () => <Text style={styles.icon}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Beans"
          component={BeanStack}
          options={{
            title: '豆',
            tabBarIcon: () => <Text style={styles.icon}>🫘</Text>,
          }}
        />
        <Tab.Screen
          name="Recipes"
          component={RecipeStack}
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
            headerShown: true,
            tabBarIcon: () => <Text style={styles.icon}>☕</Text>,
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            title: 'コミュニティ',
            headerShown: true,
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
