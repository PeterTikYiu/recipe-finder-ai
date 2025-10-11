/**
 * Advanced Local Storage Service with IndexedDB fallback
 * Provides robust offline data persistence for recipes, favorites, and user preferences
 */

class StorageService {
  constructor() {
    this.storageKeys = {
      RECIPES_CACHE: 'recipes_cache',
      FAVORITES: 'user_favorites',
      SEARCH_HISTORY: 'search_history',
      USER_PREFERENCES: 'user_preferences',
      NUTRITION_CACHE: 'nutrition_cache',
      APP_VERSION: 'app_version'
    };
    
    this.currentVersion = '1.0.0';
    this.initializeStorage();
  }

  /**
   * Initialize storage and handle version migrations
   */
  initializeStorage() {
    try {
      const storedVersion = this.getItem(this.storageKeys.APP_VERSION);
      
      if (!storedVersion || storedVersion !== this.currentVersion) {
        this.migrateData(storedVersion);
        this.setItem(this.storageKeys.APP_VERSION, this.currentVersion);
      }
      
      // Initialize default user preferences if not exists
      if (!this.getUserPreferences()) {
        this.setUserPreferences({
          theme: 'light',
          defaultServings: 4,
          dietaryRestrictions: [],
          measurementUnit: 'metric',
          language: 'en'
        });
      }
      
    } catch (error) {
      console.error('Storage initialization failed:', error);
    }
  }

  /**
   * Handle data migration between app versions
   */
  migrateData(fromVersion) {
    console.log(`Migrating data from version ${fromVersion} to ${this.currentVersion}`);
    // Add migration logic here for future versions
  }

  /**
   * Generic get item from localStorage with error handling
   */
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Generic set item to localStorage with error handling
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  // ==================== RECIPES CACHE ====================

  /**
   * Cache recipe search results
   */
  cacheRecipeSearch(query, filters, recipes) {
    const cacheKey = this.generateCacheKey(query, filters);
    const cache = this.getItem(this.storageKeys.RECIPES_CACHE) || {};
    
    cache[cacheKey] = {
      recipes,
      timestamp: Date.now(),
      query,
      filters
    };
    
    // Keep only last 50 searches to prevent storage bloat
    const entries = Object.entries(cache);
    if (entries.length > 50) {
      const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const trimmed = Object.fromEntries(sorted.slice(0, 50));
      this.setItem(this.storageKeys.RECIPES_CACHE, trimmed);
    } else {
      this.setItem(this.storageKeys.RECIPES_CACHE, cache);
    }
  }

  /**
   * Get cached recipe search results
   */
  getCachedRecipeSearch(query, filters) {
    const cacheKey = this.generateCacheKey(query, filters);
    const cache = this.getItem(this.storageKeys.RECIPES_CACHE) || {};
    const result = cache[cacheKey];
    
    if (result) {
      const ageInHours = (Date.now() - result.timestamp) / (1000 * 60 * 60);
      // Cache expires after 24 hours
      if (ageInHours < 24) {
        return result.recipes;
      }
    }
    
    return null;
  }

  /**
   * Generate cache key from query and filters
   */
  generateCacheKey(query, filters = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {});
    
