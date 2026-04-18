import { Target, TrendingDown, Dumbbell, Flame } from 'lucide-react';

const goals = [
  { label: 'Lose Weight', icon: TrendingDown, desc: 'Calorie deficit to lose fat', color: 'var(--copper-main)' },
  { label: 'Maintain Weight', icon: Target, desc: 'Stay at your current weight', color: '#43D9AD' },
  { label: 'Gain Muscle', icon: Dumbbell, desc: 'Lean bulk with protein focus', color: 'var(--accent-from)' },
  { label: 'Bulk', icon: Flame, desc: 'Calorie surplus for mass', color: '#FFB347' },
];

export default function Step2Goals({ form, update }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-txt-main/60">What&apos;s your primary fitness goal?</p>
      {goals.map(({ label, icon: Icon, desc, color }) => (
        <button
          key={label}
          type="button"
          onClick={() => update({ goal: label })}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
            form.goal === label ? 'border-[var(--accent-from)] bg-[var(--accent-from)]/10' : 'border-border-line hover:border-white/30'
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}20` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-txt-main">{label}</p>
            <p className="text-xs text-txt-main/40">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
