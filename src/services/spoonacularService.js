// src/services/spoonacularService.js
export const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

// Simple in-flight request deduplication
const inflight = new Map();

import storageService from './storageService.js';

export async function searchRecipes(query, filters = {}) {
  const params = new URLSearchParams();
  params.append('apiKey', SPOONACULAR_API_KEY);
  if (query) params.append('query', query);
  if (filters.cuisine && filters.cuisine !== 'all') params.append('cuisine', filters.cuisine);
  if (filters.diet && filters.diet !== 'all') params.append('diet', filters.diet);
  if (filters.maxReadyTime) params.append('maxReadyTime', filters.maxReadyTime);
  if (filters.sort) params.append('sort', filters.sort);
  // Keep API usage minimal during development
  params.append('number', '1');
  // Ask Spoonacular to include extra fields to avoid additional detail calls
  params.append('addRecipeInformation', 'true');
  params.append('addRecipeNutrition', 'true');
  const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`;
  // Try cache first
  const cached = storageService.getCachedRecipeSearch(query || '', filters || {});
  if (cached) return { results: cached };

  if (inflight.has(url)) return inflight.get(url);
  const req = fetch(url).then(async (res) => {
    if (!res.ok) throw new Error('Failed to fetch recipes');
    const data = await res.json();
    return data;
  }).finally(() => inflight.delete(url));
  inflight.set(url, req);
  const data = await req;
  // Cache results
  if (Array.isArray(data.results)) {
    storageService.cacheRecipeSearch(query || '', filters || {}, data.results);
  }
  return data;
}

export async function getRecipeDetails(id) {
  // Try cache first
  const cached = storageService.getCachedRecipeDetails(id);
  if (cached) return cached;

  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
  if (inflight.has(url)) return inflight.get(url);
  const req = fetch(url).then(async (res) => {
    if (!res.ok) throw new Error('Failed to fetch recipe details');
    const data = await res.json();
    return data;
  }).finally(() => inflight.delete(url));
  inflight.set(url, req);
  const data = await req;
  storageService.cacheRecipeDetails(id, data);
  storageService.incrementRecipeAccessCount(id);
  return data;
}
