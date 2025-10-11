import React, { useState, useCallback } from 'react';
import { BrainCircuit, Sparkles, BarChart, Sliders, AlertTriangle, Info } from 'lucide-react';
import mockAIService from '../services/aiService';
import { cn } from '../utils/helpers';
import NutritionSkeleton from '../components/common/NutritionSkeleton';

const Calculator = () => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(1);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }
    setLoading(true);
    setError(null);
    setNutrition(null);
    try {
      const result = await mockAIService.getNutritionAnalysis(ingredients);
      setNutrition(result);
      setError(null);
    } catch (err) {
      setError('Could not calculate nutrition. Please check the ingredients and try again.');
      setNutrition(null);
    } finally {
      setLoading(false);
    }
  };

  const handleServingsChange = (e) => {
    const value = Math.max(1, Math.min(10, Number(e.target.value)));
    setServings(value);
  };

  const perServing = (value) => {
    if (!value || servings <= 0) return 0;
    return (value / servings).toFixed(1);
  };

  const renderResult = () => {
    if (loading) {
      return <NutritionSkeleton />;
    }

    if (error) {
      return (
        <div className="mt-8 text-center text-red-500 bg-red-50 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
          <p className="font-semibold">{error}</p>
        </div>
      );
    }

    if (!nutrition) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="card animate-in"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart className="h-7 w-7 text-secondary-500" />
          Estimated Nutrition
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <NutritionStat label="Calories" value={nutrition.calories} servingValue={perServing(nutrition.calories)} unit="kcal" color="text-primary-600" />
          <NutritionStat label="Protein" value={nutrition.protein} servingValue={perServing(nutrition.protein)} unit="g" color="text-green-600" />
          <NutritionStat label="Carbs" value={nutrition.carbs} servingValue={perServing(nutrition.carbs)} unit="g" color="text-blue-600" />
          <NutritionStat label="Fat" value={nutrition.fat} servingValue={perServing(nutrition.fat)} unit="g" color="text-orange-600" />
        </div>

        {nutrition.warnings && nutrition.warnings.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-800">Warnings</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {nutrition.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 flex items-center gap-2">
          <Info className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <p>
            This is an AI-generated estimate. Confidence: <span className="font-bold text-gray-800">{(nutrition.confidence * 100).toFixed(0)}%</span>. 
            {nutrition.cached && <span className="ml-2 badge bg-blue-100 text-blue-800">From Cache</span>}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="animate-in max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <div className="inline-block bg-primary-100 p-3 rounded-full mb-4">
          <BrainCircuit className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">
          AI Nutrition <span className="text-gradient">Calculator</span>
        </h1>
        <p className="text-lg text-gray-600">
          Paste any ingredient list and get an instant, AI-powered nutrition estimate.
        </p>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <textarea
              id="ingredients"
              rows="8"
              className="input-field w-full text-base"
              placeholder="e.g., 2 cups of flour, 100g of chicken breast, 1 tbsp of olive oil"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleCalculate}
            disabled={loading || !ingredients.trim()}
            className="btn-primary btn-lg w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Calculating...
              </>
            ) : (
              'Calculate Nutrition'
            )}
          </button>
        </div>
      </div>

      {renderResult()}
    </div>
  );
};

const NutritionStat = ({ label, value, servingValue, unit, color }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-sm font-medium text-gray-800">{label} <span className="text-gray-500">({unit})</span></p>
    <p className="text-xs text-gray-500 mt-1">{servingValue} per serving</p>
  </div>
);

export default Calculator;
