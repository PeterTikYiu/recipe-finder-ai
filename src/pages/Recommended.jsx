import React, { useEffect, useState } from 'react';
import storageService from '../services/storageService';
import mealDb from '../services/theMealDbService.js';
import RecipeCard from '../components/common/RecipeCard';
import RecipeCardSkeleton from '../components/common/RecipeCardSkeleton';
import RecipeModal from '../components/common/RecipeModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Recommended() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { getPrefs } = useAuth();

  useEffect(() => {
    setFavorites(storageService.getFavorites());
    (async () => {
      setLoading(true);
      try {
  const prefs = (typeof getPrefs === 'function' ? getPrefs() : storageService.getUserPreferences()) || {};

        // Build multiple seeds from cuisines, meats, and diet
        // Randomize preference ordering for variety, capped to reasonable counts
        const cuisines = shuffle([...(prefs.favoriteCuisines && prefs.favoriteCuisines.length ? prefs.favoriteCuisines : prefs.cuisines) || []]).slice(0, 3);
        const meats = shuffle([...(Array.isArray(prefs.meats) ? prefs.meats : [])]).slice(0, 2);
        const seeds = [];
        cuisines.forEach((c) => seeds.push({ query: '', filters: { cuisine: c } }));
        meats.forEach((m) => seeds.push({ query: String(m).toLowerCase(), filters: {} }));
        if (prefs.diet === 'vegetarian') seeds.push({ query: 'vegetarian', filters: {} });
        if (seeds.length === 0) seeds.push({ query: 'chicken', filters: {} });

        // Shuffle seed order for more variety across reloads
        const seedOrder = shuffle(seeds);
        const batches = await Promise.all(
          seedOrder.map((s) => mealDb.searchMeals(s.query, s.filters).catch(() => ({ results: [] })))
        );
        let merged = [];
        const seen = new Set();
        for (const b of batches) {
          for (const r of (b.results || [])) {
            if (!seen.has(r.id)) {
              seen.add(r.id);
              merged.push(r);
            }
          }
        }

        if (!merged.length) {
          const fb = await mealDb.searchMeals('chicken', {});
          merged = fb.results || [];
        }

        // Shuffle merged before details to avoid same ordering; fetch more to allow filtering/diversity
        merged = shuffle(merged);
        // Fetch details for more items than needed, so filtering by allergens still leaves enough
        const detailList = await Promise.all(
          merged.slice(0, 60).map((p) => mealDb.getMealDetails(p.id, p).catch(() => p))
        );

        // Filter out recipes containing allergens (ingredients or instructions)
        const allergens = (prefs.allergens || prefs.avoid || []).map((a) => String(a).toLowerCase());
        const withoutAllergens = detailList.filter((r) => !hasAllergens(r, allergens));

        // Enforce vegetarian preference by removing items with clear meat/seafood mentions
        let afterDiet = withoutAllergens;
        if (prefs.diet === 'vegetarian') {
          afterDiet = withoutAllergens.filter((r) => !hasMeatTerms(r));
          if (afterDiet.length === 0) afterDiet = withoutAllergens; // keep something if filter is too strict
        }

        const finalPool = afterDiet.length ? afterDiet : detailList; // don't return empty unless absolutely no results

        // Score, then pick from the top pool with randomness for variety without sacrificing quality
        const scoredSorted = finalPool
          .map((r) => ({ r, score: scoreRecipe(r, prefs) }))
          .sort((a, b) => b.score - a.score);

        const poolSize = Math.min(24, scoredSorted.length);
        const topPool = scoredSorted.slice(0, poolSize).map((s) => s.r);
        const randomizedTop = shuffle(topPool);
  const scored = randomizedTop; // store full ordered list; render by page below
        setRecipes(scored);
  setPage(1);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    })();
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

  const scoreRecipe = (recipe, prefs) => {
    let score = 0;
    const allCuisines = (prefs.favoriteCuisines && prefs.favoriteCuisines.length ? prefs.favoriteCuisines : prefs.cuisines) || [];
    if (allCuisines.length && recipe.cuisines?.length) {
      if (allCuisines.some((c) => recipe.cuisines.includes(c))) score += 10;
    }
    if (prefs.meats?.length && recipe.title) {
      const title = recipe.title.toLowerCase();
      if (prefs.meats.some((m) => title.includes(String(m).toLowerCase()))) score += 5;
    }
    // allergens are filtered earlier; extra safety penalty if summary still mentions
    if (prefs.allergens?.length && recipe.summary) {
      const sum = recipe.summary.toLowerCase();
      const hasAllergen = prefs.allergens.some((a) => sum.includes(a.toLowerCase()));
      if (hasAllergen) score -= 20;
    }
    if (prefs.calorieTarget && recipe.nutrition?.calories) {
      const diff = Math.abs(recipe.nutrition.calories - prefs.calorieTarget / 3);
      score += Math.max(0, 10 - Math.min(10, Math.round(diff / 100)));
    }
    return score;
  };

  function hasAllergens(recipe, allergens) {
    if (!allergens || allergens.length === 0) return false;
    const lower = (s) => (s || '').toLowerCase();
    const ingText = (recipe.extendedIngredients || [])
      .map((i) => `${lower(i.name)} ${lower(i.original)}`)
      .join(' ');
    const instrText = (recipe.analyzedInstructions?.[0]?.steps || [])
      .map((s) => lower(s.step))
      .join(' ');
    const sumText = lower(recipe.summary);

    return allergens.some((aRaw) => {
      const a = String(aRaw).toLowerCase().trim();
      const variants = buildAllergenVariants(a);
      const pattern = new RegExp(`\\b(${variants.map(escapeRegExp).join('|')})\\b`, 'i');
      return pattern.test(ingText) || pattern.test(instrText) || pattern.test(sumText);
    });
  }

  function buildAllergenVariants(a) {
    const variants = new Set([a]);
    if (!a.endsWith('s')) variants.add(`${a}s`);
    // Common -y to -ies plural (rough heuristic)
    if (a.endsWith('y')) variants.add(`${a.slice(0, -1)}ies`);
    return Array.from(variants);
  }

  function hasMeatTerms(recipe) {
    const meats = [
      'chicken','beef','pork','lamb','mutton','bacon','ham','turkey','duck','goose','veal','sausage','prosciutto','salami','chorizo',
      'fish','seafood','prawn','shrimp','crab','lobster','clam','mussel','oyster','anchovy','sardine','tuna','salmon','cod','trout','mackerel'
    ];
    const lower = (s) => (s || '').toLowerCase();
    const ingText = (recipe.extendedIngredients || [])
      .map((i) => `${lower(i.name)} ${lower(i.original)}`)
      .join(' ');
    const instrText = (recipe.analyzedInstructions?.[0]?.steps || [])
      .map((s) => lower(s.step))
      .join(' ');
    const sumText = lower(recipe.summary);
    const text = `${ingText} ${instrText} ${sumText}`;
    const pattern = new RegExp(`\\b(${meats.map(escapeRegExp).join('|')})\\b`, 'i');
    return pattern.test(text);
  }

  function escapeRegExp(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleToggleFavorite = (recipe) => {
    const isFav = storageService.isFavorite(recipe.id);
    if (isFav) {
      storageService.removeFromFavorites(recipe.id);
    } else {
      storageService.addToFavorites(recipe);
    }
    setFavorites(storageService.getFavorites());
  };

  const handleRecipeSelect = async (recipe) => {
    // Do not set page loading; show modal first
    setSelectedRecipe(recipe);
    try {
      const details = await mealDb.getMealDetails(recipe.id, recipe);
      setSelectedRecipe(details);
    } catch {
      // ignore; keep partial recipe visible
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Recommended For You</h1>
        <button className="btn-ghost" onClick={() => navigate('/onboarding')}>Adjust Preferences</button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.slice(0, Math.min(page * 12, recipes.length)).map((recipe) => (
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
                isFavorite={favorites.some(f => f.id === recipe.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-600 mb-4">We couldn't find recommendations matching your current preferences.</p>
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>Update Preferences</button>
        </div>
      )}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedRecipe && favorites.some(f => f.id === selectedRecipe.id)}
      />
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
  );
}
