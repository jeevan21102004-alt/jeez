import { calcBMI, bmiCategory } from '../utils/calculations';

export const useBMI = (weightKg, heightCm) => {
  const bmi = calcBMI(weightKg, heightCm);
  return { bmi, category: bmiCategory(bmi) };
};
