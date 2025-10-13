/**
 * Mock Spoonacular API Service
 * Provides realistic recipe data for development without API keys
 */

import storageService from './storageService.js';

class MockRecipeService {
  constructor() {
    this.mockRecipes = this.generateMockRecipes();
    this.cuisines = [
      'Italian', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Japanese', 
      'French', 'Mediterranean', 'American', 'Korean', 'Greek', 'Spanish'
    ];
    this.dietTypes = [
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'ketogenic', 
      'paleo', 'low-carb', 'low-fat', 'high-protein'
    ];
  }

  /**
   * Generate comprehensive mock recipe data
   */
  generateMockRecipes() {
    return [
      {
        id: 1,
        title: "Creamy Garlic Parmesan Chicken",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        readyInMinutes: 30,
        servings: 4,
        cuisines: ["Italian"],
        diets: ["gluten-free"],
        summary: "A rich and creamy chicken dish with garlic and parmesan that's ready in just 30 minutes.",
        extendedIngredients: [
          { id: 1, name: "chicken breast", amount: 4, unit: "pieces", original: "4 chicken breasts" },
          { id: 2, name: "heavy cream", amount: 1, unit: "cup", original: "1 cup heavy cream" },
          { id: 3, name: "parmesan cheese", amount: 0.5, unit: "cup", original: "1/2 cup grated parmesan" },
          { id: 4, name: "garlic", amount: 4, unit: "cloves", original: "4 cloves garlic, minced" },
          { id: 5, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tbsp olive oil" }
        ],
        instructions: [
          { number: 1, step: "Season chicken breasts with salt and pepper." },
          { number: 2, step: "Heat olive oil in a large skillet over medium-high heat." },
          { number: 3, step: "Cook chicken for 6-8 minutes per side until golden brown." },
          { number: 4, step: "Remove chicken and add garlic to the pan." },
          { number: 5, step: "Add heavy cream and parmesan, simmer until thickened." },
          { number: 6, step: "Return chicken to pan and serve immediately." }
        ],
        nutrition: {
          calories: 485,
          protein: 42,
          carbs: 6,
          fat: 32,
          fiber: 1,
          sugar: 3
        },
        aggregateLikes: 234,
        spoonacularScore: 85,
        healthScore: 72
      },
      {
        id: 2,
        title: "Mediterranean Quinoa Bowl",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        readyInMinutes: 25,
        servings: 2,
        cuisines: ["Mediterranean"],
        diets: ["vegetarian", "vegan", "gluten-free"],
        summary: "A healthy and colorful quinoa bowl packed with fresh vegetables and Mediterranean flavors.",
        extendedIngredients: [
          { id: 6, name: "quinoa", amount: 1, unit: "cup", original: "1 cup quinoa" },
          { id: 7, name: "cucumber", amount: 1, unit: "large", original: "1 large cucumber, diced" },
          { id: 8, name: "cherry tomatoes", amount: 1, unit: "cup", original: "1 cup cherry tomatoes" },
          { id: 9, name: "red onion", amount: 0.25, unit: "cup", original: "1/4 cup red onion" },
          { id: 10, name: "olives", amount: 0.5, unit: "cup", original: "1/2 cup kalamata olives" },
          { id: 11, name: "feta cheese", amount: 0.5, unit: "cup", original: "1/2 cup crumbled feta" },
          { id: 12, name: "olive oil", amount: 3, unit: "tbsp", original: "3 tbsp olive oil" },
          { id: 13, name: "lemon juice", amount: 2, unit: "tbsp", original: "2 tbsp lemon juice" }
        ],
        instructions: [
          { number: 1, step: "Cook quinoa according to package instructions and let cool." },
          { number: 2, step: "Dice cucumber, tomatoes, and red onion." },
          { number: 3, step: "Whisk together olive oil, lemon juice, salt, and pepper." },
          { number: 4, step: "Combine quinoa with vegetables in a large bowl." },
          { number: 5, step: "Add olives and feta cheese." },
          { number: 6, step: "Toss with dressing and serve chilled." }
        ],
        nutrition: {
          calories: 420,
          protein: 14,
          carbs: 52,
          fat: 18,
          fiber: 8,
          sugar: 12
        },
        aggregateLikes: 189,
        spoonacularScore: 92,
        healthScore: 88
      },
      {
        id: 3,
        title: "Spicy Thai Basil Stir Fry",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        readyInMinutes: 20,
        servings: 3,
        cuisines: ["Thai"],
        diets: ["dairy-free"],
        summary: "Quick and flavorful Thai stir fry with fresh basil and a perfect balance of sweet and spicy.",
        extendedIngredients: [
          { id: 14, name: "ground beef", amount: 1, unit: "lb", original: "1 lb ground beef" },
          { id: 15, name: "Thai basil", amount: 1, unit: "cup", original: "1 cup fresh Thai basil" },
          { id: 16, name: "bell pepper", amount: 1, unit: "large", original: "1 large bell pepper" },
          { id: 17, name: "onion", amount: 1, unit: "medium", original: "1 medium onion" },
          { id: 18, name: "garlic", amount: 4, unit: "cloves", original: "4 cloves garlic" },
          { id: 19, name: "soy sauce", amount: 3, unit: "tbsp", original: "3 tbsp soy sauce" },
          { id: 20, name: "fish sauce", amount: 2, unit: "tbsp", original: "2 tbsp fish sauce" },
          { id: 21, name: "brown sugar", amount: 1, unit: "tbsp", original: "1 tbsp brown sugar" },
          { id: 22, name: "chili flakes", amount: 1, unit: "tsp", original: "1 tsp red chili flakes" }
        ],
        instructions: [
          { number: 1, step: "Heat oil in a wok or large skillet over high heat." },
          { number: 2, step: "Add garlic and chili flakes, stir fry for 30 seconds." },
          { number: 3, step: "Add ground beef and cook until browned." },
          { number: 4, step: "Add onion and bell pepper, stir fry for 3 minutes." },
          { number: 5, step: "Mix soy sauce, fish sauce, and brown sugar." },
          { number: 6, step: "Add sauce mixture and Thai basil, toss until wilted." }
        ],
        nutrition: {
          calories: 320,
          protein: 28,
          carbs: 12,
          fat: 18,
          fiber: 3,
          sugar: 8
        },
        aggregateLikes: 156,
        spoonacularScore: 78,
        healthScore: 65
      },
      {
        id: 4,
        title: "Chocolate Avocado Smoothie Bowl",
        image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400",
        readyInMinutes: 10,
        servings: 1,
        cuisines: ["American"],
        diets: ["vegan", "gluten-free", "dairy-free"],
        summary: "A creamy, healthy smoothie bowl that tastes like chocolate mousse but packed with nutrients.",
        extendedIngredients: [
          { id: 23, name: "avocado", amount: 1, unit: "large", original: "1 large ripe avocado" },
          { id: 24, name: "banana", amount: 1, unit: "frozen", original: "1 frozen banana" },
          { id: 25, name: "cocoa powder", amount: 2, unit: "tbsp", original: "2 tbsp unsweetened cocoa powder" },
          { id: 26, name: "almond milk", amount: 0.5, unit: "cup", original: "1/2 cup almond milk" },
          { id: 27, name: "maple syrup", amount: 1, unit: "tbsp", original: "1 tbsp maple syrup" },
          { id: 28, name: "chia seeds", amount: 1, unit: "tbsp", original: "1 tbsp chia seeds" },
          { id: 29, name: "berries", amount: 0.25, unit: "cup", original: "1/4 cup mixed berries" },
          { id: 30, name: "coconut flakes", amount: 1, unit: "tbsp", original: "1 tbsp coconut flakes" }
        ],
        instructions: [
          { number: 1, step: "Blend avocado, banana, cocoa powder, almond milk, and maple syrup until smooth." },
          { number: 2, step: "Pour into a bowl and smooth the top." },
          { number: 3, step: "Top with chia seeds, berries, and coconut flakes." },
          { number: 4, step: "Serve immediately while cold." }
        ],
        nutrition: {
          calories: 385,
          protein: 8,
          carbs: 45,
          fat: 22,
          fiber: 15,
          sugar: 25
        },
        aggregateLikes: 278,
        spoonacularScore: 89,
        healthScore: 95
      },
      {
        id: 5,
        title: "Korean Beef Bulgogi Tacos",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        readyInMinutes: 35,
        servings: 4,
        cuisines: ["Korean", "Mexican"],
        diets: ["dairy-free"],
        summary: "Fusion tacos combining Korean bulgogi flavors with Mexican-style presentation.",
        extendedIngredients: [
          { id: 31, name: "beef sirloin", amount: 1, unit: "lb", original: "1 lb thinly sliced beef sirloin" },
          { id: 32, name: "soy sauce", amount: 0.25, unit: "cup", original: "1/4 cup soy sauce" },
          { id: 33, name: "brown sugar", amount: 2, unit: "tbsp", original: "2 tbsp brown sugar" },
          { id: 34, name: "sesame oil", amount: 1, unit: "tbsp", original: "1 tbsp sesame oil" },
          { id: 35, name: "ginger", amount: 1, unit: "tbsp", original: "1 tbsp grated ginger" },
          { id: 36, name: "garlic", amount: 3, unit: "cloves", original: "3 cloves minced garlic" },
          { id: 37, name: "corn tortillas", amount: 8, unit: "small", original: "8 small corn tortillas" },
          { id: 38, name: "cabbage slaw", amount: 2, unit: "cups", original: "2 cups cabbage slaw" },
          { id: 39, name: "green onions", amount: 2, unit: "stalks", original: "2 green onions, sliced" }
        ],
        instructions: [
          { number: 1, step: "Marinate beef in soy sauce, brown sugar, sesame oil, ginger, and garlic for 30 minutes." },
          { number: 2, step: "Heat grill or skillet to high heat." },
          { number: 3, step: "Cook marinated beef for 2-3 minutes per side." },
          { number: 4, step: "Warm tortillas on the grill." },
          { number: 5, step: "Fill tortillas with beef and top with cabbage slaw." },
          { number: 6, step: "Garnish with green onions and serve." }
        ],
        nutrition: {
          calories: 340,
          protein: 26,
          carbs: 28,
          fat: 14,
          fiber: 4,
          sugar: 8
        },
        aggregateLikes: 201,
        spoonacularScore: 81,
        healthScore: 70
      }
    ];
  }

  /**
   * Search recipes with filters (mock implementation)
   */
  async searchRecipes(query = '', filters = {}) {
    // Simulate API delay
    await this.delay(500 + Math.random() * 1000);

    // Check cache first
    const cached = storageService.getCachedRecipeSearch(query, filters);
    if (cached) {
      return {
        results: cached,
        totalResults: cached.length,
        offset: 0,
        number: cached.length,
        cached: true
      };
    }

    let results = [...this.mockRecipes];

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.summary.toLowerCase().includes(searchTerm) ||
        recipe.cuisines.some(cuisine => cuisine.toLowerCase().includes(searchTerm)) ||
        recipe.extendedIngredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply cuisine filter
    if (filters.cuisine && filters.cuisine !== 'all') {
      results = results.filter(recipe => 
        recipe.cuisines.some(cuisine => 
          cuisine.toLowerCase() === filters.cuisine.toLowerCase()
        )
      );
    }

    // Apply diet filter
    if (filters.diet && filters.diet !== 'all') {
      results = results.filter(recipe => 
        recipe.diets.includes(filters.diet)
      );
    }

    // Apply max ready time filter
    if (filters.maxReadyTime) {
      results = results.filter(recipe => 
        recipe.readyInMinutes <= parseInt(filters.maxReadyTime)
      );
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'popularity':
          results.sort((a, b) => b.aggregateLikes - a.aggregateLikes);
          break;
        case 'time':
          results.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
          break;
        case 'healthiness':
          results.sort((a, b) => b.healthScore - a.healthScore);
          break;
        case 'random':
          results = this.shuffleArray(results);
          break;
        default:
          // Default sorting by spoonacular score
          results.sort((a, b) => b.spoonacularScore - a.spoonacularScore);
      }
    }

    // Cache the results
    storageService.cacheRecipeSearch(query, filters, results);
    
    // Add to search history
    if (query.trim()) {
      storageService.addSearchHistory(query, filters);
    }

    return {
      results,
      totalResults: results.length,
      offset: 0,
      number: results.length,
      cached: false
    };
  }

