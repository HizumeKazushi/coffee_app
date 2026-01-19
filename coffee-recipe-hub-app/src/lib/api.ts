// API クライアント

import { supabase } from './supabase';

// 環境変数から API URL を取得（本番環境ではRenderのURL、開発環境ではlocalhost）
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const getAuthHeader = async (): Promise<HeadersInit> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};

export const api = {
  // Beans
  getBeans: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/beans`, { headers });
    if (!res.ok) throw new Error('Failed to fetch beans');
    return res.json();
  },

  createBean: async (bean: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/beans`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(bean),
    });
    if (!res.ok) throw new Error('Failed to create bean');
    return res.json();
  },

  updateBean: async (id: string, bean: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/beans/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(bean),
    });
    if (!res.ok) throw new Error('Failed to update bean');
    return res.json();
  },

  deleteBean: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/beans/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete bean');
    return res.json();
  },

  // Recipes
  getRecipes: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes`, { headers });
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  getPublicRecipes: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/public`, { headers });
    if (!res.ok) throw new Error('Failed to fetch public recipes');
    return res.json();
  },

  createRecipe: async (recipe: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  },

  deleteRecipe: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete recipe');
    return res.json();
  },

  updateRecipe: async (id: string, recipe: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error('Failed to update recipe');
    return res.json();
  },

  // BrewLogs
  createBrewLog: async (log: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/brew-logs`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error('Failed to create brew log');
    return res.json();
  },

  getBrewLogs: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/brew-logs`, { headers });
    if (!res.ok) throw new Error('Failed to fetch brew logs');
    return res.json();
  },

  // Likes
  likeRecipe: async (recipeId: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/${recipeId}/like`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error('Failed to like recipe');
    return res.json();
  },

  unlikeRecipe: async (recipeId: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/${recipeId}/like`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to unlike recipe');
    return res.json();
  },

  checkLikeStatus: async (recipeId: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/recipes/${recipeId}/like`, { headers });
    if (!res.ok) throw new Error('Failed to check like status');
    return res.json();
  },
};
