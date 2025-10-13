import React, { useState, useEffect, useCallback } from 'react';
import { Frown, AlertCircle } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import { motion } from 'framer-motion';
import RecipeCard from '../components/common/RecipeCard';
import RecipeModal from '../components/common/RecipeModal';
import RecipeCardSkeleton from '../components/common/RecipeCardSkeleton';
import mealDb from '../services/theMealDbService.js';
import storageService from '../services/storageService';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(storageService.getUserPreferences()?.searchFilters || {});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1); // pagination: 12 items per page
  const navigate = useNavigate();

  useEffect(() => {
    setFavorites(storageService.getFavorites());
  }, []);

  // Infinite scroll: increase page when near bottom
  useEffect(() => {
    function handleScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      const canGrow = page * 12 < recipes.length;
      if (nearBottom && canGrow) {
        setPage((p) => (p * 12 < recipes.length ? p + 1 : p));
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, recipes.length]);

  // Use TheMealDB exclusively (no API key required)
  const searchRecipes = useCallback(async (query, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch full details for first 12 results (homepage or search)
      const partialRes = await mealDb.searchMeals(query || '', currentFilters);
      const partials = partialRes.results || [];
      const fulls = await Promise.all(
        partials.slice(0, 60).map(async (p) => {
          try {
            return await mealDb.getMealDetails(p.id, p);
          } catch {
            return p;
          }
        })
      );
      setRecipes(fulls);
      setPage(1);
    } catch {
      setError('Failed to fetch recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // note: handleSearch not used; SearchBar calls searchRecipes directly

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    storageService.updatePreference('searchFilters', newFilters);
  };

  const handleToggleFavorite = (recipe) => {
    const isFav = storageService.isFavorite(recipe.id);
    if (isFav) {
      storageService.removeFromFavorites(recipe.id);
    } else {
      storageService.addToFavorites(recipe);
    }
    // Refresh favorites from storage to keep objects in sync
    setFavorites(storageService.getFavorites());
  };

  const handleRecipeSelect = async (recipe) => {
    // Do not set page loading; show modal without refreshing background
    setSelectedRecipe(recipe);
    try {
      const details = await mealDb.getMealDetails(recipe.id, recipe);
      setSelectedRecipe(details);
    } catch {
      // keep partial recipe in modal if details fail
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

    const visibleCount = Math.min(page * 12, recipes.length);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.slice(0, visibleCount).map((recipe) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <RecipeCard
              recipe={recipe}
              onSelect={() => handleRecipeSelect(recipe)}
              onToggleFavorite={() => handleToggleFavorite(recipe)}
              isFavorite={favorites.some(fav => fav.id === recipe.id)}
            />
          </motion.div>
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
        <div className="mt-4 flex items-center gap-3 justify-center">
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>Get Started</button>
          <button className="btn-ghost" onClick={() => navigate('/recommended')}>Recommended</button>
          <button className="btn-ghost" onClick={() => navigate('/profile')}>Set Preferences</button>
        </div>
      </header>

      <SearchBar onSearch={searchRecipes} onFiltersChange={handleFiltersChange} initialFilters={filters} />

      <div className="mt-8">
        {renderContent()}
        {recipes.length > page * 12 ? (
          <div className="mt-8 flex justify-center">
            <button className="btn-secondary" onClick={() => setPage((p) => (p * 12 < recipes.length ? p + 1 : p))}>
              Next Page
            </button>
          </div>
        ) : recipes.length > 0 ? (
          <div className="mt-8 text-center text-gray-500">End of results</div>
        ) : null}
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
