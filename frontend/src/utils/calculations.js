// BMI
export const calculateBMI = (weight, height) => {
  // height in cm, weight in kg
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60A5FA' };
  if (bmi < 24.9) return { label: 'Normal', color: '#43D9AD' };
  if (bmi < 29.9) return { label: 'Overweight', color: '#FFB347' };
  return { label: 'Obese', color: '#FF6584' };
};

// BMR (Mifflin-St Jeor)
export const calculateBMR = (weight, height, age, gender) => {
  if ((gender || '').toLowerCase() === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
};

// TDEE
export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const normalized = String(activityLevel || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  return Math.round(bmr * (multipliers[normalized] || 1.2));
};

// Daily Calorie Goal
export const calculateCalorieGoal = (tdee, goal) => {
  const adjustments = {
    lose_weight: -500,
    maintain_weight: 0,
    gain_muscle: +300,
    bulk: +500,
  };
  const normalized = String(goal || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  return tdee + (adjustments[normalized] || 0);
};

// Macros
export const calculateMacros = (calories, goal) => {
  const splits = {
    lose_weight: { protein: 0.4, carbs: 0.35, fats: 0.25 },
    maintain_weight: { protein: 0.3, carbs: 0.45, fats: 0.25 },
    gain_muscle: { protein: 0.35, carbs: 0.45, fats: 0.2 },
    bulk: { protein: 0.3, carbs: 0.5, fats: 0.2 },
  };
  const normalized = String(goal || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  const split = splits[normalized] || splits.maintain_weight;
  return {
    protein: Math.round((calories * split.protein) / 4),
    carbs: Math.round((calories * split.carbs) / 4),
    fats: Math.round((calories * split.fats) / 9),
  };
};

// Backward-compatible aliases used in existing components/hooks
export const calcBMI = calculateBMI;
export const bmiCategory = (bmi) => getBMICategory(bmi).label;
export const calcBMR = ({ weightKg, heightCm, age, gender }) =>
  calculateBMR(weightKg, heightCm, age, gender);
export const calcTDEE = (bmr, activityLevel) => calculateTDEE(bmr, activityLevel);
export const calcGoalCalories = (tdee, goal) => calculateCalorieGoal(tdee, goal);
export const calcMacros = (calories, goal) => calculateMacros(calories, goal);