    return btoa(`${normalizedQuery}_${JSON.stringify(sortedFilters)}`);
  }

  // ==================== FAVORITES ====================

  /**
   * Get all favorite recipes
   */
  getFavorites() {
    return this.getItem(this.storageKeys.FAVORITES) || [];
  }

  /**
   * Add recipe to favorites
   */
  addToFavorites(recipe) {
    const favorites = this.getFavorites();
    
    // Check if already exists
    if (favorites.some(fav => fav.id === recipe.id)) {
      return false; // Already in favorites
    }
    
    const favoriteItem = {
      ...recipe,
      addedAt: Date.now(),
      tags: recipe.tags || [],
      notes: ''
    };
    
    favorites.unshift(favoriteItem); // Add to beginning
    return this.setItem(this.storageKeys.FAVORITES, favorites);
  }

  /**
   * Remove recipe from favorites
   */
  removeFromFavorites(recipeId) {
    const favorites = this.getFavorites();
    const updated = favorites.filter(fav => fav.id !== recipeId);
    return this.setItem(this.storageKeys.FAVORITES, updated);
  }

  /**
   * Check if recipe is in favorites
   */
  isFavorite(recipeId) {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === recipeId);
  }

  /**
   * Update favorite recipe notes
   */
  updateFavoriteNotes(recipeId, notes) {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(fav => fav.id === recipeId);
    
    if (index !== -1) {
      favorites[index].notes = notes;
      favorites[index].updatedAt = Date.now();
      return this.setItem(this.storageKeys.FAVORITES, favorites);
    }
    
    return false;
  }

  /**
   * Add tags to favorite recipe
   */
  updateFavoriteTags(recipeId, tags) {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(fav => fav.id === recipeId);
    
    if (index !== -1) {
      favorites[index].tags = [...new Set(tags)]; // Remove duplicates
      favorites[index].updatedAt = Date.now();
      return this.setItem(this.storageKeys.FAVORITES, favorites);
    }
    
    return false;
  }

  // ==================== SEARCH HISTORY ====================

  /**
   * Add search query to history
   */
  addSearchHistory(query, filters = {}) {
    const history = this.getItem(this.storageKeys.SEARCH_HISTORY) || [];
    
    const searchItem = {
      query: query.trim(),
      filters,
      timestamp: Date.now()
    };
    
    // Remove duplicate if exists
    const filtered = history.filter(item => 
      item.query !== searchItem.query || 
      JSON.stringify(item.filters) !== JSON.stringify(searchItem.filters)
    );
    
    filtered.unshift(searchItem);
    
    // Keep only last 20 searches
    const trimmed = filtered.slice(0, 20);
    
    return this.setItem(this.storageKeys.SEARCH_HISTORY, trimmed);
  }

  /**
   * Get search history
   */
  getSearchHistory(limit = 10) {
    const history = this.getItem(this.storageKeys.SEARCH_HISTORY) || [];
    return history.slice(0, limit);
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    return this.setItem(this.storageKeys.SEARCH_HISTORY, []);
  }

  // ==================== USER PREFERENCES ====================

  /**
   * Get user preferences
   */
  getUserPreferences() {
    return this.getItem(this.storageKeys.USER_PREFERENCES);
  }

  /**
   * Set user preferences
   */
  setUserPreferences(preferences) {
    const current = this.getUserPreferences() || {};
    const updated = { ...current, ...preferences };
    return this.setItem(this.storageKeys.USER_PREFERENCES, updated);
  }

  /**
   * Update specific preference
   */
  updatePreference(key, value) {
    const preferences = this.getUserPreferences() || {};
    preferences[key] = value;
    return this.setItem(this.storageKeys.USER_PREFERENCES, preferences);
  }

  // ==================== NUTRITION CACHE ====================

  /**
   * Cache AI nutrition analysis
   */
  cacheNutritionAnalysis(ingredientText, nutrition) {
    const cache = this.getItem(this.storageKeys.NUTRITION_CACHE) || {};
    const key = btoa(ingredientText.toLowerCase().trim());
    
    cache[key] = {
      nutrition,
      timestamp: Date.now(),
      ingredientText
    };
    
    // Keep only last 100 analyses
    const entries = Object.entries(cache);
    if (entries.length > 100) {
      const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const trimmed = Object.fromEntries(sorted.slice(0, 100));
      this.setItem(this.storageKeys.NUTRITION_CACHE, trimmed);
    } else {
      this.setItem(this.storageKeys.NUTRITION_CACHE, cache);
    }
  }

  /**
   * Get cached nutrition analysis
   */
  getCachedNutritionAnalysis(ingredientText) {
    const cache = this.getItem(this.storageKeys.NUTRITION_CACHE) || {};
    const key = btoa(ingredientText.toLowerCase().trim());
    const result = cache[key];
    
    if (result) {
      const ageInHours = (Date.now() - result.timestamp) / (1000 * 60 * 60);
      // Cache expires after 7 days
      if (ageInHours < 168) {
        return result.nutrition;
      }
    }
    
    return null;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    const keys = Object.values(this.storageKeys);
    const info = {};
    let totalSize = 0;
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      const size = data ? new Blob([data]).size : 0;
      info[key] = {
        size,
        sizeFormatted: this.formatBytes(size),
        exists: !!data
      };
      totalSize += size;
    });
    
    return {
      individual: info,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      available: this.getAvailableStorage()
    };
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Estimate available localStorage space
   */
  getAvailableStorage() {
    try {
      const testKey = 'storage_test';
      let testSize = 1024; // 1KB
      let lastGoodSize = 0;
      
      // Binary search for max size
      while (testSize <= 10 * 1024 * 1024) { // Max 10MB
        try {
          localStorage.setItem(testKey, 'x'.repeat(testSize));
          localStorage.removeItem(testKey);
          lastGoodSize = testSize;
          testSize *= 2;
        } catch (e) {
          break;
        }
      }
      
      return this.formatBytes(lastGoodSize);
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Clear all app data (for reset functionality)
   */
  clearAllData() {
    Object.values(this.storageKeys).forEach(key => {
      this.removeItem(key);
    });
    
    // Reinitialize with defaults
    this.initializeStorage();
    return true;
  }

  /**
   * Export all data for backup
   */
  exportData() {
    const data = {};
    Object.values(this.storageKeys).forEach(key => {
      data[key] = this.getItem(key);
    });
    
    return {
      version: this.currentVersion,
      exportDate: new Date().toISOString(),
      data
    };
  }

  /**
   * Import data from backup
   */
  importData(exportedData) {
    try {
      if (!exportedData.version || !exportedData.data) {
        throw new Error('Invalid export format');
      }
      
      Object.entries(exportedData.data).forEach(([key, value]) => {
        if (Object.values(this.storageKeys).includes(key)) {
          this.setItem(key, value);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Data import failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;