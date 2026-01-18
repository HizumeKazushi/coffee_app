// ナビゲーション設定

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { useThemeStore } from '../store';
import { Colors } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BeanListScreen from '../screens/beans/BeanListScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import BrewingSessionScreen from '../screens/brewing/BrewingSessionScreen';
import CommunityScreen from '../screens/community/CommunityScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// タブアイコン
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Beans: '🫘',
    Recipes: '📝',
    Brewing: '☕',
    Community: '👥',
  };
  return <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>{icons[name]}</Text>;
};

// メインタブナビゲーター
function MainTabs() {
  const { isDarkMode } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.primary[700],
        tabBarInactiveTintColor: Colors.neutral.gray500,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.neutral.gray900 : Colors.neutral.white,
          borderTopColor: isDarkMode ? Colors.neutral.gray800 : Colors.neutral.gray200,
        },
        headerStyle: {
          backgroundColor: isDarkMode ? Colors.neutral.gray900 : Colors.neutral.white,
        },
        headerTintColor: isDarkMode ? Colors.neutral.white : Colors.neutral.gray900,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      <Tab.Screen name="Beans" component={BeanListScreen} options={{ title: '豆' }} />
      <Tab.Screen name="Recipes" component={RecipeListScreen} options={{ title: 'レシピ' }} />
      <Tab.Screen name="Brewing" component={BrewingSessionScreen} options={{ title: '抽出' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'コミュニティ' }} />
    </Tab.Navigator>
  );
}

// ルートナビゲーター
export default function Navigation() {
  const { isDarkMode } = useThemeStore();

  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.neutral.white,
      card: Colors.neutral.white,
      text: Colors.neutral.gray900,
      border: Colors.neutral.gray200,
      primary: Colors.primary[700],
    },
  };

  const darkTheme = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      background: Colors.neutral.gray900,
      card: Colors.neutral.gray900,
      text: Colors.neutral.white,
      border: Colors.neutral.gray800,
      primary: Colors.primary[400],
    },
  };

  return (
    <NavigationContainer theme={isDarkMode ? darkTheme : lightTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
