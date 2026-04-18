import { useEffect, useMemo, useState } from 'react';
import { Search, Star, Clock, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FoodSearch from '../components/food/FoodSearch';
import ImageUpload from '../components/food/ImageUpload';
import MealLog from '../components/food/MealLog';
import { mealTypes, useFoodStore } from '../store/foodStore';

const API = 'http://127.0.0.1:8000';
const today = () => new Date().toISOString().slice(0, 10);

export default function LogFood() {
  const { logs, addLog, removeLog, recentFoods, favorites, syncFromBackend } = useFoodStore();
  const [mealType, setMealType] = useState('Breakfast');
  const [manual, setManual] = useState({
    food_name: '',
    serving_size: 100,
    serving_unit: 'g',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
  });
  const [aiDetected, setAiDetected] = useState(null);
  const [backendLogs, setBackendLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/food/logs?on=${today()}`);
        const data = await res.json();
        setBackendLogs(data || []);
      } catch { /* offline */ }
    })();
    syncFromBackend(today());
  }, []);

  const todaysLogs = useMemo(() => {
    if (backendLogs.length > 0) return backendLogs;
    return logs.filter((l) => l.consumed_on === today());
  }, [logs, backendLogs]);

  const pushLog = async (entry) => {
    const payload = {
      ...entry,
      meal_type: mealType,
      consumed_on: today(),
    };
    try {
      const res = await fetch(`${API}/food/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      addLog({ ...payload, id: data.id });
      setBackendLogs((prev) => [data, ...prev]);
    } catch {
      addLog(payload);
    }
    toast.success('Meal logged ✓');
    setManual({ food_name: '', serving_size: 100, serving_unit: 'g', calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/food/log/${id}`, { method: 'DELETE' });
      removeLog(id);
      setBackendLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success('Entry removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleFav = async (id) => {
    try {
      await fetch(`${API}/food/log/${id}/favorite`, { method: 'PATCH' });
      setBackendLogs((prev) => prev.map((l) => l.id === id ? { ...l, favorite: !l.favorite } : l));
    } catch { /* offline */ }
  };

  // Scale nutrition when serving size changes
  const handleSelectFood = (item) => {
    setManual((m) => ({
      ...m,
      food_name: item.name,
      serving_size: item.serving_size || 100,
      serving_unit: item.serving_unit || 'g',
      calories: item.calories || 0,
      protein_g: item.protein_g || 0,
      carbs_g: item.carbs_g || 0,
      fats_g: item.fats_g || 0,
    }));
  };

  const handleServingChange = (newSize) => {
    const oldSize = manual.serving_size || 100;
    if (oldSize === 0) return setManual({ ...manual, serving_size: newSize });
    const ratio = newSize / oldSize;
    setManual({
      ...manual,
      serving_size: newSize,
      calories: Math.round(manual.calories * ratio),
      protein_g: +(manual.protein_g * ratio).toFixed(1),
      carbs_g: +(manual.carbs_g * ratio).toFixed(1),
      fats_g: +(manual.fats_g * ratio).toFixed(1),
    });
  };

  // Meal summary
  const mealSummary = useMemo(() => {
    const summary = {};
    mealTypes.forEach(m => {
      const items = todaysLogs.filter(l => l.meal_type === m);
      summary[m] = {
        count: items.length,
        calories: Math.round(items.reduce((a, b) => a + (b.calories || 0), 0)),
      };
    });
    return summary;
  }, [todaysLogs]);

  return (
    <div className="grid gap-4 pb-24 lg:grid-cols-2">
      {/* Left: Add food */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-txt-main">Log Food</h2>

        {/* Meal type tabs */}
        <div className="flex flex-wrap gap-2">
          {mealTypes.map((m) => (
            <button
              key={m}
              onClick={() => setMealType(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                m === mealType
                  ? 'bg-gradient-to-r from-accent-from to-[var(--copper-main)] text-txt-main shadow-md shadow-[var(--accent-from)]/20'
                  : 'border border-border-line bg-bg-card text-txt-main/60 hover:text-txt-main'
              }`}
            >
              {m}
              {mealSummary[m]?.count > 0 && (
                <span className="ml-1.5 text-[9px] opacity-70">({mealSummary[m].calories})</span>
              )}
            </button>
          ))}
        </div>

        {/* Food search */}
        <FoodSearch onSelect={handleSelectFood} />

        {/* Manual entry form */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-txt-main/50">Food Name</label>
            <input value={manual.food_name} onChange={(e) => setManual({ ...manual, food_name: e.target.value })} placeholder="e.g., Grilled Chicken" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Serving</label>
            <input value={manual.serving_size} onChange={(e) => handleServingChange(Number(e.target.value))} type="number" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Unit</label>
            <select value={manual.serving_unit} onChange={(e) => setManual({ ...manual, serving_unit: e.target.value })} className="input">
              <option>g</option><option>ml</option><option>cup</option><option>piece</option><option>oz</option><option>tbsp</option><option>tsp</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Calories</label>
            <input value={manual.calories} onChange={(e) => setManual({ ...manual, calories: Number(e.target.value) })} type="number" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Protein (g)</label>
            <input value={manual.protein_g} onChange={(e) => setManual({ ...manual, protein_g: Number(e.target.value) })} type="number" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Carbs (g)</label>
            <input value={manual.carbs_g} onChange={(e) => setManual({ ...manual, carbs_g: Number(e.target.value) })} type="number" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-txt-main/50">Fats (g)</label>
            <input value={manual.fats_g} onChange={(e) => setManual({ ...manual, fats_g: Number(e.target.value) })} type="number" className="input" />
          </div>
        </div>
        <Button onClick={() => pushLog(manual)} disabled={!manual.food_name}>
          <Plus size={14} className="mr-1" /> Add Entry
        </Button>

        {/* AI image upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-txt-main">📸 AI Image Recognition</h3>
          <ImageUpload onDetected={setAiDetected} />
          {aiDetected?.food_items?.length > 0 && (
            <div className="mt-3 space-y-2 rounded-xl border border-[var(--accent-from)]/20 bg-[var(--accent-from)]/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-txt-main/60">Confidence: <span className="font-medium text-txt-main">{aiDetected.confidence}</span></p>
                <p className="text-xs text-txt-main/60">Total: {aiDetected.total_calories} kcal</p>
              </div>
              {aiDetected.food_items.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-border-line bg-bg-card p-2.5 text-sm text-txt-main/85">
                  <div>
                    <span className="font-medium">{f.name}</span>
                    <span className="ml-2 text-xs text-txt-main/40">{f.estimated_weight_g}g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txt-main/60">{f.calories} kcal</span>
                    <button
                      className="rounded-lg bg-[#43D9AD]/15 px-2 py-1 text-xs font-medium text-[#43D9AD] hover:bg-[#43D9AD]/25"
                      onClick={() =>
                        pushLog({
                          food_name: f.name,
                          serving_size: f.estimated_weight_g,
                          serving_unit: 'g',
                          calories: f.calories,
                          protein_g: f.protein_g,
                          carbs_g: f.carbs_g,
                          fats_g: f.fats_g,
                        })
                      }
                    >
                      + Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Right: Today's meals */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-txt-main">Today&apos;s Meals</h3>
          <span className="text-xs text-txt-main/50">
            {Math.round(todaysLogs.reduce((a, b) => a + (b.calories || 0), 0))} kcal total
          </span>
        </div>

        {/* Meals grouped by type */}
        {mealTypes.filter(m => todaysLogs.some(l => l.meal_type === m)).map((mealType) => (
          <div key={mealType}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--accent-from)]">{mealType}</p>
              <p className="text-[10px] text-txt-main/40">{mealSummary[mealType]?.calories || 0} kcal</p>
            </div>
            <div className="space-y-1.5">
              {todaysLogs.filter(l => l.meal_type === mealType).map((item) => (
                <motion.div
                  key={item.id || item.food_name}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-bg-card px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-txt-main">{item.food_name}</p>
                    <p className="text-[10px] text-txt-main/40">
                      {item.serving_size}{item.serving_unit} • P:{Math.round(item.protein_g)}g C:{Math.round(item.carbs_g)}g F:{Math.round(item.fats_g)}g
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-txt-main/70">{Math.round(item.calories)}</span>
                    <button onClick={() => handleToggleFav(item.id)} className={`rounded p-1 ${item.favorite ? 'text-[#FACC15]' : 'text-txt-main/20 hover:text-txt-main/50'}`}>
                      <Star size={12} fill={item.favorite ? '#FACC15' : 'none'} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="rounded p-1 text-txt-main/20 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {todaysLogs.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <Search size={36} className="mb-3 text-txt-main/15" />
            <p className="text-sm text-txt-main/50">No meals logged today</p>
            <p className="text-xs text-txt-main/30">Search for food or use AI image recognition</p>
          </div>
        )}

        {/* Recent & Favorites */}
        <div className="space-y-3 border-t border-border-line pt-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Clock size={12} className="text-txt-main/40" />
              <h4 className="text-xs font-semibold text-txt-main/70">Recent Foods</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(recentFoods.length > 0 ? recentFoods : []).slice(0, 6).map((f, i) => (
                <button
                  key={`recent-${f.food_name}-${i}`}
                  onClick={() => handleSelectFood({ name: f.food_name, ...f })}
                  className="rounded-full border border-border-line bg-bg-card px-2.5 py-1 text-[10px] text-txt-main/60 transition hover:bg-white/10 hover:text-txt-main"
                >
                  {f.food_name}
                </button>
              ))}
              {recentFoods.length === 0 && <span className="text-[10px] text-txt-main/30">No recent foods</span>}
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Star size={12} className="text-[#FACC15]/60" />
              <h4 className="text-xs font-semibold text-txt-main/70">Favorites</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(favorites.length > 0 ? favorites : []).slice(0, 6).map((f, i) => (
                <button
                  key={`fav-${f.food_name}-${i}`}
                  onClick={() => handleSelectFood({ name: f.food_name, ...f })}
                  className="rounded-full border border-[#FACC15]/20 bg-[#FACC15]/5 px-2.5 py-1 text-[10px] text-[#FACC15]/70 transition hover:bg-[#FACC15]/15"
                >
                  ★ {f.food_name}
                </button>
              ))}
              {favorites.length === 0 && <span className="text-[10px] text-txt-main/30">No favorites yet</span>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
