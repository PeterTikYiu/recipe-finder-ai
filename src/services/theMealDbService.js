// src/services/theMealDbService.js
// Lightweight client for TheMealDB (no key required)
import { estimateCookingTimeFromInstructions } from '../utils/helpers.js';
import storageService from './storageService.js';

// Rough per-100g kcal estimates for common items
const KCAL_100G = {
  chicken: 165,
  beef: 250,
  pork: 242,
  rice: 130,
  onion: 40,
  tomato: 18,
  garlic: 149,
  ginger: 80,
  milk: 61,
  cream: 340,
  butter: 717,
  oil: 884,
  'olive oil': 884,
  olive: 115,
  olives: 115,
  breadcrumbs: 395,
  honey: 304,
  'soy sauce': 53,
  sugar: 387,
  flour: 364,
  cheese: 402,
  yogurt: 59,
  mushroom: 22,
  parsley: 36,
  passata: 18,
  'curry powder': 325,
  'garam masala': 340,
  paprika: 282,
  turmeric: 354,
  cumin: 375,
  chilli: 318,
  'potato starch': 330,
  lemon: 29,
  stock: 5,
  broth: 5,
  egg: 155,
  carrot: 41,
  bacon: 417,
  'creme fraiche': 300,
  parmesan: 431,
  pilchards: 208,
  spaghetti: 158,
  'tomato puree': 82,
};

// Bump this when calorie estimation logic changes to invalidate old cached values
const CALC_VERSION = 4;

