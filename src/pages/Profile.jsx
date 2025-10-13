import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Save, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const defaultPrefs = {
  theme: 'light',
  measurementUnit: 'metric',
  dietaryRestrictions: [],
  favoriteCuisines: [],
  allergens: [],
  calorieTarget: 2000,
  activityLevel: 'moderate',
};

export default function Profile() {
  const { user, signIn, signOut, getPrefs, setPrefs } = useAuth();
  const [prefs, setLocalPrefs] = useState(defaultPrefs);
  const [saving, setSaving] = useState(false);
  const [tdeeForm, setTdeeForm] = useState({
    sex: 'male',
    age: 30,
    heightCm: 175,
    weightKg: 70,
    activity: 'moderate',
    goal: 'maintain',
  });
  const [tdeeResult, setTdeeResult] = useState(null);

  useEffect(() => {
    const p = getPrefs() || defaultPrefs;
    setLocalPrefs({ ...defaultPrefs, ...p });
  }, [getPrefs]);

  const updateArray = (key, value) => {
    const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
    setLocalPrefs((prev) => ({ ...prev, [key]: arr }));
  };

  const handleSave = async () => {
    setSaving(true);
    setPrefs(prefs);
    setSaving(false);
  };

  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const computeTDEE = () => {
    const { sex, age, heightCm, weightKg, activity, goal } = tdeeForm;
    const s = sex === 'male' ? 5 : -161;
    const bmr = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age) + s;
    const multiplier = activityMap[activity] || 1.55;
    let tdee = bmr * multiplier;
    // Adjust for goal: simple +/- 15%
    if (goal === 'cut') tdee *= 0.85;
    if (goal === 'bulk') tdee *= 1.15;
    const rounded = Math.round(tdee);
    setTdeeResult(rounded);
    setLocalPrefs((p) => ({ ...p, calorieTarget: rounded }));
  };

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

      {!user ? (
        <button onClick={signIn} className="btn-primary inline-flex items-center gap-2">
          <LogIn className="h-5 w-5" /> Continue with Google
        </button>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photoURL && <img src={user.photoURL} alt={user.name} className="h-10 w-10 rounded-full" />}
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="btn-ghost inline-flex items-center gap-2">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Preferences</h2>
        <div className="grid gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Unit system</span>
            <select
              value={prefs.measurementUnit}
              onChange={(e) => setLocalPrefs((p) => ({ ...p, measurementUnit: e.target.value }))}
              className="input-field"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Dietary restrictions (comma-separated)</span>
            <input
              className="input-field"
              value={prefs.dietaryRestrictions.join(', ')}
              onChange={(e) => updateArray('dietaryRestrictions', e.target.value)}
              placeholder="vegetarian, halal, kosher"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Allergens (comma-separated)</span>
            <input
              className="input-field"
              value={prefs.allergens.join(', ')}
              onChange={(e) => updateArray('allergens', e.target.value)}
              placeholder="peanuts, shellfish, lactose"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Favorite cuisines (comma-separated)</span>
            <input
              className="input-field"
              value={prefs.favoriteCuisines.join(', ')}
              onChange={(e) => updateArray('favoriteCuisines', e.target.value)}
              placeholder="italian, chinese, japanese"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Daily calorie target</span>
            <input
              type="number"
              min={800}
              max={5000}
              className="input-field"
              value={prefs.calorieTarget}
              onChange={(e) => setLocalPrefs((p) => ({ ...p, calorieTarget: Number(e.target.value) }))}
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
            <Save className="h-5 w-5" /> {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" /> TDEE Planner
        </h2>
        <p className="text-sm text-gray-600 mb-4">Estimate your daily calories and set it as your target.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Sex</span>
            <select
              className="input-field"
              value={tdeeForm.sex}
              onChange={(e) => setTdeeForm((f) => ({ ...f, sex: e.target.value }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Age</span>
            <input type="number" className="input-field" value={tdeeForm.age} min={10} max={100}
              onChange={(e) => setTdeeForm((f) => ({ ...f, age: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Height (cm)</span>
            <input type="number" className="input-field" value={tdeeForm.heightCm} min={100} max={230}
              onChange={(e) => setTdeeForm((f) => ({ ...f, heightCm: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Weight (kg)</span>
            <input type="number" className="input-field" value={tdeeForm.weightKg} min={30} max={250}
              onChange={(e) => setTdeeForm((f) => ({ ...f, weightKg: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Activity level</span>
            <select className="input-field" value={tdeeForm.activity}
              onChange={(e) => setTdeeForm((f) => ({ ...f, activity: e.target.value }))}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Goal</span>
            <select className="input-field" value={tdeeForm.goal}
              onChange={(e) => setTdeeForm((f) => ({ ...f, goal: e.target.value }))}>
              <option value="maintain">Maintain</option>
              <option value="cut">Cut (-15%)</option>
              <option value="bulk">Bulk (+15%)</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn-secondary" onClick={computeTDEE}>Compute</button>
          {tdeeResult && (
            <div className="text-gray-700">
              Estimated TDEE: <span className="font-semibold">{tdeeResult} kcal</span> → set as target above
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