  /**
   * Get detailed recipe information
   */
  async getRecipeDetails(recipeId) {
    await this.delay(300);
    
    const recipe = this.mockRecipes.find(r => r.id === parseInt(recipeId));
    
    if (!recipe) {
      throw new Error(`Recipe with ID ${recipeId} not found`);
    }

    // Add some additional details for the detailed view
    return {
      ...recipe,
      analyzedInstructions: [
        {
          name: "",
          steps: recipe.instructions
        }
      ],
      winePairing: {
        pairedWines: ["Chardonnay", "Pinot Grigio"],
        pairingText: "This dish pairs wonderfully with a crisp white wine."
      },
      tips: [
        "For best results, use fresh ingredients",
        "Allow flavors to meld by letting the dish rest for 5 minutes before serving",
        "Adjust seasoning to taste"
      ],
      similar: this.mockRecipes
        .filter(r => r.id !== recipe.id)
        .slice(0, 3)
        .map(r => ({ id: r.id, title: r.title, image: r.image }))
    };
  }

  /**
   * Get random recipes
   */
  async getRandomRecipes(number = 6, tags = '') {
    await this.delay(400);
    
    let recipes = [...this.mockRecipes];
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      recipes = recipes.filter(recipe => 
        tagArray.some(tag => 
          recipe.cuisines.some(cuisine => cuisine.toLowerCase().includes(tag)) ||
          recipe.diets.some(diet => diet.toLowerCase().includes(tag))
        )
      );
    }
    