// Approximate macros per 100g for common items (very rough; for scoring only)
const MACROS_100G = {
  chicken: { protein: 27, fat: 3.6, sugar: 0, fiber: 0 },
  beef: { protein: 26, fat: 15, sugar: 0, fiber: 0 },
  pork: { protein: 25, fat: 21, sugar: 0, fiber: 0 },
  rice: { protein: 2.7, fat: 0.3, sugar: 0.1, fiber: 1.3 },
  onion: { protein: 1.1, fat: 0.1, sugar: 4.2, fiber: 1.7 },
  tomato: { protein: 0.9, fat: 0.2, sugar: 2.6, fiber: 1.2 },
  garlic: { protein: 6.4, fat: 0.5, sugar: 1, fiber: 2.1 },
  ginger: { protein: 1.8, fat: 0.8, sugar: 1.7, fiber: 2 },
  milk: { protein: 3.4, fat: 3.3, sugar: 5, fiber: 0 },
  cream: { protein: 2, fat: 35, sugar: 3.2, fiber: 0 },
  butter: { protein: 0.9, fat: 81, sugar: 0.1, fiber: 0 },
  oil: { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  'olive oil': { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  olive: { protein: 0.8, fat: 10.7, sugar: 0, fiber: 3.2 },
  olives: { protein: 0.8, fat: 10.7, sugar: 0, fiber: 3.2 },
  breadcrumbs: { protein: 13, fat: 5, sugar: 5, fiber: 4 },
  honey: { protein: 0.3, fat: 0, sugar: 82, fiber: 0.2 },
  'soy sauce': { protein: 10, fat: 0.1, sugar: 1.6, fiber: 0.8 },
  sugar: { protein: 0, fat: 0, sugar: 100, fiber: 0 },
  flour: { protein: 10, fat: 1, sugar: 1, fiber: 3.4 },
  cheese: { protein: 25, fat: 33, sugar: 3, fiber: 0 },
  yogurt: { protein: 10, fat: 0.4, sugar: 3.6, fiber: 0 },
  mushroom: { protein: 3.1, fat: 0.3, sugar: 2, fiber: 1 },
  parsley: { protein: 3, fat: 0.8, sugar: 0.9, fiber: 3.3 },
  passata: { protein: 1.6, fat: 0.2, sugar: 4, fiber: 1.3 },
  'curry powder': { protein: 14, fat: 14, sugar: 2, fiber: 33 },
  'garam masala': { protein: 14, fat: 14, sugar: 2, fiber: 33 },
  paprika: { protein: 14, fat: 13, sugar: 10, fiber: 35 },
  turmeric: { protein: 8, fat: 10, sugar: 3.2, fiber: 23 },
  cumin: { protein: 18, fat: 22, sugar: 2.3, fiber: 10.5 },
  chilli: { protein: 2, fat: 0.4, sugar: 5, fiber: 1.5 },
  'potato starch': { protein: 0.3, fat: 0.1, sugar: 0.3, fiber: 0.5 },
  lemon: { protein: 1.1, fat: 0.3, sugar: 2.5, fiber: 2.8 },
  stock: { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  broth: { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  egg: { protein: 13, fat: 11, sugar: 0.4, fiber: 0 },
  carrot: { protein: 0.9, fat: 0.2, sugar: 4.7, fiber: 2.8 },
  bacon: { protein: 37, fat: 42, sugar: 1.4, fiber: 0 },
  'creme fraiche': { protein: 2.5, fat: 30, sugar: 3.6, fiber: 0 },
  parmesan: { protein: 35, fat: 25, sugar: 0.9, fiber: 0 },
  pilchards: { protein: 24, fat: 10, sugar: 0, fiber: 0 },
  spaghetti: { protein: 5.8, fat: 0.9, sugar: 1.1, fiber: 2.7 },
  'tomato puree': { protein: 5, fat: 1, sugar: 12, fiber: 18 }
};

function parseIngredientEntries(ings) {
  const oilEntries = [];
  const otherEntries = [];

  for (const ing of ings || []) {
    const original = (ing.original || '').toLowerCase();
    let grams = 0;

    const gramsMatch = original.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/i);
    if (gramsMatch) {
      grams = parseFloat(gramsMatch[1]);
    } else {
      const cup = original.match(/(\d+(?:\.\d+)?)\s*cups?/);
      if (cup) grams = parseFloat(cup[1]) * 240;
      else {
        const tbsp = original.match(/(\d+(?:\.\d+)?)\s*(tbsp|tbs|tbls|tablespoons?)/);
        if (tbsp) grams = parseFloat(tbsp[1]) * 14;
        else {
          const tsp = original.match(/(\d+(?:\.\d+)?)\s*(tsp|teaspoons?)/);
          if (tsp) grams = parseFloat(tsp[1]) * 5;
          else {
            const ml = original.match(/(\d+(?:\.\d+)?)\s*(?:mls?|milliliters?)/);
            if (ml) {
              const mlVal = parseFloat(ml[1]);
              let dens = 1.0;
              if (/oil|olive/.test(original)) dens = 0.91;
              else if (/milk|cream/.test(original)) dens = 1.03;
              else if (/honey/.test(original)) dens = 1.42;
              else if (/lemon/.test(original)) dens = 1.03;
              else if (/soy sauce/.test(original)) dens = 1.16;
              grams = mlVal * dens;
            } else {
              const oz = original.match(/(\d+(?:\.\d+)?)\s*(oz|ounces?)/);
              if (oz) grams = parseFloat(oz[1]) * 28.35;
              else {
                const lb = original.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pounds?)/);
                if (lb) grams = parseFloat(lb[1]) * 453.59;
              }
            }
          }
        }
      }
    }

    let name = (ing.name || '').toLowerCase();
    name = name
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|whole|large|small|medium|extra|extra\s+large/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    let originalClean = original
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|whole|large|small|medium|extra|extra\s+large/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    name = name
      .replace(/mushrooms/gi, 'mushroom')
      .replace(/potatoes/gi, 'potato')
      .replace(/onions/gi, 'onion')
      .replace(/carrots/gi, 'carrot')
      .replace(/eggs/gi, 'egg')
      .replace(/breasts/gi, 'chicken')
      .replace(/bacon/gi, 'bacon')
      .replace(/spinach/gi, 'spinach')
      .replace(/peas/gi, 'peas')
      .replace(/olive\s+oil/gi, 'olive oil')
      .replace(/creme\s+fraiche/gi, 'creme fraiche')
      .replace(/parmesan/gi, 'parmesan');
    originalClean = originalClean
      .replace(/mushrooms/gi, 'mushroom')
      .replace(/potatoes/gi, 'potato')
      .replace(/onions/gi, 'onion')
      .replace(/carrots/gi, 'carrot')
      .replace(/eggs/gi, 'egg')
      .replace(/breasts/gi, 'chicken')
      .replace(/bacon/gi, 'bacon')
      .replace(/spinach/gi, 'spinach')
      .replace(/peas/gi, 'peas')
      .replace(/olive\s+oil/gi, 'olive oil')
      .replace(/creme\s+fraiche/gi, 'creme fraiche')
      .replace(/parmesan/gi, 'parmesan');

    let base = Object.keys(KCAL_100G).find(
      (k) => new RegExp(`\\b${k}\\b`).test(name) || new RegExp(`\\b${k}\\b`).test(originalClean)
    );
    if (/\b(stock|broth|bouillon)\b/.test(originalClean)) {
      base = 'stock';
    }

    const entry = { grams, base, original };
    if (base === 'oil' || base === 'olive oil') oilEntries.push(entry);
    else otherEntries.push(entry);
  }

  return { oilEntries, otherEntries };
}

function estimateMacrosFromIngredients(ings, mealId, fryMentioned = false) {
  const { oilEntries, otherEntries } = parseIngredientEntries(ings);

  // Apply absorption only to largest oil entry if frying (similar to calories logic)
  const adjustedOilEntries = oilEntries.map((e) => ({ ...e }));
  if (adjustedOilEntries.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < adjustedOilEntries.length; i++) {
      if (adjustedOilEntries[i].grams > adjustedOilEntries[maxIdx].grams) maxIdx = i;
    }
    adjustedOilEntries.forEach((entry, idx) => {
      if (idx === maxIdx && fryMentioned && entry.grams > 0) {
        if (/deep/.test(entry.original)) entry.grams = Math.round(entry.grams * 0.3);
        else if (/shallow/.test(entry.original)) entry.grams = Math.round(entry.grams * 0.15);
        else entry.grams = Math.round(entry.grams * 0.2);
      }
    });
  }

  const totals = { protein: 0, fat: 0, sugar: 0, fiber: 0 };

  function addFromEntry(entry) {
    const base = entry.base;
    const grams = entry.grams || 0;
    const m = MACROS_100G[base];
    if (!m || grams <= 0) return;
    totals.protein += (m.protein * grams) / 100;
    totals.fat += (m.fat * grams) / 100;
    totals.sugar += (m.sugar * grams) / 100;
    totals.fiber += (m.fiber * grams) / 100;
  }

  adjustedOilEntries.forEach(addFromEntry);
  otherEntries.forEach(addFromEntry);

  // Round to whole grams for presentation
  return {
    protein: Math.round(totals.protein),
    fat: Math.round(totals.fat),
    sugar: Math.round(totals.sugar),
    fiber: Math.round(totals.fiber),
  };
}

