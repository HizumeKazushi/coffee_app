// Zustand ストア - アプリ全体の状態管理

import { create } from 'zustand';
import { Bean, Recipe, BrewLog, User } from '../types';

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
  setBeans: (beans: Bean[]) => void;
  addBean: (bean: Bean) => void;
  updateBean: (bean: Bean) => void;
  deleteBean: (id: string) => void;
  selectBean: (bean: Bean | null) => void;
}

export const useBeanStore = create<BeanState>((set) => ({
  beans: [],
  selectedBean: null,
  setBeans: (beans) => set({ beans }),
  addBean: (bean) => set((state) => ({ beans: [...state.beans, bean] })),
  updateBean: (bean) =>
    set((state) => ({
      beans: state.beans.map((b) => (b.id === bean.id ? bean : b)),
    })),
  deleteBean: (id) =>
    set((state) => ({
      beans: state.beans.filter((b) => b.id !== id),
    })),
  selectBean: (bean) => set({ selectedBean: bean }),
}));

// レシピストア
interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  selectRecipe: (recipe: Recipe | null) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  selectedRecipe: null,
  setRecipes: (recipes) => set({ recipes }),
  addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
  updateRecipe: (recipe) =>
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
    })),
  deleteRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    })),
  selectRecipe: (recipe) => set({ selectedRecipe: recipe }),
}));

// 抽出ログストア
interface BrewLogState {
  brewLogs: BrewLog[];
  setBrewLogs: (logs: BrewLog[]) => void;
  addBrewLog: (log: BrewLog) => void;
}

export const useBrewLogStore = create<BrewLogState>((set) => ({
  brewLogs: [],
  setBrewLogs: (brewLogs) => set({ brewLogs }),
  addBrewLog: (log) => set((state) => ({ brewLogs: [...state.brewLogs, log] })),
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
