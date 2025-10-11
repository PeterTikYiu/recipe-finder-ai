import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Frown, ListFilter, Trash2 } from 'lucide-react';
import storageService from '../services/storageService';
import RecipeCard from '../components/common/RecipeCard';
import RecipeModal from '../components/common/RecipeModal';
import mockRecipeService from '../services/recipeService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [sortedFavorites, setSortedFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState('addedAt_desc');
  const [filter, setFilter] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const favs = storageService.getFavorites();
    setFavorites(favs);
  }, []);

  useEffect(() => {
    let favs = [...favorites];
    
    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      favs = favs.filter(fav => 
        fav.title.toLowerCase().includes(lowercasedFilter) ||
        fav.cuisines?.some(c => c.toLowerCase().includes(lowercasedFilter)) ||
        fav.diets?.some(d => d.toLowerCase().includes(lowercasedFilter))
      );
    }

    const [key, order] = sortOrder.split('_');
    favs.sort((a, b) => {
      let valA = a[key] || 0;
      let valB = b[key] || 0;
      if (key === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      }
      return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    setSortedFavorites(favs);
  }, [favorites, sortOrder, filter]);

  const handleToggleFavorite = (recipe) => {
    storageService.removeFromFavorites(recipe.id);
    setFavorites(storageService.getFavorites());
    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe(null);
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

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      storageService.getFavorites().forEach(fav => storageService.removeFromFavorites(fav.id));
      setFavorites([]);
    }
  };

  return (
    <div className="animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Heart className="h-10 w-10 text-red-500" />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">My Favorites</h1>
            <p className="text-lg text-gray-600">Your collection of saved recipes.</p>
          </div>
        </div>
        {favorites.length > 0 && (
          <button onClick={handleClearAll} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </header>

      {favorites.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
            <input
              type="text"
              placeholder="Filter by name, cuisine, or diet..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field md:w-1/3"
            />
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-gray-500" />
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-field">
                <option value="addedAt_desc">Sort by: Recently Added</option>
                <option value="title_asc">Sort by: Title (A-Z)</option>
                <option value="title_desc">Sort by: Title (Z-A)</option>
                <option value="readyInMinutes_asc">Sort by: Cooking Time (Shortest)</option>
                <option value="readyInMinutes_desc">Sort by: Cooking Time (Longest)</option>
                <option value="healthScore_desc">Sort by: Health Score</option>
              </select>
            </div>
          </div>

          {sortedFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedFavorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={() => handleRecipeSelect(recipe)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Frown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No favorites match your filter.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Your Favorites List is Empty</h2>
          <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
            Click the heart icon on any recipe to save it here for later.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Discover Recipes
          </button>
        </div>
      )}

      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedRecipe && favorites.some(f => f.id === selectedRecipe.id)}
      />
    </div>
  );
};

export default Favorites;
