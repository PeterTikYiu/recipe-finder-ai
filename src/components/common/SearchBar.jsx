import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { debounce } from '../../utils/helpers';
import mockRecipeService from '../../services/recipeService';

const SearchBar = ({ onSearch, onFiltersChange, initialFilters = {} }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: initialFilters.cuisine || 'all',
    diet: initialFilters.diet || 'all',
    maxReadyTime: initialFilters.maxReadyTime || '',
    sort: initialFilters.sort || 'popularity',
  });

  const cuisines = useMemo(() => mockRecipeService.getCuisines(), []);
  const diets = useMemo(() => mockRecipeService.getDietTypes(), []);

  const debouncedSearch = useMemo(() => debounce((q, f) => onSearch(q, f), 300), [onSearch]);

  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    onFiltersChange({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    const resetState = {
      cuisine: 'all',
      diet: 'all',
      maxReadyTime: '',
      sort: 'popularity',
    };
    setFilters(resetState);
    onFiltersChange(resetState);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for recipes, ingredients, or cuisines..."
          className="input-field pl-12 w-full"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost p-2"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine Filter */}
            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <select id="cuisine" name="cuisine" value={filters.cuisine} onChange={handleFilterChange} className="input-field">
                <option value="all">All Cuisines</option>
                {cuisines.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>

            {/* Diet Filter */}
            <div>
              <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">Diet</label>
              <select id="diet" name="diet" value={filters.diet} onChange={handleFilterChange} className="input-field">
                <option value="all">All Diets</option>
                {diets.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>

            {/* Max Ready Time */}
            <div>
              <label htmlFor="maxReadyTime" className="block text-sm font-medium text-gray-700 mb-1">Max Time (min)</label>
              <input
                type="number"
                id="maxReadyTime"
                name="maxReadyTime"
                value={filters.maxReadyTime}
                onChange={handleFilterChange}
                placeholder="e.g., 30"
                className="input-field"
              />
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select id="sort" name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field">
                <option value="popularity">Popularity</option>
                <option value="healthiness">Healthiness</option>
                <option value="time">Time</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={resetFilters} className="btn-secondary flex items-center gap-2">
              <X className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