function estimateCaloriesFromIngredients(ings, mealId, fryMentioned = false) {
  // Check cache first (supports old number or new {v, calories})
  const cached = storageService.getMealDbCalories(mealId);
  if (cached && typeof cached === 'object' && cached.v === CALC_VERSION && typeof cached.calories === 'number') {
    return cached.calories;
  }

  let total = 0;
  const oilEntries = [];
  const otherEntries = [];

  for (const ing of ings || []) {
    const original = (ing.original || '').toLowerCase();
    let grams = 0;

    const gramsMatch = original.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/i);
    if (gramsMatch) {
      grams = parseFloat(gramsMatch[1]);
    } else {
      const cup = original.match(/(\d+(?:\.\d+)?)\s*cups?/);
      if (cup) grams = parseFloat(cup[1]) * 240;
      else {
        const tbsp = original.match(/(\d+(?:\.\d+)?)\s*(tbsp|tbs|tbls|tablespoons?)/);
        if (tbsp) grams = parseFloat(tbsp[1]) * 14;
        else {
          const tsp = original.match(/(\d+(?:\.\d+)?)\s*(tsp|teaspoons?)/);
          if (tsp) grams = parseFloat(tsp[1]) * 5;
          else {
            const ml = original.match(/(\d+(?:\.\d+)?)\s*(?:mls?|milliliters?)/);
            if (ml) {
              const mlVal = parseFloat(ml[1]);
              let dens = 1.0;
              if (/oil|olive/.test(original)) dens = 0.91;
              else if (/milk|cream/.test(original)) dens = 1.03;
              else if (/honey/.test(original)) dens = 1.42;
              else if (/lemon/.test(original)) dens = 1.03;
              else if (/soy sauce/.test(original)) dens = 1.16;
              grams = mlVal * dens;
            } else {
              const oz = original.match(/(\d+(?:\.\d+)?)\s*(oz|ounces?)/);
              if (oz) grams = parseFloat(oz[1]) * 28.35;
              else {
                const lb = original.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pounds?)/);
                if (lb) grams = parseFloat(lb[1]) * 453.59;
              }
            }
          }
        }
      }
    }

    let name = (ing.name || '').toLowerCase();
    name = name
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|whole|large|small|medium|extra|extra\s+large/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    let originalClean = original
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|whole|large|small|medium|extra|extra\s+large/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Singularize common plurals and normalize variants (case-insensitive)
    name = name
      .replace(/mushrooms/gi, 'mushroom')
      .replace(/potatoes/gi, 'potato')
      .replace(/onions/gi, 'onion')
      .replace(/carrots/gi, 'carrot')
      .replace(/eggs/gi, 'egg')
      .replace(/breasts/gi, 'chicken')
      .replace(/bacon/gi, 'bacon')
      .replace(/spinach/gi, 'spinach')
      .replace(/peas/gi, 'peas')
      .replace(/olive\s+oil/gi, 'olive oil')
      .replace(/creme\s+fraiche/gi, 'creme fraiche')
      .replace(/parmesan/gi, 'parmesan');
    originalClean = originalClean
      .replace(/mushrooms/gi, 'mushroom')
      .replace(/potatoes/gi, 'potato')
      .replace(/onions/gi, 'onion')
      .replace(/carrots/gi, 'carrot')
      .replace(/eggs/gi, 'egg')
      .replace(/breasts/gi, 'chicken')
      .replace(/bacon/gi, 'bacon')
      .replace(/spinach/gi, 'spinach')
      .replace(/peas/gi, 'peas')
      .replace(/olive\s+oil/gi, 'olive oil')
      .replace(/creme\s+fraiche/gi, 'creme fraiche')
      .replace(/parmesan/gi, 'parmesan');

    let base = Object.keys(KCAL_100G).find(
      (k) => new RegExp(`\\b${k}\\b`).test(name) || new RegExp(`\\b${k}\\b`).test(originalClean)
    );
    if (/\b(stock|broth|bouillon)\b/.test(originalClean)) {
      base = 'stock';
    }
    if (base === 'oil' || base === 'olive oil') {
      oilEntries.push({ grams, base, original });
    } else {
      otherEntries.push({ grams, base, original });
    }
  }

  // Apply absorption only to largest oil entry if frying
  if (oilEntries.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < oilEntries.length; i++) {
      if (oilEntries[i].grams > oilEntries[maxIdx].grams) maxIdx = i;
    }
    oilEntries.forEach((entry, idx) => {
      let useGrams = entry.grams;
      if (idx === maxIdx && fryMentioned && useGrams > 0) {
        if (/deep/.test(entry.original)) useGrams = Math.round(useGrams * 0.3);
        else if (/shallow/.test(entry.original)) useGrams = Math.round(useGrams * 0.15);
        else useGrams = Math.round(useGrams * 0.2);
      }
      total += useGrams * (KCAL_100G[entry.base] / 100);
    });
  }

  // Add other ingredients
  for (const entry of otherEntries) {
    let useGrams = entry.grams;
    if (entry.base) {
      if (useGrams === 0) {
        if (entry.base === 'garlic' && /clove/.test(entry.original)) useGrams = 5;
        else if (entry.base === 'ginger' && /(tbsp|tablespoon|piece)/.test(entry.original)) useGrams = 10;
        else if (entry.base === 'sugar' && /(tsp|teaspoon)/.test(entry.original)) useGrams = 5;
        else if (entry.base === 'spaghetti') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(spaghetti)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1]));
          else useGrams = 75;
        } else if (entry.base === 'pilchards') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(pilchards?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1]));
          else useGrams = 100;
        } else if (entry.base === 'tomato puree') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(tbsp|tablespoon)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1])) * 15;
          else if (/tomato puree/.test(entry.original)) useGrams = 50;
        } else if (entry.base === 'olives') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(olives?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1]));
          else useGrams = 10;
        } else if (entry.base === 'parmesan') {
          if (/shaved|scattered/.test(entry.original)) useGrams = 10;
        } else if (entry.base === 'onion') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(onions?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1])) * 110;
          else if (/finely|chopped|minced/.test(entry.original)) useGrams = 55;
        } else if (entry.base === 'carrot') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(carrots?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1])) * 60;
        } else if (entry.base === 'egg') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(eggs?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1])) * 50;
          else if (/\begg\b/.test(entry.original)) useGrams = 50;
        } else if (/(curry powder|garam masala|paprika|turmeric|cumin|chilli)/.test(entry.base)) {
          if (/(tbsp|tablespoon)/.test(entry.original)) useGrams = 7.5;
          else if (/(tsp|teaspoon)/.test(entry.original)) useGrams = 2.5;
        } else if (entry.base === 'creme fraiche' && /pot/.test(entry.original)) {
          useGrams = 200;
        } else if (/topping/.test(entry.original)) {
          if (entry.base === 'parmesan') useGrams = 20;
          else if (entry.base === 'spinach' || entry.base === 'peas') useGrams = 40;
        } else if (entry.base === 'bacon') {
          const m = entry.original.match(/(\d+(?:\.\d+)?)\s*(bacon|slices?)/);
          if (m) useGrams = Math.max(1, parseFloat(m[1])) * 20;
          else if (/bacon/.test(entry.original)) useGrams = 20;
        } else if (entry.base === 'chicken') {
          let countMatch = entry.original.match(/(\d+(?:\.\d+)?)\s*(breasts?|thighs?|legs?)/);
          if (!countMatch) {
            countMatch = entry.original.match(/(\d+(?:\.\d+)?)\s*[a-z\s,.(){:-]{0,40}\b(breasts?|thighs?|legs?)\b/);
          }
          if (countMatch) {
            const count = Math.max(1, parseFloat(countMatch[1]));
            const part = countMatch[2];
            if (/breast/.test(part)) useGrams = count * 150;
            else if (/thigh/.test(part)) useGrams = count * 100;
            else if (/leg/.test(part)) useGrams = count * 100;
          }
        }
      }

      // Final generic fallback for known items with no quantity
      if (useGrams === 0 && KCAL_100G[entry.base]) {
        useGrams = 30;
      }

      if (useGrams > 0) {
        total += useGrams * (KCAL_100G[entry.base] / 100);
      }
    }
  }

  total = Math.round(total);
  storageService.setMealDbCalories(mealId, { v: CALC_VERSION, calories: total });
  return total;
}

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function mapMealToRecipePartial(meal) {
  return {
    id: Number(meal.idMeal),
    title: meal.strMeal,
    image: meal.strMealThumb,
    cuisines: meal.strArea ? [meal.strArea] : [],
    diets: meal.strCategory ? [meal.strCategory] : [],
    // TheMealDB doesn't provide readyInMinutes/likes/scores/nutrition in list
    readyInMinutes: undefined,
    aggregateLikes: 0,
    spoonacularScore: null,
    healthScore: null,
    source: 'mealdb',
  };
}

