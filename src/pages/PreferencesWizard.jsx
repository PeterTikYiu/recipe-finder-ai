import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [
  'goal',
  'tdee',
  'cuisines',
  'diet',
  'avoid',
  'summary',
];

const cuisinesCatalog = ['Italian','Asian','Mediterranean','Western','Indian','Japanese','Mexican','Chinese','Thai','Middle Eastern','French','Greek','Spanish','Korean','Vietnamese','Others'];
const meatOptions = ['chicken','beef','pork','fish','seafood','lamb','turkey'];
const commonAvoid = ['dairy','nuts','gluten','shellfish','soy','egg','peanut','sesame'];

function computeTDEE({ sex, age, heightCm, weightKg, activity, goal }) {
  const s = sex === 'male' ? 5 : -161;
  const bmr = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age) + s;
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMap[activity] || 1.2;
  let tdee = bmr * multiplier;
  if (goal === 'weight_loss') tdee *= 0.9; // 10% deficit
  if (goal === 'gain_muscle') tdee *= 1.1; // 10% surplus
  return Math.round(tdee);
}

const container = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5 } }, exit: { opacity: 0, x: -30, transition: { duration: 0.5 } } };

export default function PreferencesWizard() {
  const navigate = useNavigate();
  const { setPrefs, getPrefs } = useAuth();
  const existing = useMemo(() => getPrefs?.() || {}, [getPrefs]);

  const [stepIdx, setStepIdx] = useState(0);
  const [goal, setGoal] = useState(existing.goal || 'healthy_eating');
  const [tdeeForm, setTdeeForm] = useState({
    sex: 'male', age: 30, heightCm: 170, weightKg: 70, activity: 'light'
  });
  const [tdeePreview, setTdeePreview] = useState(existing.calorieTarget || existing.tdee || null);
  const [cuisines, setCuisines] = useState(existing.cuisines || existing.favoriteCuisines || []);
  const [diet, setDiet] = useState(existing.diet || 'balanced');
  const [meats, setMeats] = useState(existing.meats || []);
  const [avoid, setAvoid] = useState(existing.avoid || existing.allergens || []);
  const [customAvoid, setCustomAvoid] = useState('');

  const isWeightLoss = goal === 'weight_loss';

  const next = () => setStepIdx((i) => Math.min(steps.length - 1, i + 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const toggleInArray = (value, arrSetter) => {
    arrSetter((arr) => arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const progress = Math.round(((stepIdx + 1) / steps.length) * 100);

  const handleComputeTDEE = () => {
    const t = computeTDEE({ ...tdeeForm, goal });
    setTdeePreview(t);
  };

  const handleSave = () => {
    const payload = {
      goal,
      tdee: tdeePreview,
      calorieTarget: tdeePreview,
      cuisines,
      favoriteCuisines: cuisines,
      diet,
      meats,
      avoid,
      allergens: avoid,
      searchFilters: {
        cuisine: cuisines[0] || 'all',
        diet: diet === 'balanced' ? 'all' : diet,
      },
    };
    setPrefs?.(payload);
    navigate('/recommended');
  };

  const StepGoal = () => (
    <motion.div key="goal" {...container}>
      <h2 className="text-2xl font-bold mb-2">What’s your main target?</h2>
      <p className="text-gray-600 mb-6">We’ll tailor suggestions to your goal.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: 'weight_loss', label: 'Weight Loss', emoji: '⚖️' },
          { k: 'healthy_eating', label: 'Healthy Eating', emoji: '🥦' },
          { k: 'explore', label: 'Explore Delicate Recipes', emoji: '🍱' },
          { k: 'gain_muscle', label: 'Gain Muscle', emoji: '💪' },
        ].map((opt) => (
          <button
            key={opt.k}
            className={`p-4 rounded-lg border transition text-left ${goal === opt.k ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => setGoal(opt.k)}
          >
            <div className="text-3xl mb-2">{opt.emoji}</div>
            <div className="font-semibold">{opt.label}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const StepTDEE = () => (
    <motion.div key="tdee" {...container}>
      <h2 className="text-2xl font-bold mb-2">Let’s estimate your daily calories</h2>
      <p className="text-gray-600 mb-6">We use Mifflin–St Jeor + activity level.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Gender</label>
          <select className="input-field" value={tdeeForm.sex} onChange={(e) => setTdeeForm(f => ({ ...f, sex: e.target.value }))}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="label">Age</label>
          <input type="number" className="input-field" value={tdeeForm.age} onChange={(e) => setTdeeForm(f => ({ ...f, age: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input type="number" className="input-field" value={tdeeForm.heightCm} onChange={(e) => setTdeeForm(f => ({ ...f, heightCm: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Weight (kg)</label>
          <input type="number" className="input-field" value={tdeeForm.weightKg} onChange={(e) => setTdeeForm(f => ({ ...f, weightKg: Number(e.target.value) }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Activity</label>
          <select className="input-field" value={tdeeForm.activity} onChange={(e) => setTdeeForm(f => ({ ...f, activity: e.target.value }))}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very active</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-secondary" onClick={handleComputeTDEE}>Compute</button>
        {tdeePreview && (
          <div className="text-gray-700">Your daily target: <span className="font-semibold">~{tdeePreview} kcal</span></div>
        )}
      </div>
      {tdeePreview && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (tdeePreview / 3000) * 100))}%` }} />
        </div>
      )}
    </motion.div>
  );

  const StepCuisines = () => (
    <motion.div key="cuisines" {...container}>
      <h2 className="text-2xl font-bold mb-2">Which cuisines do you love?</h2>
      <p className="text-gray-600 mb-6">Pick a few—this guides recommendations.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cuisinesCatalog.map((c) => {
          const active = cuisines.includes(c);
          return (
            <button key={c} className={`px-3 py-2 rounded-md border text-sm ${active ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleInArray(c, setCuisines)}>
              <span className="mr-2">{active ? <Check className="inline h-4 w-4" /> : null}</span>
              {c}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const StepDiet = () => (
    <motion.div key="diet" {...container}>
      <h2 className="text-2xl font-bold mb-2">Food preference</h2>
      <p className="text-gray-600 mb-6">Do you prefer more meat or vegetables?</p>
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { k: 'vegetarian', label: 'Mostly Vegetables 🌱' },
          { k: 'balanced', label: 'Balanced 🍳' },
          { k: 'meat', label: 'Mostly Meat 🍖' },
        ].map((opt) => (
          <button key={opt.k} className={`px-4 py-2 rounded-md border ${diet === opt.k ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setDiet(opt.k)}>
            {opt.label}
          </button>
        ))}
      </div>
      {diet === 'meat' && (
        <div>
          <p className="text-gray-600 mb-3">What kind of meat do you enjoy?</p>
          <div className="flex flex-wrap gap-2">
            {meatOptions.map((m) => (
              <button key={m} className={`px-3 py-1.5 rounded-full text-sm border ${meats.includes(m) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleInArray(m, setMeats)}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const StepAvoid = () => (
    <motion.div key="avoid" {...container}>
      <h2 className="text-2xl font-bold mb-2">Anything to avoid?</h2>
      <p className="text-gray-600 mb-6">Allergies or ingredients you don’t want.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {commonAvoid.map((a) => (
          <button key={a} className={`px-3 py-1.5 rounded-full text-sm border ${avoid.includes(a) ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleInArray(a, setAvoid)}>
            {a}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input-field" placeholder="Add custom (e.g., cilantro)" value={customAvoid} onChange={(e) => setCustomAvoid(e.target.value)} />
        <button className="btn-secondary" onClick={() => { if (customAvoid.trim()) { toggleInArray(customAvoid.trim().toLowerCase(), setAvoid); setCustomAvoid(''); } }}>Add</button>
      </div>
    </motion.div>
  );

  const StepSummary = () => (
    <motion.div key="summary" {...container}>
      <h2 className="text-2xl font-bold mb-4">Review and Save</h2>
      <div className="space-y-3 text-gray-700">
        <div><span className="font-semibold">Goal:</span> {goal.replace('_', ' ')}</div>
        {isWeightLoss && (
          <div><span className="font-semibold">Daily calories:</span> {tdeePreview ? `${tdeePreview} kcal` : 'Not computed yet'}</div>
        )}
        <div><span className="font-semibold">Cuisines:</span> {cuisines.length ? cuisines.join(', ') : '—'}</div>
        <div><span className="font-semibold">Diet:</span> {diet}</div>
        {diet === 'meat' && <div><span className="font-semibold">Meats:</span> {meats.length ? meats.join(', ') : '—'}</div>}
        <div><span className="font-semibold">Avoid:</span> {avoid.length ? avoid.join(', ') : '—'}</div>
      </div>
      <div className="mt-6">
        <button className="btn-primary" onClick={handleSave}>Save & Apply</button>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    const key = steps[stepIdx];
    if (key === 'goal') return <StepGoal />;
    if (key === 'tdee') return isWeightLoss ? <StepTDEE /> : <StepCuisines />;
    if (key === 'cuisines') return <StepCuisines />;
    if (key === 'diet') return <StepDiet />;
    if (key === 'avoid') return <StepAvoid />;
    return <StepSummary />;
  };

  return (
    <div className="animate-in">
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-extrabold">Tell us your preferences</h1>
            <span className="text-sm text-gray-500">Step {stepIdx + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-between">
          <button className="btn-ghost flex items-center gap-2" onClick={() => (stepIdx === 0 ? navigate('/') : back())}>
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {stepIdx < steps.length - 1 ? (
            <button className="btn-primary flex items-center gap-2" onClick={next}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>Save & Finish</button>
          )}
        </div>
      </div>
    </div>
  );
}
