import { Target, TrendingDown, TrendingUp } from 'lucide-react';

function RecompSummaryCard({ currentBf, targetBf, currentMuscle, targetMuscle, weight }) {
  if (!currentBf || !targetBf || !weight) return null;

  const currentFatKg = (weight * (currentBf / 100)).toFixed(1);
  const targetFatKg = (weight * (targetBf / 100)).toFixed(1);
  const fatDiff = (targetFatKg - currentFatKg).toFixed(1);

  const currentMuscleKg = currentMuscle ? (weight * (currentMuscle / 100)).toFixed(1) : null;
  const targetMuscleKg = targetMuscle ? (weight * (targetMuscle / 100)).toFixed(1) : null;
  const muscleDiff = (targetMuscleKg && currentMuscleKg) ? (targetMuscleKg - currentMuscleKg).toFixed(1) : null;

  return (
    <div className="mt-4 rounded-xl border border-border-line bg-txt-main/5 p-4 text-sm text-txt-main/80 space-y-3">
      <h4 className="font-semibold text-txt-main flex items-center gap-2">
        <Target size={14} className="text-[var(--accent-from)]" /> 
        Recomposition projection
      </h4>
      <div className="flex items-center justify-between">
        <span className="text-txt-main/60">Fat Mass:</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--copper-main)]">
            {currentFatKg}kg → {targetFatKg}kg
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-sm ${Number(fatDiff) <= 0 ? 'bg-[#43D9AD]/20 text-[#43D9AD]' : 'bg-red-500/20 text-red-500'}`}>
            {Number(fatDiff) > 0 ? '+' : ''}{fatDiff}kg
          </span>
        </div>
      </div>

      {(currentMuscleKg && targetMuscleKg) && (
        <div className="flex items-center justify-between border-t border-border-line pt-2">
          <span className="text-txt-main/60">Muscle Mass:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--accent-from)]">
              {currentMuscleKg}kg → {targetMuscleKg}kg
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-sm ${Number(muscleDiff) >= 0 ? 'bg-[#43D9AD]/20 text-[#43D9AD]' : 'bg-[var(--copper-main)]/20 text-[var(--copper-main)]'}`}>
              {Number(muscleDiff) > 0 ? '+' : ''}{muscleDiff}kg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step6TargetComp({ form, update }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-txt-main/60">Where do you want to get to?</p>
      
      <div className="space-y-3">
        <label className="text-xs font-semibold text-txt-main/80 uppercase tracking-widest">
          Target Body Fat %
        </label>
        <div className="relative">
          <input
            type="number"
            min="1" max="70"
            placeholder="e.g. 15"
            value={form.target_body_fat_pct || ''}
            onChange={(e) => update({ target_body_fat_pct: e.target.value })}
            className="w-full rounded-xl border border-border-line bg-bg-card p-3 text-txt-main placeholder-white/20 transition focus:border-[var(--accent-from)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-from)]"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold text-txt-main/80 uppercase tracking-widest">
          Target Muscle Mass %
        </label>
        <div className="relative">
          <input
            type="number"
            min="5" max="80"
            placeholder="e.g. 48"
            value={form.target_muscle_mass_pct || ''}
            onChange={(e) => update({ target_muscle_mass_pct: e.target.value })}
            className="w-full rounded-xl border border-border-line bg-bg-card p-3 text-txt-main placeholder-white/20 transition focus:border-[var(--copper-main)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-main)]"
          />
        </div>
      </div>

      <RecompSummaryCard
        currentBf={form.body_fat_pct}
        targetBf={form.target_body_fat_pct}
        currentMuscle={form.muscle_mass_pct}
        targetMuscle={form.target_muscle_mass_pct}
        weight={form.weightKg}
      />
    </div>
  );
}