function buildIngredients(meal) {
  const ings = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      const original = [measure, name].filter(Boolean).join(' ').trim();
      ings.push({ id: i, name: name.trim(), amount: undefined, unit: undefined, original });
    }
  }
  return ings;
}

function mapMealToRecipeFull(meal) {
  const steps = (meal.strInstructions || '')
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((step, idx) => ({ number: idx + 1, step }));

  // Estimate cooking time from instructions
  const instructionsText = steps.map((s) => s.step).join(' ');
  const estimatedTime = estimateCookingTimeFromInstructions(instructionsText);

  // Check if instructions mention frying
  const fryMentioned = /fry|frying|fried/.test(instructionsText);
  const ingredientsList = buildIngredients(meal);
  const caloriesApprox = estimateCaloriesFromIngredients(ingredientsList, Number(meal.idMeal), fryMentioned);

  // Compute macro estimates for scoring
  const macros = estimateMacrosFromIngredients(ingredientsList, Number(meal.idMeal), fryMentioned);

  // Health score calculation
  const baseScore = 50;
  const servings = 2; // default fallback when unknown
  const perServCalories = typeof caloriesApprox === 'number' ? Math.round(caloriesApprox / servings) : undefined;
  const perServFat = Math.round(macros.fat / servings) || 0;
  const perServSugar = Math.round(macros.sugar / servings) || 0;
  const perServProtein = Math.round(macros.protein / servings) || 0;
  const perServFiber = Math.round(macros.fiber / servings) || 0;

  let caloriesScore = 0;
  if (typeof perServCalories === 'number') {
    if (perServCalories >= 300 && perServCalories <= 600) caloriesScore = 10;
    else if (perServCalories < 200 || perServCalories > 800) caloriesScore = -10;
  }

  let fatScore = 0;
  if (perServFat > 0) {
    if (perServFat < 20) fatScore = 10;
    else if (perServFat > 30) fatScore = -10;
  }

  let sugarScore = 0;
  if (perServSugar > 0) {
    if (perServSugar < 10) sugarScore = 10;
    else if (perServSugar > 25) sugarScore = -10;
  }

  const proteinScore = perServProtein > 10 ? 10 : 0;
  const fiberScore = perServFiber > 5 ? 5 : 0;

  // Micronutrient heuristic: presence of produce/legumes/herbs
  const microBoostItems = [
    'spinach','broccoli','kale','tomato','bell pepper','pepper','peas','lentils','beans','chickpeas','carrot','mushroom','yogurt','almond','walnut','avocado','banana','orange','lemon','parsley'
  ];
  const ingText = ingredientsList.map(i => `${i.original}`.toLowerCase()).join(' ');
  let micronScore = 0;
  for (const item of microBoostItems) {
    if (new RegExp(`\\b${item.replace(/\s+/g, '\\s+')}\\b`, 'i').test(ingText)) {
      micronScore += 2; // up to +10
      if (micronScore >= 10) break;
    }
  }

  // Cooking method keywords
  const instructionsLower = instructionsText.toLowerCase();
  const unhealthyWords = ['deep fry','deep-fry','fried','fry','crispy','butter','oil'];
  const healthyWords = ['steam','boil','grill','bake','poach','roast'];
  const countOccurrences = (text, word) => {
    const pattern = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  };
  let cookingScoreRaw = 0;
  for (const w of unhealthyWords) cookingScoreRaw -= 5 * countOccurrences(instructionsLower, w);
  for (const w of healthyWords) cookingScoreRaw += 5 * countOccurrences(instructionsLower, w);
  const cookingScore = Math.max(-25, Math.min(25, cookingScoreRaw));

  let healthScore = baseScore + caloriesScore + fatScore + sugarScore + proteinScore + fiberScore + micronScore + cookingScore;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  return {
    ...mapMealToRecipePartial(meal),
    summary: (meal.strInstructions || '').split('\n').slice(0, 3).join('\n'),
    extendedIngredients: buildIngredients(meal),
    analyzedInstructions: steps.length ? [{ name: '', steps }] : [],
    servings: undefined,
    readyInMinutes: estimatedTime,
    nutrition: typeof caloriesApprox === 'number' ? { calories: caloriesApprox, fat: perServFat, sugar: perServSugar, protein: perServProtein, fiber: perServFiber } : undefined,
    sourceUrl: meal.strSource || undefined,
    youtubeUrl: meal.strYoutube || undefined,
    healthScore,
  };
}

