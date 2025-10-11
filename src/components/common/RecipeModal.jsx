import React, { useEffect } from 'react';
import { X, Clock, Users, Leaf, Flame, Star, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCookingTime, capitalizeWords } from '../../utils/helpers';

const RecipeModal = ({ recipe, onClose, onToggleFavorite, isFavorite }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!recipe) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: "-50%", x: "-50%", opacity: 0, scale: 0.9 },
    visible: { y: "-50%", x: "-50%", opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="fixed top-1/2 left-1/2 bg-white rounded-2xl shadow-2xl w-[95vw] max-w-4xl h-[90vh] max-h-[800px] flex flex-col"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-64 md:h-80 w-full">
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover rounded-t-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <h2 className="absolute bottom-4 left-6 text-white text-2xl md:text-4xl font-extrabold drop-shadow-lg">
              {recipe.title}
            </h2>
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 transition-all">
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
              <InfoChip icon={Clock} label="Time" value={formatCookingTime(recipe.readyInMinutes)} />
              <InfoChip icon={Users} label="Servings" value={recipe.servings} />
              <InfoChip icon={Flame} label="Calories" value={recipe.nutrition?.calories} unit="kcal" />
              <InfoChip icon={Zap} label="Health Score" value={recipe.healthScore} />
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Summary</h3>
              <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: recipe.summary }} />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.cuisines?.map(c => <span key={c} className="badge bg-secondary-100 text-secondary-800">{capitalizeWords(c)}</span>)}
              {recipe.diets?.map(d => <span key={d} className="badge bg-primary-100 text-primary-800">{capitalizeWords(d)}</span>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.extendedIngredients?.map(ing => (
                    <li key={ing.id} className="flex items-start gap-3">
                      <Leaf className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{ing.original}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.analyzedInstructions?.[0]?.steps.map(step => (
                    <li key={step.number} className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-primary-500 text-white h-6 w-6 rounded-full flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                      <span className="text-gray-700">{step.step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-bold">{recipe.spoonacularScore}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="font-bold">{recipe.aggregateLikes}</span>
              </div>
            </div>
            <button onClick={() => onToggleFavorite(recipe)} className={`btn-primary ${isFavorite ? 'bg-red-600 hover:bg-red-700' : ''}`}>
              <Heart className="h-5 w-5 mr-2" />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoChip = ({ icon: Icon, label, value, unit }) => (
  <div className="bg-gray-100 p-3 rounded-lg">
    <Icon className="h-6 w-6 text-primary-500 mx-auto mb-1" />
    <p className="text-sm text-gray-600 font-medium">{label}</p>
    <p className="text-lg font-bold text-gray-800">
      {value || 'N/A'} {unit}
    </p>
  </div>
);

export default RecipeModal;