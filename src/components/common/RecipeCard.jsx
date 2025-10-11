import React from 'react';
import { Heart, Clock, Star, Zap } from 'lucide-react';
import { cn, formatCookingTime } from '../../utils/helpers';
import storageService from '../../services/storageService';

const RecipeCard = ({ recipe, onSelect, onToggleFavorite }) => {
  const isFavorite = storageService.isFavorite(recipe.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(recipe);
  };

  return (
    <div
      className="card cursor-pointer group flex flex-col h-full"
      onClick={() => onSelect(recipe)}
    >
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-lg mb-4 group-hover:opacity-90 transition-opacity"
        />
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
          <span>{formatCookingTime(recipe.readyInMinutes)}</span>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover:text-primary-600">
          {recipe.title}
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
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-3 mt-auto">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{recipe.spoonacularScore || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-green-500" />
            <span className="font-medium">{recipe.healthScore || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium">{recipe.aggregateLikes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
