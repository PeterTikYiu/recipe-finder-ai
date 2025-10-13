/**
 * Estimate cooking time from instructions text
 * Looks for patterns like "cook for 15 minutes", "bake 30 min", "about 5 minutes", etc.
 * Sums all found durations for a rough total
 * @param {string|string[]} instructions - Instructions as string or array
 * @returns {number|null} Estimated total time in minutes
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function estimateCookingTimeFromInstructions(instructions) {
  let text = '';
  if (Array.isArray(instructions)) {
    text = instructions.join(' ');
  } else if (typeof instructions === 'string') {
    text = instructions;
  } else {
    return null;
  }
  // Normalize dashes and whitespace
  text = text.replace(/[–—]/g, '-');
  // Remove summary-style time lines like "Prep:15min", "Cook:30min", "Ready in:45min" to avoid double counting
  text = text.replace(/\b(Prep|Cook|Ready\s*in)\s*:\s*\d{1,3}\s*(?:minutes?|mins?|hours?|hrs?)\b/gi, '');

  let total = 0;

  // 0) Handle "each side" patterns first to avoid double counting later
  // Ranged each-side: "3 to 4 minutes each side" or "3-4 minutes per side"
  const eachSideRange = /(\d{1,3})\s*(?:-|to|or)\s*(\d{1,3})\s*(minutes?|mins?)\s*(?:each\s*side|per\s*side)/gi;
  text = text.replace(eachSideRange, (_, a, b) => {
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      const avg = (aNum + bNum) / 2;
      total += avg * 2; // both sides
    }
    return ' ';
  });
  // Single each-side: "4 minutes each side"
  const eachSideSingle = /(\d{1,3})\s*(minutes?|mins?)\s*(?:each\s*side|per\s*side)/gi;
  text = text.replace(eachSideSingle, (_, a) => {
    const aNum = parseInt(a, 10);
    if (Number.isFinite(aNum)) total += aNum * 2;
    return ' ';
  });

  // 1) Ranges like "6-8 minutes", "6 to 8 minutes" or "6 or 8 minutes"; also hours
  const rangeRegex = /(\d{1,3})\s*(?:-|to|or)\s*(\d{1,3})\s*(minutes?|mins?|hours?|hrs?)/gi;
  for (const m of text.matchAll(rangeRegex)) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const unit = (m[3] || '').toLowerCase();
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const avg = (a + b) / 2;
      const isHours = unit.startsWith('hour') || unit.startsWith('hr');
      total += isHours ? avg * 60 : avg;
    }
  }
  // Remove ranges so their numbers don't get double-counted below
  text = text.replace(rangeRegex, '');

  // 2) Single hours/minutes like "15 minutes", "1 hour"
  const singleRegex = /(\d{1,3})\s*(hours?|hrs?|minutes?|mins?)/gi;
  for (const m of text.matchAll(singleRegex)) {
    const val = parseInt(m[1], 10);
    const unit = (m[2] || '').toLowerCase();
    if (Number.isFinite(val)) {
      const isHours = unit.startsWith('hour') || unit.startsWith('hr');
      total += isHours ? val * 60 : val;
    }
  }

  // 3) Qualitative phrases
  // "a minute"
  const aMinute = /\ba\s+minute\b/i;
  if (aMinute.test(text)) total += 1;
  // "couple of minutes"
  const coupleMinutes = /\bcouple of minutes?\b/i;
  if (coupleMinutes.test(text)) total += 2;

  return total > 0 ? Math.round(total) : null;
}

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with appropriate units (K, M, etc.)
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function to limit API calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a random ID
 * @returns Random string ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate nutrition per serving
 * @param nutrition - Base nutrition object
 * @param servings - Number of servings
 * @returns Scaled nutrition object
 */
export function calculateNutritionPerServing(nutrition, servings = 1) {
  if (!nutrition || servings <= 0) return nutrition;
  
  return {
    calories: Math.round((nutrition.calories || 0) / servings),
    protein: Math.round(((nutrition.protein || 0) / servings) * 10) / 10,
    carbs: Math.round(((nutrition.carbs || 0) / servings) * 10) / 10,
    fat: Math.round(((nutrition.fat || 0) / servings) * 10) / 10,
    fiber: Math.round(((nutrition.fiber || 0) / servings) * 10) / 10,
    sugar: Math.round(((nutrition.sugar || 0) / servings) * 10) / 10,
  };
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format cooking time to readable string
 * @param minutes - Time in minutes
 * @returns Formatted time string
 */
export function formatCookingTime(minutes) {
  if (!minutes || minutes === 0) return 'N/A';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Capitalize first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str) {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Extract calories from a Spoonacular summary string (HTML) if present
 * Looks for patterns like "450 kcal" or "450 calories"
 * @param {string} summary - HTML summary content
 * @returns {number|null} Rounded calories value if found, else null
 */
export function extractCaloriesFromSummary(summary) {
  if (!summary || typeof summary !== 'string') return null;
  // Strip HTML tags
  const text = summary.replace(/<[^>]*>/g, ' ');
  // Find number followed by kcal/calories
  const match = text.match(/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:kcal|calories?)/i);
  if (!match) return null;
  const raw = match[1].replace(',', '.');
  const val = parseFloat(raw);
  if (Number.isFinite(val)) return Math.round(val);
  return null;
}