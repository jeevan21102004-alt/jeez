import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Timer, Flame, Trash2, Zap, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useFoodStore } from '../store/foodStore';
import { useUserStore } from '../store/userStore';

const API = 'http://127.0.0.1:8000';

const today = () => new Date().toISOString().slice(0, 10);

export default function Exercise() {
  const { profile } = useUserStore();
  const { exercises, addExercise, removeExercise } = useFoodStore();
  const [tab, setTab] = useState('cardio');
  const [exerciseTypes, setExerciseTypes] = useState({ cardio: [], strength: [] });
  const [todayExercises, setTodayExercises] = useState([]);

  // Cardio form
  const [cardioName, setCardioName] = useState('Running');
  const [cardioDuration, setCardioDuration] = useState(30);

  // Strength form
  const [strengthName, setStrengthName] = useState('Bench Press');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);
  const [estMinutes, setEstMinutes] = useState(12);

  useEffect(() => {
    (async () => {
      try {
        const [typesRes, logsRes] = await Promise.all([
          fetch(`${API}/logs/exercise/types`),
          fetch(`${API}/logs/exercise?on=${today()}`),
        ]);
        const types = await typesRes.json();
        const logs = await logsRes.json();
        setExerciseTypes(types);
        setTodayExercises(logs);
        if (types.cardio?.length) setCardioName(types.cardio[0].name);
        if (types.strength?.length) setStrengthName(types.strength[0]);
      } catch { /* offline */ }
    })();
  }, []);

  const currentMET = exerciseTypes.cardio?.find(c => c.name === cardioName)?.met || 6.0;
  const estCalories = Math.round((currentMET * 3.5 * profile.weightKg / 200) * cardioDuration);

  const totalBurned = useMemo(() => {
    return Math.round(todayExercises.reduce((a, b) => a + (b.calories_burned || 0), 0));
  }, [todayExercises]);

  const handleCardio = async () => {
    try {
      const res = await fetch(`${API}/logs/exercise/cardio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cardioName,
          duration_min: cardioDuration,
          weight_kg: profile.weightKg,
          logged_on: today(),
        }),
      });
      const data = await res.json();
      addExercise({ ...data, logged_on: today() });
      setTodayExercises((prev) => [data, ...prev]);
      toast.success(`${cardioName} logged – ${Math.round(data.calories_burned)} kcal burned`);
    } catch {
      toast.error('Failed to log exercise');
    }
  };

  const handleStrength = async () => {
    try {
      const res = await fetch(`${API}/logs/exercise/strength`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: strengthName,
          sets,
          reps,
          weight_kg: weight,
          estimated_minutes: estMinutes,
          logged_on: today(),
        }),
      });
      const data = await res.json();
      addExercise({ ...data, logged_on: today() });
      setTodayExercises((prev) => [data, ...prev]);
      toast.success(`${strengthName} logged`);
    } catch {
      toast.error('Failed to log exercise');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/logs/exercise/${id}`, { method: 'DELETE' });
      removeExercise(id);
      setTodayExercises((prev) => prev.filter((e) => e.id !== id));
      toast.success('Exercise removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="grid gap-4 pb-24 lg:grid-cols-2">
      {/* Left: Log Exercise */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-[#43D9AD]" />
          <h2 className="text-lg font-semibold text-txt-main">Log Exercise</h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-border-line bg-bg-card p-1">
          {['cardio', 'strength'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                tab === t
                  ? 'bg-gradient-to-r from-accent-from to-[var(--copper-main)] text-txt-main shadow'
                  : 'text-txt-main/60 hover:text-txt-main'
              }`}
            >
              {t === 'cardio' ? <Activity size={14} className="mr-1 inline" /> : <Dumbbell size={14} className="mr-1 inline" />}
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'cardio' ? (
            <motion.div key="cardio" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
              <select value={cardioName} onChange={(e) => setCardioName(e.target.value)} className="input">
                {exerciseTypes.cardio.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} (MET {c.met})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Duration (min)</label>
                  <input type="number" value={cardioDuration} onChange={(e) => setCardioDuration(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Est. Calories</label>
                  <div className="flex h-[42px] items-center rounded-xl border border-[var(--copper-main)]/30 bg-[var(--copper-main)]/10 px-3 text-sm font-semibold text-[var(--copper-main)]">
                    <Flame size={14} className="mr-1" />
                    {estCalories} kcal
                  </div>
                </div>
              </div>
              <Button onClick={handleCardio}>Log Cardio</Button>
            </motion.div>
          ) : (
            <motion.div key="strength" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
              <select value={strengthName} onChange={(e) => setStrengthName(e.target.value)} className="input">
                {exerciseTypes.strength.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Sets</label>
                  <input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Reps</label>
                  <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Weight (kg)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-txt-main/60">Est. Minutes</label>
                  <input type="number" value={estMinutes} onChange={(e) => setEstMinutes(Number(e.target.value))} className="input" />
                </div>
              </div>
              <Button onClick={handleStrength}>Log Strength</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Right: Today's Log */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-txt-main">Today&apos;s Exercise</h3>
          <div className="flex items-center gap-1 rounded-full bg-[var(--copper-main)]/15 px-3 py-1 text-sm font-medium text-[var(--copper-main)]">
            <Flame size={14} />
            {totalBurned} kcal
          </div>
        </div>

        {todayExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Dumbbell size={40} className="mb-3 text-txt-main/20" />
            <p className="text-sm text-txt-main/50">No exercises logged today</p>
            <p className="mt-1 text-xs text-txt-main/30">Use the form to log your workout</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayExercises.map((ex) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-xl border border-border-line bg-bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    ex.exercise_type === 'cardio' ? 'bg-[#43D9AD]/15 text-[#43D9AD]' : 'bg-[var(--accent-from)]/15 text-[var(--accent-from)]'
                  }`}>
                    {ex.exercise_type === 'cardio' ? <Activity size={18} /> : <Dumbbell size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-txt-main">{ex.name}</p>
                    <p className="text-xs text-txt-main/50">
                      {ex.exercise_type === 'cardio'
                        ? `${ex.duration_min} min`
                        : `${ex.sets}×${ex.reps} ${ex.weight_kg ? `@ ${ex.weight_kg}kg` : ''}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--copper-main)]">-{Math.round(ex.calories_burned)}</span>
                  <button onClick={() => handleDelete(ex.id)} className="rounded-lg p-1.5 text-txt-main/30 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border-line bg-bg-card p-3 text-center">
            <p className="text-lg font-semibold text-txt-main">{todayExercises.length}</p>
            <p className="text-[10px] text-txt-main/50">Exercises</p>
          </div>
          <div className="rounded-xl border border-border-line bg-bg-card p-3 text-center">
            <p className="text-lg font-semibold text-txt-main">
              {todayExercises.reduce((a, b) => a + (b.duration_min || 0), 0)}
            </p>
            <p className="text-[10px] text-txt-main/50">Minutes</p>
          </div>
          <div className="rounded-xl border border-border-line bg-bg-card p-3 text-center">
            <p className="text-lg font-semibold text-[var(--copper-main)]">{totalBurned}</p>
            <p className="text-[10px] text-txt-main/50">Calories</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