export async function searchMeals(query, filters = {}) {
  let url;
  if (query && query.trim()) {
    url = `${API_BASE}/search.php?s=${encodeURIComponent(query.trim())}`;
  } else if (filters.cuisine && filters.cuisine !== 'all') {
    // Map cuisine to area filter
    url = `${API_BASE}/filter.php?a=${encodeURIComponent(filters.cuisine)}`;
  } else if (filters.diet && filters.diet !== 'all') {
    // Roughly map diet to category filter
    url = `${API_BASE}/filter.php?c=${encodeURIComponent(filters.diet)}`;
  } else {
    // Fallback: random selection of meals (use search with empty returns null, so use a default)
    url = `${API_BASE}/search.php?s=chicken`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch meals');
  const data = await res.json();
  const meals = data.meals || [];
  // If using search endpoint, we get full meal objects with instructions
  if (query && query.trim()) {
    return { results: meals.map(mapMealToRecipeFull) };
  }
  // When using filter endpoints, we only have id/name/thumb; map partials
  return { results: meals.map(mapMealToRecipePartial) };
}

export async function getMealDetails(id, fallbackPartial = null) {
  const url = `${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch meal details');
    const data = await res.json();
    const meal = data.meals && data.meals[0];
    if (!meal) throw new Error('Meal not found');
    return mapMealToRecipeFull(meal);
  } catch {
    // Fallback: use partial if provided
    if (fallbackPartial && typeof fallbackPartial === 'object') {
      return {
        ...fallbackPartial,
        summary: 'Sorry, no details available for this recipe.',
        extendedIngredients: [],
        analyzedInstructions: [],
      };
    }
    // Otherwise, minimal info
    return {
      id: Number(id),
      title: 'Recipe Not Found',
      image: '',
      cuisines: [],
      diets: [],
      readyInMinutes: undefined,
      aggregateLikes: 0,
      spoonacularScore: null,
      healthScore: null,
      source: 'mealdb',
      summary: 'Sorry, no details available for this recipe.',
      extendedIngredients: [],
      analyzedInstructions: [],
      servings: undefined,
      sourceUrl: undefined,
      youtubeUrl: undefined,
    };
  }
}

export default { searchMeals, getMealDetails };
