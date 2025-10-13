# 🍳 Recipe Finder + AI Calorie Calculator

A smart, responsive web app built with **React** that helps users discover, save, and analyze recipes.  
Search recipes via the **Spoonacular API**, apply dietary filters, and use **AI** to estimate calories and nutrition from any ingredient list — all in one place.

---

## 🧭 Overview

### 🌟 Core Purpose
**Recipe Finder + AI Calorie Calculator** is a personal cooking assistant that helps you:
- Discover new recipes based on ingredients or cuisine  
- Save favorites locally  
- Estimate calories using an AI nutrition model  
- Access it like a mobile app via **PWA install**

Built for food lovers, fitness enthusiasts, and anyone who wants quick, intelligent meal insights.

---

## 🧩 Key Features

| Feature | Description |
|----------|-------------|
| 🔍 **Recipe Search** | Search recipes by name or ingredients |
| ⚙️ **Filters** | Apply diet (vegan, keto, gluten-free) and cuisine filters |
| 📖 **Recipe Details** | View ingredients, instructions, and nutrition |
| ❤️ **Save Favorites** | Store favorite recipes in LocalStorage |
| 🧮 **AI Calorie Calculator** | Estimate calories and macros for any recipe text or ingredient list |
| 💾 **Offline Support (PWA)** | Use the app offline and install on mobile |
| 🌙 **Dark Mode (Future)** | Toggle between light and dark UI modes |

---

## 🧱 App Structure
recipe-finder/
│
├── public/
│ ├── icons/
│ │ ├── icon-192x192.png
│ │ └── icon-512x512.png
│ └── manifest.json
│
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── SearchBar.jsx
│ │ ├── FilterPanel.jsx
│ │ ├── RecipeCard.jsx
│ │ ├── RecipeModal.jsx
│ │ ├── FavoritesList.jsx
│ │ └── CalorieCalculator.jsx
│ │
│ ├── hooks/
│ │ ├── useLocalStorage.js
│ │ └── useAI.js
│ │
│ ├── pages/
│ │ ├── Home.jsx
│ │ ├── Favorites.jsx
│ │ └── Calculator.jsx
│ │
│ ├── App.jsx
│ ├── main.jsx
│ ├── index.css
│ └── api.js
│
├── .env
├── package.json
└── README.md


---

## ⚡ Tech Stack

| Layer | Tool |
|--------|------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Data Source | Spoonacular API |
| AI Integration | OpenAI API (GPT-4o-mini) |
| Storage | LocalStorage |
| Deployment | Vercel or Netlify |
| App-Like Behavior | PWA (Progressive Web App) |

---

## 🧠 AI Calorie Estimator (Concept)

**Input:**  
User enters ingredients or a recipe description.  
> e.g. “2 eggs, 1 banana, 100g oats”

**AI Output:**  
> 🍳 *Estimated: ~510 kcal*  
> - Protein: 22g  
> - Carbs: 60g  
> - Fat: 18g  

The AI model uses contextual understanding to provide calorie and macronutrient approximations.

---

## 🏗️ PWA Setup Plan

1. **Add `manifest.json`**
   ```json
   {
     "short_name": "RecipeAI",
     "name": "Recipe Finder + AI Calorie Calculator",
     "icons": [
       { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
     ],
     "start_url": ".",
     "display": "standalone",
     "theme_color": "#ffffff",
     "background_color": "#ffffff"
   }

Enable Service Worker

If using Vite → install vite-plugin-pwa

If using CRA → switch serviceWorker.unregister() → serviceWorker.register()

Add App Icons
Place icon-192x192.png and icon-512x512.png inside /public/icons/.

Test PWA

Run npm run dev

Check Chrome DevTools → Lighthouse → PWA audit

Confirm “Installable” and “Works Offline”

Deploy

Deploy to Vercel or Netlify

On mobile browser → “Add to Home Screen” to install

📱 Deployment to App Store (Cost Comparison)
Option	Store Presence	Cost	Difficulty	Notes
PWA (recommended start)	❌ Not official	✅ Free	⭐ Easy	Install from browser
Capacitor	✅ Yes (App/Play Store)	💰 ~$124/year	⚙️ Medium	Wrap React app and upload
React Native	✅ Yes	💰 ~$124/year	🔧 Hard	Full native rebuild
💡 Recommended Strategy

Start as a PWA (free)

Collect feedback and improve

Wrap with Capacitor later for App Store & Play Store publishing

🚀 Deployment Steps

Vercel Example

npm run build
vercel deploy

Netlify Example

npm run build
netlify deploy


Once deployed, your app will have a live URL like:

https://your-recipe-finder.vercel.app

🧭 User Flow (Concept)
Home Page
   ↓
Search Recipes → Filter → View Details
   ↓
Save Favorite → View in Favorites Tab
   ↓
Open AI Calorie Calculator
   ↓
Enter Custom Ingredients → Get AI Estimation

📅 Roadmap
Phase	Focus	Features
1. MVP	Core recipe finder	Search, filters, favorites
2. AI Add-on	Calorie calculator	AI text input & results
3. UX Polish	Interactivity	Dark mode, animations
4. Insights	Nutrition visualization	Charts, macros, servings
5. Store Release	Publish	Capacitor + App Store deploy

💡 Future Enhancements

🗓️ Meal Planner (weekly meal suggestions)

🛒 Grocery List Generator

📊 Nutrition Pie Charts

💬 AI Chatbot: “What can I cook with eggs and spinach?”

🔐 Login + Cloud Favorites

🧑‍💻 Author

Developed by MANTIK 
Passionate about turning data and AI into simple, useful tools for everyday life.

🏁 License

This project is open-source for educational and portfolio purposes.


---


## 🚀 Quickstart (Local Dev)

1) Install dependencies

```powershell
npm install
```

2) Configure environment variables
- Copy `.env.example` to `.env` and fill in values
- Only the Spoonacular key is required to search recipes
- Firebase is optional; if omitted or invalid, auth is disabled gracefully

```
VITE_SPOONACULAR_API_KEY=your_spoonacular_key
# Optional Firebase (for Google Sign-In)
VITE_FIREBASE_API_KEY=... 
VITE_FIREBASE_AUTH_DOMAIN=... 
VITE_FIREBASE_PROJECT_ID=... 
VITE_FIREBASE_APP_ID=... 
```

3) Start the dev server

```powershell
npm run dev
```

Open the printed Local URL (e.g., http://localhost:5173 or 5174) in your browser.

Troubleshooting
- White screen with Firebase errors → check your .env; if you don’t need auth, leave Firebase vars empty and the app will run with auth disabled
- 401/403 from Spoonacular → verify `VITE_SPOONACULAR_API_KEY`
- Port in use → Vite will pick another port automatically

