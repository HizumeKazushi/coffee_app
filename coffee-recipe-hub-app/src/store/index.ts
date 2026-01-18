// Zustand ストア - アプリ全体の状態管理

import { create } from 'zustand';
import { Bean, Recipe, BrewLog, User } from '../types';
import { api } from '../lib/api';

// 認証ストア
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// 豆ストア
interface BeanState {
  beans: Bean[];
  selectedBean: Bean | null;
  loading: boolean;
  error: string | null;
  fetchBeans: () => Promise<void>;
  addBean: (bean: Partial<Bean>) => Promise<void>;
  updateBean: (bean: Bean) => Promise<void>;
  deleteBean: (id: string) => Promise<void>;
  selectBean: (bean: Bean | null) => void;
}

export const useBeanStore = create<BeanState>((set) => ({
  beans: [],
  selectedBean: null,
  loading: false,
  error: null,

  fetchBeans: async () => {
    set({ loading: true, error: null });
    try {
      const beans = await api.getBeans();
      set({ beans, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  addBean: async (bean) => {
    set({ loading: true, error: null });
    try {
      const newBean = await api.createBean(bean);
      set((state) => ({ beans: [newBean, ...state.beans], loading: false }));
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  updateBean: async (bean) => {
    set({ loading: true, error: null });
    try {
      await api.updateBean(bean.id, bean);
      // バックエンドが更新後のBeanを返さないため、再取得する
      const beans = await api.getBeans();
      set({ beans, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  deleteBean: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteBean(id);
      set((state) => ({
        beans: state.beans.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  selectBean: (bean) => set({ selectedBean: bean }),
}));

// レシピストア
interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Partial<Recipe>) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  selectRecipe: (recipe: Recipe | null) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  selectedRecipe: null,
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null });
    try {
      const recipes = await api.getRecipes();
      set({ recipes, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  addRecipe: async (recipe) => {
    set({ loading: true, error: null });
    try {
      const newRecipe = await api.createRecipe(recipe);
      set((state) => ({ recipes: [newRecipe, ...state.recipes], loading: false }));
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  updateRecipe: async (recipe) => {
    set({ loading: true, error: null });
    try {
      await api.updateRecipe(recipe.id, recipe);
      // バックエンドが更新後のRecipeを返さないため、再取得する
      const recipes = await api.getRecipes();
      set({ recipes, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteRecipe(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  selectRecipe: (recipe) => set({ selectedRecipe: recipe }),
}));

// 抽出ログストア
interface BrewLogState {
  brewLogs: BrewLog[];
  loading: boolean;
  fetchBrewLogs: () => Promise<void>;
  addBrewLog: (log: Partial<BrewLog>) => Promise<void>;
}

export const useBrewLogStore = create<BrewLogState>((set) => ({
  brewLogs: [],
  loading: false,

  fetchBrewLogs: async () => {
    set({ loading: true });
    try {
      const brewLogs = await api.getBrewLogs();
      set({ brewLogs, loading: false });
    } catch (e) {
      set({ loading: false });
    }
  },

  addBrewLog: async (log) => {
    try {
      const newLog = await api.createBrewLog(log);
      set((state) => ({ brewLogs: [newLog, ...state.brewLogs] }));
    } catch (e) {
      console.error(e);
    }
  },
}));

// テーマストア
interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
