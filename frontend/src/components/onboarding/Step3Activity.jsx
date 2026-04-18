const levels = [
  { label: 'Sedentary', desc: 'Desk job, little exercise', emoji: '🪑' },
  { label: 'Lightly Active', desc: 'Light exercise 1-3 days/week', emoji: '🚶' },
  { label: 'Moderately Active', desc: 'Exercise 3-5 days/week', emoji: '🏃' },
  { label: 'Very Active', desc: 'Hard exercise 6-7 days/week', emoji: '💪' },
  { label: 'Athlete', desc: 'Pro-level training', emoji: '🏆' },
];

export default function Step3Activity({ form, update }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-txt-main/60">How active are you on a typical week?</p>
      {levels.map(({ label, desc, emoji }) => (
        <button
          key={label}
          type="button"
          onClick={() => update({ activityLevel: label })}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
            form.activityLevel === label ? 'border-[var(--accent-from)] bg-[var(--accent-from)]/10' : 'border-border-line hover:border-white/30'
          }`}
        >
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-medium text-txt-main">{label}</p>
            <p className="text-xs text-txt-main/40">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
