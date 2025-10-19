// src/services/theMealDbService.js
// Lightweight client for TheMealDB (no key required)
import { estimateCookingTimeFromInstructions } from '../utils/helpers.js';
import storageService from './storageService.js';

// Enhanced per-100g kcal estimates (USDA-based where available)
const KCAL_100G = {
  // Proteins
  chicken: 165,
  beef: 250,
  pork: 242,
  bacon: 417,
  egg: 155,
  pilchards: 208,
  salmon: 206,
  tuna: 132,
  shrimp: 99,
  prawns: 99,
  cod: 82,
  turkey: 135,
  lamb: 294,
  duck: 337,
  sausage: 301,
  ham: 145,
  
  // Carbs & Grains
  rice: 130,
  pasta: 158,
  spaghetti: 158,
  noodles: 138,
  bread: 265,
  breadcrumbs: 395,
  flour: 364,
  oats: 389,
  quinoa: 120,
  couscous: 112,
  potato: 77,
  'sweet potato': 86,
  'potato starch': 330,
  
  // Vegetables
  onion: 40,
  tomato: 18,
  carrot: 41,
  mushroom: 22,
  broccoli: 34,
  spinach: 23,
  peas: 81,
  'bell pepper': 20,
  pepper: 20,
  cucumber: 15,
  lettuce: 15,
  celery: 16,
  zucchini: 17,
  eggplant: 25,
  cabbage: 25,
  cauliflower: 25,
  asparagus: 20,
  kale: 49,
  'green beans': 31,
  corn: 86,
  passata: 18,
  'tomato puree': 82,
  
  // Fruits
  apple: 52,
  banana: 89,
  orange: 47,
  lemon: 29,
  lime: 30,
  strawberry: 32,
  blueberry: 57,
  avocado: 160,
  mango: 60,
  pineapple: 50,
  
  // Dairy
  milk: 61,
  cream: 340,
  'heavy cream': 340,
  'sour cream': 193,
  butter: 717,
  cheese: 402,
  'cheddar cheese': 403,
  'mozzarella': 280,
  parmesan: 431,
  'cream cheese': 342,
  yogurt: 59,
  'greek yogurt': 97,
  'creme fraiche': 300,
  
  // Oils & Fats
  oil: 884,
  'olive oil': 884,
  'vegetable oil': 884,
  'coconut oil': 862,
  'sesame oil': 884,
  olive: 115,
  olives: 115,
  
  // Nuts & Seeds
  almond: 579,
  almonds: 579,
  walnut: 654,
  walnuts: 654,
  peanut: 567,
  peanuts: 567,
  cashew: 553,
  cashews: 553,
  'sesame seeds': 573,
  'sunflower seeds': 584,
  'chia seeds': 486,
  
  // Condiments & Spices
  'soy sauce': 53,
  'fish sauce': 35,
  ketchup: 112,
  mustard: 66,
  mayonnaise: 680,
  vinegar: 21,
  'balsamic vinegar': 88,
  salt: 0,
  'curry powder': 325,
  'garam masala': 340,
  paprika: 282,
  turmeric: 354,
  cumin: 375,
  chilli: 318,
  'chili powder': 318,
  cinnamon: 247,
  'black pepper': 251,
  basil: 23,
  oregano: 265,
  thyme: 101,
  rosemary: 131,
  parsley: 36,
  cilantro: 23,
  coriander: 23,
  mint: 44,
  
  // Sweeteners
  sugar: 387,
  'brown sugar': 380,
  honey: 304,
  'maple syrup': 260,
  
  // Aromatics & Others
  garlic: 149,
  ginger: 80,
  stock: 5,
  broth: 5,
  'chicken stock': 5,
  'beef stock': 5,
  'vegetable stock': 5,
  wine: 85,
  'red wine': 85,
  'white wine': 82,
  beer: 43,
  'coconut milk': 230,
  'soy milk': 54,
  'almond milk': 17,
  tofu: 76,
  beans: 127,
  'black beans': 132,
  'kidney beans': 127,
  chickpeas: 164,
  lentils: 116,
};

// Bump this when calorie estimation logic changes to invalidate old cached values
const CALC_VERSION = 5;

