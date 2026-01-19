// ナビゲーション設定 - 認証フロー対応

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import BeanListScreen from '../screens/beans/BeanListScreen';
import BeanAddScreen from '../screens/beans/BeanAddScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import RecipeEditorScreen from '../screens/recipes/RecipeEditorScreen';
import RecipeSelectScreen from '../screens/brewing/RecipeSelectScreen';
import BeanSelectScreen from '../screens/brewing/BeanSelectScreen';
import BrewingSessionScreen from '../screens/brewing/BrewingSessionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import RecipeDetailScreen from '../screens/community/RecipeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '400' as const, fontSize: 16 },
};

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Bean Stack Navigator
function BeanStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="BeanList" component={BeanListScreen} options={{ title: '豆' }} />
      <Stack.Screen name="BeanAdd" component={BeanAddScreen} options={{ title: '豆を追加' }} />
    </Stack.Navigator>
  );
}

// Recipe Stack Navigator
function RecipeStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ title: 'レシピ' }} />
      <Stack.Screen name="RecipeEditor" component={RecipeEditorScreen} options={{ title: 'レシピ作成' }} />
    </Stack.Navigator>
  );
}

// Brewing Stack Navigator
function BrewingStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions} initialRouteName="RecipeSelect">
      <Stack.Screen name="RecipeSelect" component={RecipeSelectScreen} options={{ title: 'レシピ選択' }} />
      <Stack.Screen name="BeanSelect" component={BeanSelectScreen} options={{ title: '豆選択' }} />
      <Stack.Screen name="BrewingSession" component={BrewingSessionScreen} options={{ title: '抽出' }} />
    </Stack.Navigator>
  );
}

// Community Stack Navigator
function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="CommunityList" component={CommunityScreen} options={{ title: 'コミュニティ' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'レシピ詳細' }} />
    </Stack.Navigator>
  );
}

// メインタブナビゲーター
function MainTabs() {
  return (
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
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Brewing') {
            iconName = focused ? 'cafe' : 'cafe-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen name="Community" component={CommunityStack} options={{ title: 'コミュニティ' }} />
      <Tab.Screen name="Brewing" component={BrewingStack} options={{ title: '抽出' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: '設定' }} />
    </Tab.Navigator>
  );
}

// ルートナビゲーター
export default function Navigation() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name || '',
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // セッション変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name || '',
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading) {
    return null; // ローディング中は何も表示しない
  }

  return <NavigationContainer>{session ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
}
