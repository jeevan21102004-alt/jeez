import { Activity, Info } from 'lucide-react';

const getBfCategory = (bf, gender) => {
  if (!bf) return '';
  const val = Number(bf);
  if (gender === 'Male') {
    if (val < 6) return 'Essential Fat';
    if (val < 14) return 'Athletes';
    if (val < 18) return 'Fitness';
    if (val < 25) return 'Average';
    return 'Obese';
  } else {
    // Female
    if (val < 14) return 'Essential Fat';
    if (val < 21) return 'Athletes';
    if (val < 25) return 'Fitness';
    if (val < 32) return 'Average';
    return 'Obese';
  }
};

export default function Step4BodyComp({ form, update }) {
  const leanMass = form.body_fat_pct ? (100 - Number(form.body_fat_pct) - 5).toFixed(1) : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-txt-main/60">Your current body composition</p>
      
      <div className="space-y-3">
        <label className="text-xs font-semibold text-txt-main/80 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-[var(--accent-from)]" />
          Body Fat %
        </label>
        <div className="relative">
          <input
            type="number"
            min="1" max="80"
            placeholder="e.g. 22"
            value={form.body_fat_pct || ''}
            onChange={(e) => update({ body_fat_pct: e.target.value })}
            className="w-full rounded-xl border border-border-line bg-bg-card p-3 text-txt-main placeholder-white/20 transition focus:border-[var(--accent-from)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-from)]"
          />
          {form.body_fat_pct && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--accent-from)] bg-[var(--accent-from)]/10 px-2 py-1 rounded-md">
              {getBfCategory(form.body_fat_pct, form.gender)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold text-txt-main/80 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-[var(--copper-main)]" />
          Muscle Mass %
        </label>
        <div className="relative">
          <input
            type="number"
            min="1" max="80"
            placeholder="e.g. 42"
            value={form.muscle_mass_pct || ''}
            onChange={(e) => update({ muscle_mass_pct: e.target.value })}
            className="w-full rounded-xl border border-border-line bg-bg-card p-3 text-txt-main placeholder-white/20 transition focus:border-[var(--copper-main)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-main)]"
          />
        </div>
        <p className="text-xs text-txt-main/40 flex items-center gap-1.5 mt-1 border-t border-border-line pt-2">
          <Info size={12} className="shrink-0" />
          {leanMass ? `Roughly ${leanMass}% Lean Mass available` : "Lean mass = 100% − fat% − bone/organ% (est 5%)"}
        </p>
      </div>
    </div>
  );
}
