import React, { useState, useEffect, useCallback } from 'react';
import { Frown, AlertCircle } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import RecipeCard from '../components/common/RecipeCard';
import RecipeModal from '../components/common/RecipeModal';
import RecipeCardSkeleton from '../components/common/RecipeCardSkeleton';
import mockRecipeService from '../services/recipeService';
import storageService from '../services/storageService';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(storageService.getUserPreferences()?.searchFilters || {});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(storageService.getFavorites());
  }, []);

  const searchRecipes = useCallback(async (query, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockRecipeService.searchRecipes(query, currentFilters);
      setRecipes(response.results);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (query, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const { results } = await mockRecipeService.searchRecipes(query, currentFilters);
      setRecipes(results);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    storageService.updatePreference('searchFilters', newFilters);
  };

  const handleToggleFavorite = (recipe) => {
    if (favorites.includes(recipe.id)) {
      storageService.removeFromFavorites(recipe.id);
      setFavorites(prev => prev.filter(id => id !== recipe.id));
    } else {
      storageService.addToFavorites(recipe);
      setFavorites(prev => [...prev, recipe.id]);
    }
  };

  const handleRecipeSelect = async (recipe) => {
    setLoading(true);
    try {
      const details = await mockRecipeService.getRecipeDetails(recipe.id);
      setSelectedRecipe(details);
    } catch (error) {
      setError('Could not load recipe details.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading && recipes.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 text-red-500 bg-red-50 rounded-lg">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl font-semibold">{error}</p>
          <p>Please try again later.</p>
        </div>
      );
    }

    if (recipes.length === 0 && !loading) {
      return (
        <div className="text-center py-16">
          <Frown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No recipes found. Try a different search!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onSelect={() => handleRecipeSelect(recipe)}
            onToggleFavorite={() => handleToggleFavorite(recipe)}
            isFavorite={favorites.some(fav => fav.id === recipe.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">
          Find Your <span className="text-gradient">Perfect Recipe</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search from thousands of recipes, get AI-powered nutrition insights, and save your favorites.
        </p>
      </header>

      <SearchBar onSearch={searchRecipes} onFiltersChange={handleFiltersChange} initialFilters={filters} />

      <div className="mt-8">
        {renderContent()}
      </div>

      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedRecipe && favorites.some(f => f.id === selectedRecipe.id)}
      />
    </div>
  );
};

export default Home;
