// アプリ全体の型定義

// 焙煎度
export type RoastLevel = 'LIGHT' | 'MEDIUM_LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK';

// 挽き目
export type GrindSize = 'EXTRA_FINE' | 'FINE' | 'MEDIUM_FINE' | 'MEDIUM' | 'MEDIUM_COARSE' | 'COARSE';

// 抽出器具
export type Equipment = 'V60' | 'KALITA_WAVE' | 'CHEMEX' | 'AEROPRESS' | 'FRENCH_PRESS' | 'CLEVER' | 'OTHER';

// 豆
export interface Bean {
  id: string;
  userId: string;
  name: string;
  roasterName: string;
  origin: string;
  roastLevel: RoastLevel;
  process: string;
  roastDate: string;
  stockGrams: number;
  flavorNotes: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// レシピステップ
export interface RecipeStep {
  order: number;
  label: string;
  timeSeconds: number;
  waterMl: number;
  notes?: string;
}

// レシピ
export interface Recipe {
  id: string;
  userId: string;
  authorName?: string;
  title: string;
  equipment: Equipment;
  coffeeGrams: number;
  totalWaterMl: number;
  waterTemperature: number;
  grindSize: GrindSize;
  steps: RecipeStep[];
  tags?: string[];
  isPublic: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

// 味の評価項目
export interface TasteNote {
  aspect: 'acidity' | 'bitterness' | 'sweetness' | 'body' | 'aftertaste';
  score: number;
}

// 抽出ログ
export interface BrewLog {
  id: string;
  userId: string;
  recipeId: string;
  beanId: string;
  brewDate: string;
  actualDuration: number;
  rating: number;
  tasteNotes: TasteNote[];
  memo?: string;
  createdAt: string;
}

// ユーザー
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}
