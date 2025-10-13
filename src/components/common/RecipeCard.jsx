import React from 'react';
import { Heart, Clock, Star, Zap, Flame } from 'lucide-react';
import { cn, formatCookingTime, extractCaloriesFromSummary, estimateCookingTimeFromInstructions } from '../../utils/helpers';
import storageService from '../../services/storageService';

const RecipeCard = ({ recipe, onSelect, onToggleFavorite, isFavorite: isFavoriteProp }) => {
  const isFavorite = typeof isFavoriteProp === 'boolean' ? isFavoriteProp : storageService.isFavorite(recipe.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(recipe);
  };

  // Extract calories from nutrition (Spoonacular or TheMealDB)
  let calories = null;
  if (recipe.nutrition) {
    if (Array.isArray(recipe.nutrition.nutrients)) {
      const calObj = recipe.nutrition.nutrients.find(n => n.name === 'Calories');
      if (calObj && typeof calObj.amount === 'number') calories = Math.round(calObj.amount);
    } else if (typeof recipe.nutrition.calories === 'number') {
      calories = Math.round(recipe.nutrition.calories);
    }
  }
  // Fallback: parse from summary if not present in nutrition
  if (calories === null && recipe.summary) {
    const fromSummary = extractCaloriesFromSummary(recipe.summary);
    if (typeof fromSummary === 'number') calories = fromSummary;
  }

  // Health score and spoonacular score (from getRecipeDetails)
  const healthScore = typeof recipe.healthScore === 'number' ? recipe.healthScore : 'N/A';
  // Round up the star value for display
  const spoonacularScore = typeof recipe.spoonacularScore === 'number'
    ? Math.ceil(recipe.spoonacularScore)
    : null;

  // Likes (from both search and details)
  const likes = typeof recipe.aggregateLikes === 'number' ? recipe.aggregateLikes : (typeof recipe.likes === 'number' ? recipe.likes : 0);

  // Estimate cooking time for TheMealDB recipes if missing
  let displayTime = recipe.readyInMinutes;
  if (!displayTime && recipe.source === 'mealdb') {
    // Try to estimate from instructions
    const instructionsText = Array.isArray(recipe.analyzedInstructions)
      ? recipe.analyzedInstructions.map(i => i.steps?.map(s => s.step).join(' ')).join(' ')
      : '';
    const est = estimateCookingTimeFromInstructions(instructionsText);
    if (est) displayTime = est;
  }

  // Fallbacks for missing details
  const hasDetails = recipe.ingredients || recipe.instructions || recipe.summary;
  const imageSrc = recipe.image || '/placeholder.svg';

  return (
    <div
      className="card cursor-pointer group flex flex-col h-full"
      onClick={() => onSelect(recipe)}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={recipe.title || 'Recipe'}
          className="w-full h-48 object-cover rounded-lg mb-4 group-hover:opacity-90 transition-opacity"
        />
        {recipe.source === 'mealdb' && (
          <span className="absolute top-2 left-2 bg-white/85 text-gray-700 text-[10px] px-2 py-0.5 rounded-full border border-gray-200">
            MealDB
          </span>
        )}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full transition-all duration-200",
            isFavorite ? "bg-red-500/90 text-white" : "bg-white/80 hover:bg-white"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isFavorite ? "fill-current" : "text-gray-600")} />
        </button>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatCookingTime(displayTime)}</span>
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover:text-primary-600">
          {recipe.title || 'Recipe'}
        </h3>
        <div className="flex-grow mb-4">
          <div className="flex flex-wrap gap-2">
            {recipe.cuisines?.slice(0, 2).map((cuisine) => (
              <span key={cuisine} className="badge bg-secondary-100 text-secondary-800">
                {cuisine}
              </span>
            ))}
            {recipe.diets?.slice(0, 2).map((diet) => (
              <span key={diet} className="badge bg-primary-50 text-primary-800">
                {diet}
              </span>
            ))}
            {recipe.type && (
              <span className="badge bg-gray-100 text-gray-800">{recipe.type}</span>
            )}
          </div>
          {!hasDetails && (
            <div className="mt-4 text-sm text-gray-500">
              Recipe details are unavailable. Try searching by name or check back later.
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-3 mt-auto">
          {typeof spoonacularScore === 'number' && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{spoonacularScore}</span>
            </div>
          )}
          {typeof healthScore === 'number' && (
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="font-medium">{healthScore}</span>
            </div>
          )}
          {typeof calories === 'number' && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{`${calories} kcal`}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium">{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
