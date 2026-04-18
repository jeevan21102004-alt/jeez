import { useState } from 'react';
import { User, Target, Droplets, Palette, RotateCcw, Save, Download, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BodyScanUpload from '../components/ui/BodyScanUpload';
import { useUserStore } from '../store/userStore';
import { useFoodStore } from '../store/foodStore';

const API = 'http://127.0.0.1:8000';

export default function Settings() {
  const { profile, updateProfile, resetAll, setOnboarded } = useUserStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name || undefined,
          calorie_goal: profile.calorieGoal,
          protein_g: profile.protein,
          carbs_g: profile.carbs,
          fats_g: profile.fats,
          units: profile.units,
          theme: profile.theme,
          water_goal_glasses: profile.waterGoal,
          age: profile.age,
          height_cm: profile.heightCm,
          weight_kg: profile.weightKg,
          body_fat_pct: profile.body_fat_pct ? Number(profile.body_fat_pct) : null,
          muscle_mass_pct: profile.muscle_mass_pct ? Number(profile.muscle_mass_pct) : null,
          target_body_fat_pct: profile.target_body_fat_pct ? Number(profile.target_body_fat_pct) : null,
          target_muscle_mass_pct: profile.target_muscle_mass_pct ? Number(profile.target_muscle_mass_pct) : null,
        }),
      });
      toast.success('Settings saved to server');
    } catch {
      toast.error('Could not sync to server – saved locally');
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!confirm('Reset all data? You will need to re-onboard.')) return;
    try {
      await fetch(`${API}/user/reset`, { method: 'POST' });
    } catch { /* ok */ }
    resetAll();
    localStorage.removeItem('calai-food-store');
    setOnboarded(false);
    toast.success('Data reset');
  };

  const handleExport = () => {
    const data = {
      profile,
      foodLogs: useFoodStore.getState().logs,
      exercises: useFoodStore.getState().exercises,
      water: useFoodStore.getState().waterByDate,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Profile Section */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[var(--accent-from)]" />
          <h3 className="text-sm font-semibold text-txt-main">Profile</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Age</label>
            <input
              className="input"
              value={profile.age}
              onChange={(e) => updateProfile({ age: Number(e.target.value) })}
              type="number"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Height (cm)</label>
            <input
              className="input"
              value={profile.heightCm}
              onChange={(e) => updateProfile({ heightCm: Number(e.target.value) })}
              type="number"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Weight (kg)</label>
            <input
              className="input"
              value={profile.weightKg}
              onChange={(e) => updateProfile({ weightKg: Number(e.target.value) })}
              type="number"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Gender</label>
            <select className="input" value={profile.gender} onChange={(e) => updateProfile({ gender: e.target.value })}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Goal</label>
            <select className="input" value={profile.goal} onChange={(e) => updateProfile({ goal: e.target.value })}>
              <option>Lose Weight</option>
              <option>Maintain Weight</option>
              <option>Gain Muscle</option>
              <option>Bulk</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Nutrition Goals */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-[var(--copper-main)]" />
          <h3 className="text-sm font-semibold text-txt-main">Nutrition Goals</h3>
        </div>
        <div>
          <label className="mb-1 block text-xs text-txt-main/50">Daily Calorie Goal</label>
          <input
            className="input"
            value={profile.calorieGoal}
            onChange={(e) => updateProfile({ calorieGoal: Number(e.target.value) })}
            type="number"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Protein (g)</label>
            <input className="input" value={profile.protein} onChange={(e) => updateProfile({ protein: Number(e.target.value) })} type="number" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Carbs (g)</label>
            <input className="input" value={profile.carbs} onChange={(e) => updateProfile({ carbs: Number(e.target.value) })} type="number" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Fats (g)</label>
            <input className="input" value={profile.fats} onChange={(e) => updateProfile({ fats: Number(e.target.value) })} type="number" />
          </div>
        </div>
      </Card>

      {/* Body Composition */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#60A5FA]" />
          <h3 className="text-sm font-semibold text-txt-main">Body composition</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Current Body Fat %</label>
            <input className="input" value={profile.body_fat_pct || ''} onChange={(e) => updateProfile({ body_fat_pct: e.target.value })} type="number" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Current Muscle Mass %</label>
            <input className="input" value={profile.muscle_mass_pct || ''} onChange={(e) => updateProfile({ muscle_mass_pct: e.target.value })} type="number" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Target Body Fat %</label>
            <input className="input" value={profile.target_body_fat_pct || ''} onChange={(e) => updateProfile({ target_body_fat_pct: e.target.value })} type="number" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Target Muscle Mass %</label>
            <input className="input" value={profile.target_muscle_mass_pct || ''} onChange={(e) => updateProfile({ target_muscle_mass_pct: e.target.value })} type="number" />
          </div>
        </div>
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-txt-main/80 mb-2 uppercase tracking-wide">AI Photo Scan</h4>
          <BodyScanUpload 
            onUseEstimates={(est) => updateProfile({ 
              body_fat_pct: est.body_fat_pct, 
              muscle_mass_pct: est.muscle_mass_pct 
            })} 
          />
        </div>
      </Card>

      {/* Preferences */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-[#43D9AD]" />
          <h3 className="text-sm font-semibold text-txt-main">Preferences</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Units</label>
            <select className="input" value={profile.units} onChange={(e) => updateProfile({ units: e.target.value })}>
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, ft)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Theme</label>
            <select className="input" value={profile.theme} onChange={(e) => updateProfile({ theme: e.target.value })}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Water Goal (glasses)</label>
            <input className="input" value={profile.waterGoal} onChange={(e) => updateProfile({ waterGoal: Number(e.target.value) })} type="number" />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save size={14} className="mr-1" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="ghost" onClick={handleExport}>
          <Download size={14} className="mr-1" />
          Export Data
        </Button>
        <Button variant="ghost" onClick={handleReset} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          <RotateCcw size={14} className="mr-1" />
          Reset All Data
        </Button>
      </div>
    </div>
  );
}
