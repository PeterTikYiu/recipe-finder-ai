/**
 * Mock AI Nutrition Service
 * Simulates OpenAI API for calorie and macro estimation
 */
import storageService from './storageService';

class MockAIService {
  constructor() {
    this.baseNutrition = {
      'egg': { calories: 78, protein: 6, fat: 5, carbs: 0.6 },
      'banana': { calories: 105, protein: 1.3, fat: 0.4, carbs: 27 },
      'oats': { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3 },
      'chicken breast': { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
      'spinach': { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 },
      'olive oil': { calories: 884, protein: 0, fat: 100, carbs: 0 },
      'rice': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
      'avocado': { calories: 160, protein: 2, fat: 15, carbs: 9 },
      'bread': { calories: 265, protein: 9, fat: 3.2, carbs: 49 },
      'cheese': { calories: 402, protein: 25, fat: 33, carbs: 1.3 },
      'tomato': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
      'potato': { calories: 77, protein: 2, fat: 0.1, carbs: 17 },
      'beef': { calories: 250, protein: 26, fat: 15, carbs: 0 },
      'salmon': { calories: 208, protein: 20, fat: 13, carbs: 0 },
      'milk': { calories: 42, protein: 3.4, fat: 1, carbs: 5 },
      'sugar': { calories: 387, protein: 0, fat: 0, carbs: 100 },
      'flour': { calories: 364, protein: 10, fat: 1, carbs: 76 },
    };
  }

  /**
   * Analyze ingredients text and estimate nutrition
   * @param {string} ingredientText - e.g., "2 eggs, 100g oats"
   * @returns {Promise<object>} - Estimated nutrition data
   */
  async getNutritionAnalysis(ingredientText) {
    // Simulate API delay
    await this.delay(1000 + Math.random() * 1500);

    // Check cache first
    const cached = storageService.getCachedNutritionAnalysis(ingredientText);
    if (cached) {
      return { ...cached, cached: true };
    }

    const lines = ingredientText.toLowerCase().split(/,|\n/).filter(line => line.trim());
    let totalNutrition = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      confidence: 0.85 + Math.random() * 0.1, // Simulate confidence score
      warnings: []
    };

    lines.forEach(line => {
      const { quantity, unit, ingredient } = this.parseIngredientLine(line);
      const base = this.findBaseIngredient(ingredient);

      if (base) {
        const multiplier = this.getMultiplier(quantity, unit, ingredient, base);
        totalNutrition.calories += base.calories * multiplier;
        totalNutrition.protein += base.protein * multiplier;
        totalNutrition.fat += base.fat * multiplier;
        totalNutrition.carbs += base.carbs * multiplier;
      } else {
        totalNutrition.warnings.push(`Could not estimate nutrition for: "${ingredient}"`);
      }
    });

    // Add some random fiber and sugar for realism
    totalNutrition.fiber = Math.round(totalNutrition.carbs * 0.1);
    totalNutrition.sugar = Math.round(totalNutrition.carbs * 0.05);

    // Round values
    totalNutrition = {
      ...totalNutrition,
      calories: Math.round(totalNutrition.calories),
      protein: Math.round(totalNutrition.protein),
      fat: Math.round(totalNutrition.fat),
      carbs: Math.round(totalNutrition.carbs),
    };

    // Cache the result
    storageService.cacheNutritionAnalysis(ingredientText, totalNutrition);

    return { ...totalNutrition, cached: false };
  }

  /**
   * Simple parsing of an ingredient line
   */
  parseIngredientLine(line) {
    line = line.trim();
    
    // Match quantity (e.g., 1, 1/2, 1.5)
    const quantityMatch = line.match(/^(\d+\s*\/\s*\d+|\d*\.?\d+)/);
    let quantity = 1;
    if (quantityMatch) {
      const qStr = quantityMatch[0];
      if (qStr.includes('/')) {
        const parts = qStr.split('/');
        quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        quantity = parseFloat(qStr);
      }
      line = line.substring(qStr.length).trim();
    }

    // Match units (e.g., g, kg, cup, tbsp)
    const unitMatch = line.match(/^(g|gram|grams|kg|kilo|kilos|cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|ounces|lb|lbs|pound|pounds)/);
    let unit = 'piece';
    if (unitMatch) {
      unit = unitMatch[0];
      line = line.substring(unit.length).trim();
    }
    
    // The rest is the ingredient name
    const ingredient = line.replace(/^of\s+/, '').trim();

    return { quantity, unit, ingredient };
  }

  /**
   * Find a matching base ingredient from our mock DB
   */
  findBaseIngredient(ingredientName) {
    const name = ingredientName.toLowerCase();
    // Direct match
    if (this.baseNutrition[name]) return this.baseNutrition[name];
    
    // Partial match
    const key = Object.keys(this.baseNutrition).find(k => name.includes(k));
    return key ? this.baseNutrition[key] : null;
  }

  /**
   * Estimate multiplier based on quantity and unit
   */
  getMultiplier(quantity, unit, ingredient, base) {
    // Weight-based multiplier (assuming base is per 100g)
    const weightUnits = {
      'g': 0.01, 'gram': 0.01, 'grams': 0.01,
      'kg': 10, 'kilo': 10, 'kilos': 10,
      'oz': 0.28, 'ounce': 0.28, 'ounces': 0.28,
      'lb': 4.53, 'lbs': 4.53, 'pound': 4.53, 'pounds': 4.53,
    };
    if (weightUnits[unit]) {
      return quantity * weightUnits[unit];
    }

    // Volume-based multiplier (very rough estimates)
    const volumeUnits = {
      'cup': 2.4, 'cups': 2.4, // e.g., 240g flour
      'tbsp': 0.15, 'tablespoon': 0.15,
      'tsp': 0.05, 'teaspoon': 0.05,
    };
    if (volumeUnits[unit]) {
      return quantity * volumeUnits[unit];
    }

    // Piece-based multiplier (e.g., "2 eggs")
    // This is a very rough guess
    if (ingredient.includes('egg')) return quantity;
    if (ingredient.includes('banana')) return quantity;
    
    return quantity; // Default to quantity if unit is unknown
  }

  /**
   * Simulate network delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and export singleton instance
const mockAIService = new MockAIService();
export default mockAIService;