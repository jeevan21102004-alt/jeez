import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Scale, Target, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useFoodStore } from '../store/foodStore';
import { useUserStore } from '../store/userStore';

const API = 'http://127.0.0.1:8000';

export default function Progress() {
  const { profile, updateProfile } = useUserStore();
  const { logs } = useFoodStore();
  const [weight, setWeight] = useState(profile.weightKg);
  const [weightLogs, setWeightLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [weightRes, insightsRes] = await Promise.all([
          fetch(`${API}/logs/weight`),
          fetch(`${API}/analytics/insights`),
        ]);
        const wLogs = await weightRes.json();
        const insData = await insightsRes.json();
        setWeightLogs(wLogs.map(w => ({
          date: w.logged_on?.slice(5) || '',
          weight: w.weight_kg,
        })));
        setInsights(insData);
        if (wLogs.length > 0) {
          setWeight(wLogs[wLogs.length - 1].weight_kg);
        }
      } catch { /* offline */ }
    })();
  }, []);

  const handleSaveWeight = async () => {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`${API}/logs/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: Number(weight), logged_on: today }),
      });
      const data = await res.json();
      updateProfile({ weightKg: Number(weight) });
      setWeightLogs((prev) => {
        const filtered = prev.filter(w => w.date !== today.slice(5));
        return [...filtered, { date: today.slice(5), weight: Number(weight) }];
      });
      toast.success(`Weight logged: ${weight}kg`);
    } catch {
      toast.error('Failed to save weight');
    }
    setSaving(false);
  };

  const weightChange = useMemo(() => {
    if (weightLogs.length < 2) return 0;
    return (weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1);
  }, [weightLogs]);

  const projectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (profile.timelineWeeks || 12) * 7);
    return d.toDateString();
  }, [profile.timelineWeeks]);

  const avgCalories = useMemo(() => {
    if (!logs.length) return 0;
    return Math.round(logs.reduce((a, b) => a + Number(b.calories || 0), 0) / Math.max(logs.length, 1));
  }, [logs]);

  const progressPct = useMemo(() => {
    const start = weightLogs.length > 0 ? weightLogs[0].weight : profile.weightKg;
    const target = profile.targetWeightKg;
    const current = weight;
    if (start === target) return 100;
    const pct = ((start - current) / (start - target)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [weight, weightLogs, profile]);

  return (
    <div className="space-y-4 pb-24">
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
          <Scale size={18} className="mb-2 text-[var(--accent-from)]" />
          <p className="text-xs text-txt-main/50">Current Weight</p>
          <p className="text-2xl font-bold text-txt-main">{weight}kg</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
          <Target size={18} className="mb-2 text-[var(--copper-main)]" />
          <p className="text-xs text-txt-main/50">Target Weight</p>
          <p className="text-2xl font-bold text-txt-main">{profile.targetWeightKg}kg</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
          {Number(weightChange) <= 0 ? <TrendingDown size={18} className="mb-2 text-[#43D9AD]" /> : <TrendingUp size={18} className="mb-2 text-[#FFB347]" />}
          <p className="text-xs text-txt-main/50">Total Change</p>
          <p className={`text-2xl font-bold ${Number(weightChange) <= 0 ? 'text-[#43D9AD]' : 'text-[#FFB347]'}`}>{weightChange}kg</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
          <Calendar size={18} className="mb-2 text-[#60A5FA]" />
          <p className="text-xs text-txt-main/50">Progress</p>
          <p className="text-2xl font-bold text-txt-main">{progressPct}%</p>
        </motion.div>
      </div>

      {/* Goal Progress Bar */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-txt-main">Goal Progress</h3>
          <span className="text-xs text-txt-main/50">Projected: {projectedDate}</span>
        </div>
        <div className="mt-3 h-4 rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-accent-from to-[#43D9AD]"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-txt-main/50">
          <span>Start: {weightLogs.length > 0 ? weightLogs[0].weight : profile.weightKg}kg</span>
          <span>Target: {profile.targetWeightKg}kg</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weight Chart */}
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-txt-main">Weight Progression</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={weightLogs}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--copper-main)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--copper-main)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="date" stroke="#A3A3B3" fontSize={10} />
                <YAxis stroke="#A3A3B3" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#131322', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12 }} />
                <ReferenceLine y={profile.targetWeightKg} stroke="#43D9AD" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#43D9AD', fontSize: 10 }} />
                <Area type="monotone" dataKey="weight" stroke="var(--copper-main)" fill="url(#weightGrad)" strokeWidth={2.5} dot={{ fill: 'var(--copper-main)', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weight Logging + Stats */}
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-txt-main">Log Weight</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input pr-10"
                placeholder="Weight"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-main/40">kg</span>
            </div>
            <Button onClick={handleSaveWeight} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="space-y-3 rounded-xl border border-border-line bg-bg-card p-4">
            <h4 className="text-xs font-semibold text-txt-main/70">Nutrition Stats</h4>
            <div className="flex items-center justify-between text-sm text-txt-main/70">
              <span>Avg Calories</span>
              <span className="font-medium text-txt-main">{insights?.avg_calories ? Math.round(insights.avg_calories) : avgCalories} kcal</span>
            </div>
            <div className="flex items-center justify-between text-sm text-txt-main/70">
              <span>Avg Protein</span>
              <span className="font-medium text-[#60A5FA]">{insights?.avg_protein ? Math.round(insights.avg_protein) : '—'}g</span>
            </div>
            <div className="flex items-center justify-between text-sm text-txt-main/70">
              <span>Avg Burned</span>
              <span className="font-medium text-[var(--copper-main)]">{insights?.avg_burned ? Math.round(insights.avg_burned) : '—'} kcal</span>
            </div>
            <div className="flex items-center justify-between text-sm text-txt-main/70">
              <span>Daily Calorie Goal</span>
              <span className="font-medium text-txt-main">{profile.calorieGoal} kcal</span>
            </div>
            <div className="flex items-center justify-between text-sm text-txt-main/70">
              <span>Avg Water</span>
              <span className="font-medium text-[#60A5FA]">{insights?.avg_water ? Math.round(insights.avg_water) : '—'} glasses</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
