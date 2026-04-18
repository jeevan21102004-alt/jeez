const zones = [
  { max: 18.5, color: 'var(--accent-from)', label: 'Underweight' },
  { max: 25, color: '#F1D592', label: 'Normal' },
  { max: 30, color: 'var(--copper-main)', label: 'Overweight' },
  { max: 100, color: '#8C5226', label: 'Obese' },
];

export default function BMIGauge({ bmi = 22, category = 'Normal' }) {
  const pct = Math.min(100, (bmi / 40) * 100);
  const zone = zones.find((z) => bmi < z.max) || zones[zones.length - 1];

  return (
    <div className="space-y-3">
      <div className="text-2xl font-semibold text-txt-main">BMI {bmi}</div>
      <div className="h-3 rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: zone.color }} />
      </div>
      <div className="text-sm text-txt-main/70">{category}</div>
    </div>
  );
}