    return {
      recipes: this.shuffleArray(recipes).slice(0, number)
    };
  }

  /**
   * Get recipe nutrition breakdown
   */
  async getRecipeNutrition(recipeId) {
    await this.delay(200);
    
    const recipe = this.mockRecipes.find(r => r.id === parseInt(recipeId));
    
    if (!recipe) {
      throw new Error(`Recipe with ID ${recipeId} not found`);
    }

    return {
      calories: recipe.nutrition.calories,
      carbs: `${recipe.nutrition.carbs}g`,
      fat: `${recipe.nutrition.fat}g`,
      protein: `${recipe.nutrition.protein}g`,
      fiber: `${recipe.nutrition.fiber}g`,
      sugar: `${recipe.nutrition.sugar}g`,
      nutrients: [
        { name: "Calories", amount: recipe.nutrition.calories, unit: "kcal", percentOfDailyNeeds: 24 },
        { name: "Fat", amount: recipe.nutrition.fat, unit: "g", percentOfDailyNeeds: 49 },
        { name: "Saturated Fat", amount: Math.round(recipe.nutrition.fat * 0.3), unit: "g", percentOfDailyNeeds: 30 },
        { name: "Carbohydrates", amount: recipe.nutrition.carbs, unit: "g", percentOfDailyNeeds: 4 },
        { name: "Fiber", amount: recipe.nutrition.fiber, unit: "g", percentOfDailyNeeds: 6 },
        { name: "Sugar", amount: recipe.nutrition.sugar, unit: "g", percentOfDailyNeeds: 0 },
        { name: "Protein", amount: recipe.nutrition.protein, unit: "g", percentOfDailyNeeds: 85 }
      ]
    };
  }

  /**
   * Get available cuisines
   */
  getCuisines() {
    return this.cuisines;
  }

  /**
   * Get available diet types
   */
  getDietTypes() {
    return this.dietTypes;
  }

  /**
   * Utility method to shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Simulate network delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is using real API or mock data
   */
  isUsingRealAPI() {
    return false;
  }

  /**
   * Generate additional mock recipes (for infinite scroll or pagination)
   */
  generateMoreRecipes(count = 10) {
    const additionalRecipes = [];
    const baseRecipes = this.mockRecipes;
    
    for (let i = 0; i < count; i++) {
      const baseRecipe = baseRecipes[i % baseRecipes.length];
      const variation = {
        ...baseRecipe,
        id: Date.now() + i,
        title: this.generateVariationTitle(baseRecipe.title),
        readyInMinutes: baseRecipe.readyInMinutes + Math.floor(Math.random() * 20) - 10,
        aggregateLikes: Math.floor(Math.random() * 500) + 50
      };
      additionalRecipes.push(variation);
    }
    
    return additionalRecipes;
  }

  /**
   * Generate variation of recipe title
   */
  generateVariationTitle(originalTitle) {
    const adjectives = ['Easy', 'Quick', 'Healthy', 'Delicious', 'Perfect', 'Ultimate', 'Classic'];
    const modifiers = ['Homestyle', 'Restaurant-Style', 'Family', 'Gourmet', 'Simple'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    
    // Sometimes add adjective, sometimes modifier, sometimes both
    const variation = Math.random();
    
    if (variation < 0.33) {
      return `${randomAdjective} ${originalTitle}`;
    } else if (variation < 0.66) {
      return `${randomModifier} ${originalTitle}`;
    } else {
      return `${randomAdjective} ${randomModifier} ${originalTitle}`;
    }
  }
}

// Create and export singleton instance
const mockRecipeService = new MockRecipeService();
export default mockRecipeService;