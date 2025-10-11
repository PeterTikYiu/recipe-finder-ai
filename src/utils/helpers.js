import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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