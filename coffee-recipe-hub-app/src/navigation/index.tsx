// ナビゲーション設定 - ミニマルデザイン

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '400', fontSize: 16 },
      }}
    >
      <Stack.Screen name="BeanList" component={BeanListScreen} options={{ title: '豆' }} />
      <Stack.Screen name="BeanAdd" component={BeanAddScreen} options={{ title: '豆を追加' }} />
    </Stack.Navigator>
  );
}

// Recipe Stack Navigator
function RecipeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '400', fontSize: 16 },
      }}
    >
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
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Beans') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Recipes') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Brewing') {
              iconName = focused ? 'cafe' : 'cafe-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: '#1a1a1a',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#eee',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '400',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: true, title: 'ホーム' }} />
        <Tab.Screen name="Beans" component={BeanStack} options={{ title: '豆' }} />
        <Tab.Screen name="Recipes" component={RecipeStack} options={{ title: 'レシピ' }} />
        <Tab.Screen name="Brewing" component={BrewingSessionScreen} options={{ headerShown: true, title: '抽出' }} />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{ headerShown: true, title: 'コミュニティ' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