// Enhanced macro data per 100g (USDA-based where available)
const MACROS_100G = {
  // Proteins
  chicken: { protein: 27, fat: 3.6, sugar: 0, fiber: 0 },
  beef: { protein: 26, fat: 15, sugar: 0, fiber: 0 },
  pork: { protein: 25, fat: 21, sugar: 0, fiber: 0 },
  bacon: { protein: 37, fat: 42, sugar: 1.4, fiber: 0 },
  egg: { protein: 13, fat: 11, sugar: 0.4, fiber: 0 },
  pilchards: { protein: 24, fat: 10, sugar: 0, fiber: 0 },
  salmon: { protein: 20, fat: 13, sugar: 0, fiber: 0 },
  tuna: { protein: 23, fat: 1, sugar: 0, fiber: 0 },
  shrimp: { protein: 24, fat: 0.3, sugar: 0, fiber: 0 },
  prawns: { protein: 24, fat: 0.3, sugar: 0, fiber: 0 },
  cod: { protein: 18, fat: 0.7, sugar: 0, fiber: 0 },
  turkey: { protein: 29, fat: 1, sugar: 0, fiber: 0 },
  lamb: { protein: 25, fat: 21, sugar: 0, fiber: 0 },
  duck: { protein: 19, fat: 28, sugar: 0, fiber: 0 },
  sausage: { protein: 13, fat: 28, sugar: 1, fiber: 0 },
  ham: { protein: 22, fat: 3.5, sugar: 1.5, fiber: 0 },
  
  // Carbs & Grains
  rice: { protein: 2.7, fat: 0.3, sugar: 0.1, fiber: 1.3 },
  pasta: { protein: 5.8, fat: 0.9, sugar: 1.1, fiber: 2.7 },
  spaghetti: { protein: 5.8, fat: 0.9, sugar: 1.1, fiber: 2.7 },
  noodles: { protein: 4.7, fat: 0.5, sugar: 0.4, fiber: 1.8 },
  bread: { protein: 9, fat: 3.2, sugar: 5, fiber: 2.7 },
  breadcrumbs: { protein: 13, fat: 5, sugar: 5, fiber: 4 },
  flour: { protein: 10, fat: 1, sugar: 1, fiber: 3.4 },
  oats: { protein: 17, fat: 7, sugar: 1, fiber: 11 },
  quinoa: { protein: 4.4, fat: 1.9, sugar: 0.9, fiber: 2.8 },
  couscous: { protein: 3.8, fat: 0.2, sugar: 0.1, fiber: 1.4 },
  potato: { protein: 2, fat: 0.1, sugar: 0.8, fiber: 2.2 },
  'sweet potato': { protein: 1.6, fat: 0.1, sugar: 4.2, fiber: 3 },
  'potato starch': { protein: 0.3, fat: 0.1, sugar: 0.3, fiber: 0.5 },
  
  // Vegetables
  onion: { protein: 1.1, fat: 0.1, sugar: 4.2, fiber: 1.7 },
  tomato: { protein: 0.9, fat: 0.2, sugar: 2.6, fiber: 1.2 },
  carrot: { protein: 0.9, fat: 0.2, sugar: 4.7, fiber: 2.8 },
  mushroom: { protein: 3.1, fat: 0.3, sugar: 2, fiber: 1 },
  broccoli: { protein: 2.8, fat: 0.4, sugar: 1.7, fiber: 2.6 },
  spinach: { protein: 2.9, fat: 0.4, sugar: 0.4, fiber: 2.2 },
  peas: { protein: 5.4, fat: 0.4, sugar: 5.7, fiber: 5.7 },
  'bell pepper': { protein: 1, fat: 0.3, sugar: 4.2, fiber: 2.1 },
  pepper: { protein: 1, fat: 0.3, sugar: 4.2, fiber: 2.1 },
  cucumber: { protein: 0.7, fat: 0.1, sugar: 1.7, fiber: 0.5 },
  lettuce: { protein: 1.4, fat: 0.2, sugar: 0.8, fiber: 1.3 },
  celery: { protein: 0.7, fat: 0.2, sugar: 1.3, fiber: 1.6 },
  zucchini: { protein: 1.2, fat: 0.3, sugar: 2.5, fiber: 1 },
  eggplant: { protein: 1, fat: 0.2, sugar: 3.5, fiber: 3 },
  cabbage: { protein: 1.3, fat: 0.1, sugar: 3.2, fiber: 2.5 },
  cauliflower: { protein: 1.9, fat: 0.3, sugar: 1.9, fiber: 2 },
  asparagus: { protein: 2.2, fat: 0.1, sugar: 1.9, fiber: 2.1 },
  kale: { protein: 4.3, fat: 0.9, sugar: 2.3, fiber: 3.6 },
  'green beans': { protein: 1.8, fat: 0.2, sugar: 3.3, fiber: 2.7 },
  corn: { protein: 3.4, fat: 1.5, sugar: 6.3, fiber: 2 },
  passata: { protein: 1.6, fat: 0.2, sugar: 4, fiber: 1.3 },
  'tomato puree': { protein: 5, fat: 1, sugar: 12, fiber: 18 },
  
  // Fruits
  apple: { protein: 0.3, fat: 0.2, sugar: 10.4, fiber: 2.4 },
  banana: { protein: 1.1, fat: 0.3, sugar: 12.2, fiber: 2.6 },
  orange: { protein: 0.9, fat: 0.1, sugar: 9.4, fiber: 2.4 },
  lemon: { protein: 1.1, fat: 0.3, sugar: 2.5, fiber: 2.8 },
  lime: { protein: 0.7, fat: 0.2, sugar: 1.7, fiber: 2.8 },
  strawberry: { protein: 0.7, fat: 0.3, sugar: 4.9, fiber: 2 },
  blueberry: { protein: 0.7, fat: 0.3, sugar: 10, fiber: 2.4 },
  avocado: { protein: 2, fat: 15, sugar: 0.7, fiber: 6.7 },
  mango: { protein: 0.8, fat: 0.4, sugar: 13.7, fiber: 1.6 },
  pineapple: { protein: 0.5, fat: 0.1, sugar: 9.9, fiber: 1.4 },
  
  // Dairy
  milk: { protein: 3.4, fat: 3.3, sugar: 5, fiber: 0 },
  cream: { protein: 2, fat: 35, sugar: 3.2, fiber: 0 },
  'heavy cream': { protein: 2, fat: 35, sugar: 3.2, fiber: 0 },
  'sour cream': { protein: 2.4, fat: 19, sugar: 2.7, fiber: 0 },
  butter: { protein: 0.9, fat: 81, sugar: 0.1, fiber: 0 },
  cheese: { protein: 25, fat: 33, sugar: 3, fiber: 0 },
  'cheddar cheese': { protein: 25, fat: 33, sugar: 1.3, fiber: 0 },
  'mozzarella': { protein: 22, fat: 22, sugar: 2.2, fiber: 0 },
  parmesan: { protein: 35, fat: 25, sugar: 0.9, fiber: 0 },
  'cream cheese': { protein: 6, fat: 34, sugar: 4, fiber: 0 },
  yogurt: { protein: 10, fat: 0.4, sugar: 3.6, fiber: 0 },
  'greek yogurt': { protein: 9, fat: 5, sugar: 3.6, fiber: 0 },
  'creme fraiche': { protein: 2.5, fat: 30, sugar: 3.6, fiber: 0 },
  
  // Oils & Fats
  oil: { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  'olive oil': { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  'vegetable oil': { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  'coconut oil': { protein: 0, fat: 99, sugar: 0, fiber: 0 },
  'sesame oil': { protein: 0, fat: 100, sugar: 0, fiber: 0 },
  olive: { protein: 0.8, fat: 10.7, sugar: 0, fiber: 3.2 },
  olives: { protein: 0.8, fat: 10.7, sugar: 0, fiber: 3.2 },
  
  // Nuts & Seeds
  almond: { protein: 21, fat: 50, sugar: 4, fiber: 12 },
  almonds: { protein: 21, fat: 50, sugar: 4, fiber: 12 },
  walnut: { protein: 15, fat: 65, sugar: 2.6, fiber: 6.7 },
  walnuts: { protein: 15, fat: 65, sugar: 2.6, fiber: 6.7 },
  peanut: { protein: 26, fat: 49, sugar: 4, fiber: 8.5 },
  peanuts: { protein: 26, fat: 49, sugar: 4, fiber: 8.5 },
  cashew: { protein: 18, fat: 44, sugar: 6, fiber: 3.3 },
  cashews: { protein: 18, fat: 44, sugar: 6, fiber: 3.3 },
  'sesame seeds': { protein: 18, fat: 50, sugar: 0.3, fiber: 12 },
  'sunflower seeds': { protein: 21, fat: 51, sugar: 2.6, fiber: 9 },
  'chia seeds': { protein: 17, fat: 31, sugar: 0, fiber: 34 },
  
  // Condiments & Spices
  'soy sauce': { protein: 10, fat: 0.1, sugar: 1.6, fiber: 0.8 },
  'fish sauce': { protein: 5, fat: 0, sugar: 1, fiber: 0 },
  ketchup: { protein: 1.7, fat: 0.3, sugar: 22, fiber: 0.3 },
  mustard: { protein: 4.4, fat: 4, sugar: 3.3, fiber: 3.2 },
  mayonnaise: { protein: 1.4, fat: 75, sugar: 0.6, fiber: 0 },
  vinegar: { protein: 0, fat: 0, sugar: 0.4, fiber: 0 },
  'balsamic vinegar': { protein: 0.5, fat: 0, sugar: 17, fiber: 0 },
  salt: { protein: 0, fat: 0, sugar: 0, fiber: 0 },
  'curry powder': { protein: 14, fat: 14, sugar: 2, fiber: 33 },
  'garam masala': { protein: 14, fat: 14, sugar: 2, fiber: 33 },
  paprika: { protein: 14, fat: 13, sugar: 10, fiber: 35 },
  turmeric: { protein: 8, fat: 10, sugar: 3.2, fiber: 23 },
  cumin: { protein: 18, fat: 22, sugar: 2.3, fiber: 10.5 },
  chilli: { protein: 2, fat: 0.4, sugar: 5, fiber: 1.5 },
  'chili powder': { protein: 2, fat: 0.4, sugar: 5, fiber: 1.5 },
  cinnamon: { protein: 4, fat: 1.2, sugar: 2.2, fiber: 53 },
  'black pepper': { protein: 10, fat: 3.3, sugar: 0.6, fiber: 25 },
  basil: { protein: 3.2, fat: 0.6, sugar: 0.3, fiber: 1.6 },
  oregano: { protein: 9, fat: 4.3, sugar: 4, fiber: 43 },
  thyme: { protein: 5.6, fat: 1.7, sugar: 0, fiber: 14 },
  rosemary: { protein: 3.3, fat: 6, sugar: 0, fiber: 14 },
  parsley: { protein: 3, fat: 0.8, sugar: 0.9, fiber: 3.3 },
  cilantro: { protein: 2.1, fat: 0.5, sugar: 0.9, fiber: 2.8 },
  coriander: { protein: 2.1, fat: 0.5, sugar: 0.9, fiber: 2.8 },
  mint: { protein: 3.8, fat: 0.9, sugar: 0, fiber: 8 },
  
  // Sweeteners
  sugar: { protein: 0, fat: 0, sugar: 100, fiber: 0 },
  'brown sugar': { protein: 0, fat: 0, sugar: 97, fiber: 0 },
  honey: { protein: 0.3, fat: 0, sugar: 82, fiber: 0.2 },
  'maple syrup': { protein: 0, fat: 0.1, sugar: 67, fiber: 0 },
  
  // Aromatics & Others
  garlic: { protein: 6.4, fat: 0.5, sugar: 1, fiber: 2.1 },
  ginger: { protein: 1.8, fat: 0.8, sugar: 1.7, fiber: 2 },
  stock: { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  broth: { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  'chicken stock': { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  'beef stock': { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  'vegetable stock': { protein: 0.5, fat: 0.2, sugar: 0.2, fiber: 0 },
  wine: { protein: 0.1, fat: 0, sugar: 0.6, fiber: 0 },
  'red wine': { protein: 0.1, fat: 0, sugar: 0.6, fiber: 0 },
  'white wine': { protein: 0.1, fat: 0, sugar: 1.4, fiber: 0 },
  beer: { protein: 0.5, fat: 0, sugar: 0, fiber: 0 },
  'coconut milk': { protein: 2.3, fat: 24, sugar: 3.3, fiber: 2.2 },
  'soy milk': { protein: 3.3, fat: 1.8, sugar: 1, fiber: 0.6 },
  'almond milk': { protein: 0.4, fat: 1.1, sugar: 0, fiber: 0.2 },
  tofu: { protein: 8, fat: 4.8, sugar: 0.6, fiber: 0.3 },
  beans: { protein: 9, fat: 0.5, sugar: 1.2, fiber: 6.4 },
  'black beans': { protein: 9, fat: 0.5, sugar: 0.3, fiber: 7.5 },
  'kidney beans': { protein: 9, fat: 0.5, sugar: 1.2, fiber: 6.4 },
  chickpeas: { protein: 9, fat: 2.6, sugar: 2.9, fiber: 7.6 },
  lentils: { protein: 9, fat: 0.4, sugar: 1.8, fiber: 7.9 },
};

// Helper function to parse fractions and mixed numbers
function parseQuantity(str) {
  // Handle fractions: 1/2, 1/4, 3/4, etc.
  const fractionMatch = str.match(/(\d+)?\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseFloat(fractionMatch[1]) : 0;
    const numerator = whole > 0 ? 1 : parseFloat(fractionMatch[1] || '1');
    const denominator = parseFloat(fractionMatch[2]);
    return whole + (numerator / denominator);
  }
  
  // Handle ranges: take the average (e.g., "2-3 cups" = 2.5)
  const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  }
  
  // Handle mixed numbers: "1 1/2" = 1.5
  const mixedMatch = str.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const numerator = parseFloat(mixedMatch[2]);
    const denominator = parseFloat(mixedMatch[3]);
    return whole + (numerator / denominator);
  }
  
  // Regular decimal number
  const decimalMatch = str.match(/(\d+(?:\.\d+)?)/);
  return decimalMatch ? parseFloat(decimalMatch[1]) : 0;
}

function parseIngredientEntries(ings) {
  const oilEntries = [];
  const otherEntries = [];

  for (const ing of ings || []) {
    const original = (ing.original || '').toLowerCase();
    let grams = 0;

    // Handle "pinch", "dash", "handful" as tiny amounts
    if (/\b(pinch|dash)\b/.test(original)) {
      grams = 1; // Very small amount
    } else if (/\bhandful\b/.test(original)) {
      grams = 30; // Rough estimate for a handful
    } else {
      // Try to extract grams directly
      const gramsMatch = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(g|gram|grams)\b/i);
      if (gramsMatch) {
        grams = parseQuantity(gramsMatch[1]);
      } else {
        // Cups
        const cup = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*cups?/i);
        if (cup) {
          grams = parseQuantity(cup[1]) * 240;
        } else {
          // Tablespoons
          const tbsp = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(tbsp|tbs|tbls|tablespoons?)/i);
          if (tbsp) {
            grams = parseQuantity(tbsp[1]) * 14;
          } else {
            // Teaspoons
            const tsp = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(tsp|teaspoons?)/i);
            if (tsp) {
              grams = parseQuantity(tsp[1]) * 5;
            } else {
              // Milliliters
              const ml = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(?:mls?|milliliters?)/i);
              if (ml) {
                const mlVal = parseQuantity(ml[1]);
                let dens = 1.0;
                if (/oil|olive/.test(original)) dens = 0.91;
                else if (/milk|cream/.test(original)) dens = 1.03;
                else if (/honey/.test(original)) dens = 1.42;
                else if (/lemon/.test(original)) dens = 1.03;
                else if (/soy sauce/.test(original)) dens = 1.16;
                grams = mlVal * dens;
              } else {
                // Ounces
                const oz = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(oz|ounces?)/i);
                if (oz) {
                  grams = parseQuantity(oz[1]) * 28.35;
                } else {
                  // Pounds
                  const lb = original.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\d+\s+\d+\s*\/\s*\d+|\d+-\d+)\s*(lb|lbs|pounds?)/i);
                  if (lb) {
                    grams = parseQuantity(lb[1]) * 453.59;
                  }
                }
              }
            }
          }
        }
      }
    }

    let name = (ing.name || '').toLowerCase();
    name = name
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|fillets|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|chopped|whole|large|small|medium|extra|extra\s+large|peeled|unpeeled|deveined|trimmed|canned|frozen|dried/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    let originalClean = original
      .replace(/boneless|skin|skinless|breast|thigh|leg|legs|fillet|fillets|pieces|chunks|strips|meat|fresh|raw|cooked|ground|minced|sliced|diced|chopped|whole|large|small|medium|extra|extra\s+large|peeled|unpeeled|deveined|trimmed|canned|frozen|dried/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Enhanced pluralization and compound ingredient normalization
    const normalizations = [
      // Multi-word ingredients (must come first)
      [/olive\s+oil/gi, 'olive oil'],
      [/vegetable\s+oil/gi, 'vegetable oil'],
      [/coconut\s+oil/gi, 'coconut oil'],
      [/sesame\s+oil/gi, 'sesame oil'],
      [/creme\s+fraiche/gi, 'creme fraiche'],
      [/sour\s+cream/gi, 'sour cream'],
      [/heavy\s+cream/gi, 'heavy cream'],
      [/cream\s+cheese/gi, 'cream cheese'],
      [/cheddar\s+cheese/gi, 'cheddar cheese'],
      [/greek\s+yogurt/gi, 'greek yogurt'],
      [/sweet\s+potato(es)?/gi, 'sweet potato'],
      [/bell\s+pepper(s)?/gi, 'bell pepper'],
      [/green\s+beans?/gi, 'green beans'],
      [/black\s+beans?/gi, 'black beans'],
      [/kidney\s+beans?/gi, 'kidney beans'],
      [/soy\s+sauce/gi, 'soy sauce'],
      [/fish\s+sauce/gi, 'fish sauce'],
      [/tomato\s+puree/gi, 'tomato puree'],
      [/curry\s+powder/gi, 'curry powder'],
      [/garam\s+masala/gi, 'garam masala'],
      [/chili\s+powder/gi, 'chili powder'],
      [/black\s+pepper/gi, 'black pepper'],
      [/balsamic\s+vinegar/gi, 'balsamic vinegar'],
      [/brown\s+sugar/gi, 'brown sugar'],
      [/maple\s+syrup/gi, 'maple syrup'],
      [/chicken\s+stock/gi, 'chicken stock'],
      [/beef\s+stock/gi, 'beef stock'],
      [/vegetable\s+stock/gi, 'vegetable stock'],
      [/red\s+wine/gi, 'red wine'],
      [/white\s+wine/gi, 'white wine'],
      [/coconut\s+milk/gi, 'coconut milk'],
      [/soy\s+milk/gi, 'soy milk'],
      [/almond\s+milk/gi, 'almond milk'],
      [/potato\s+starch/gi, 'potato starch'],
      [/sesame\s+seeds?/gi, 'sesame seeds'],
      [/sunflower\s+seeds?/gi, 'sunflower seeds'],
      [/chia\s+seeds?/gi, 'chia seeds'],
      
      // Plurals (after multi-word to avoid conflicts)
      [/mushrooms/gi, 'mushroom'],
      [/potatoes/gi, 'potato'],
      [/tomatoes/gi, 'tomato'],
      [/onions/gi, 'onion'],
      [/carrots/gi, 'carrot'],
      [/eggs/gi, 'egg'],
      [/olives/gi, 'olive'],
      [/prawns/gi, 'prawn'],
      [/shrimps/gi, 'shrimp'],
      [/almonds/gi, 'almond'],
      [/walnuts/gi, 'walnut'],
      [/peanuts/gi, 'peanut'],
      [/cashews/gi, 'cashew'],
      [/chickpeas/gi, 'chickpeas'], // Keep plural
      [/lentils/gi, 'lentils'], // Keep plural
      [/beans/gi, 'beans'], // Keep plural
      [/noodles/gi, 'noodles'], // Keep plural
      
      // Meat cuts → base protein
      [/chicken\s+(breast|breasts|thigh|thighs|drumstick|drumsticks)/gi, 'chicken'],
      [/beef\s+(steak|roast|chuck|sirloin|brisket)/gi, 'beef'],
      [/pork\s+(chop|chops|loin|shoulder|ribs)/gi, 'pork'],
    ];
    
    for (const [pattern, replacement] of normalizations) {
      name = name.replace(pattern, replacement);
      originalClean = originalClean.replace(pattern, replacement);
    }

    // Find matching ingredient base
    let base = Object.keys(KCAL_100G).find(
      (k) => new RegExp(`\\b${k}\\b`).test(name) || new RegExp(`\\b${k}\\b`).test(originalClean)
    );
    
    // Special case overrides
    if (/\b(stock|broth|bouillon)\b/.test(originalClean)) {
      base = 'stock';
    }
    if (/\b(pasta|macaroni|penne|fusilli|linguine|fettuccine)\b/.test(originalClean) && base !== 'spaghetti') {
      base = 'pasta';
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

  // Use shared parsing logic
  const { oilEntries, otherEntries } = parseIngredientEntries(ings);
  let total = 0;

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
