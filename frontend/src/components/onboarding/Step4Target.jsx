export default function Step4Target({ form, update }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-txt-main/60">Set your target weight and timeline. We&apos;ll calculate the daily calorie goal needed.</p>
      <div>
        <label className="mb-1 block text-xs text-txt-main/50">Target Weight (kg)</label>
        <input
          type="number"
          value={form.targetWeightKg}
          onChange={(e) => update({ targetWeightKg: Number(e.target.value) })}
          placeholder="72"
          className="input"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-txt-main/50">Timeline (weeks)</label>
        <input
          type="number"
          value={form.timelineWeeks}
          onChange={(e) => update({ timelineWeeks: Number(e.target.value) })}
          placeholder="16"
          className="input"
        />
        <p className="mt-1 text-[10px] text-txt-main/30">Healthy weight change: 0.5–1 kg per week</p>
      </div>
    </div>
  );
}
