import { motion } from 'framer-motion';
import { Scale, Flame, Activity, Target, Drumstick, Wheat, Droplets } from 'lucide-react';

export default function Step5Results({ results }) {
  if (!results) return null;

  const items = [
    { label: 'BMI', value: `${results.bmi} (${results.bmi_category})`, icon: Scale, color: '#60A5FA' },
    { label: 'BMR', value: `${results.bmr} kcal`, icon: Flame, color: 'var(--copper-main)' },
    { label: 'TDEE', value: `${results.tdee} kcal`, icon: Activity, color: '#43D9AD' },
    { label: 'Daily Goal', value: `${results.daily_calorie_goal} kcal`, icon: Target, color: 'var(--accent-from)' },
    { label: 'Protein', value: `${results.macro_split?.protein_g}g`, icon: Drumstick, color: '#60A5FA' },
    { label: 'Carbs', value: `${results.macro_split?.carbs_g}g`, icon: Wheat, color: '#FB923C' },
    { label: 'Fats', value: `${results.macro_split?.fats_g}g`, icon: Droplets, color: '#FACC15' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-txt-main">Your Personalized Plan 🎯</p>
        <p className="text-xs text-txt-main/50">Based on your profile, here&apos;s your nutrition plan</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map(({ label, value, icon: Icon, color }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-xl border border-border-line bg-bg-card p-3"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <Icon size={14} style={{ color }} />
              <span className="text-[10px] text-txt-main/50">{label}</span>
            </div>
            <p className="text-sm font-semibold text-txt-main">{value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
