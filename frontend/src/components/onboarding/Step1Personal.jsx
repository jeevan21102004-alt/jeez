export default function Step1Personal({ form, update }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-txt-main/60">Let&apos;s get to know you to create a personalized nutrition plan.</p>
      <div>
        <label className="mb-1 block text-xs text-txt-main/50">Full Name</label>
        <input
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g., Jeevan"
          className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-txt-main/50">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => update({ age: Number(e.target.value) })}
            placeholder="22"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-txt-main/50">Gender</label>
          <select value={form.gender} onChange={(e) => update({ gender: e.target.value })} className="input">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-txt-main/50">Height (cm)</label>
          <input
            type="number"
            value={form.heightCm}
            onChange={(e) => update({ heightCm: Number(e.target.value) })}
            placeholder="175"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-txt-main/50">Weight (kg)</label>
          <input
            type="number"
            value={form.weightKg}
            onChange={(e) => update({ weightKg: Number(e.target.value) })}
            placeholder="78"
            className="input"
          />
        </div>
      </div>
    </div>
  );
}
