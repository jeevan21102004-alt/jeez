import { useEffect, useMemo, useState } from 'react';
import { Droplets, Flame, Minus, Plus, Utensils, Dumbbell, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import Card from '../components/ui/Card';
import BMIGauge from '../components/ui/BMIGauge';
import CalorieRing from '../components/dashboard/CalorieRing';
import MacroSummary from '../components/dashboard/MacroSummary';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import StatsCards from '../components/dashboard/StatsCards';
import ConfirmResetModal from '../components/ui/ConfirmResetModal';
import { useFoodStore } from '../store/foodStore';
import { useUserStore } from '../store/userStore';
import { useBMI } from '../hooks/useBMI';
import { useCalories } from '../hooks/useCalories';

const API = 'http://127.0.0.1:8000';

export default function Dashboard() {
  const { profile, streakDays, setStreakDays } = useUserStore();
  const { logs, exercises, waterByDate, setWater, syncFromBackend } = useFoodStore();
  const today = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();

  const [weekly, setWeekly] = useState([]);
  const [todayMeals, setTodayMeals] = useState({});
  const [todayExercises, setTodayExercises] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(waterByDate[today] || 0);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, streakRes, dayRes] = await Promise.all([
          fetch(`${API}/analytics/weekly`),
          fetch(`${API}/analytics/streak`),
          fetch(`${API}/analytics/day/${today}`),
        ]);
        const weeklyData = await weeklyRes.json();
        const streakData = await streakRes.json();
        const dayData = await dayRes.json();

        setWeekly(weeklyData.map(d => ({
          date: d.date.slice(5),
          calories_in: Math.round(d.calories_in),
          calories_out: Math.round(d.calories_out),
        })));
        setStreakDays(streakData.streak);
        setTodayMeals(dayData.meals || {});
        setTodayExercises(dayData.exercises || []);
        if (dayData.water !== undefined) {
          setWaterGlasses(dayData.water);
          setWater(today, dayData.water);
        }
      } catch {
        // Fallback to local data
      }
    };
    fetchData();
    syncFromBackend(today);
  }, []);

  const todayLogs = logs.filter((l) => l.consumed_on === today);
  const todayEx = exercises.filter((e) => e.logged_on === today);

  const consumed = useMemo(() => {
    const backendMealCals = Object.values(todayMeals).flat().reduce((a, b) => a + (b.calories || 0), 0);
    const localCals = todayLogs.reduce((a, b) => a + Number(b.calories || 0), 0);
    return Math.round(Math.max(backendMealCals, localCals));
  }, [todayMeals, todayLogs]);

  const burned = useMemo(() => {
    const backendBurned = todayExercises.reduce((a, b) => a + (b.calories_burned || 0), 0);
    const localBurned = todayEx.reduce((a, b) => a + Number(b.calories_burned || 0), 0);
    return Math.round(Math.max(backendBurned, localBurned));
  }, [todayExercises, todayEx]);

  const macros = useMemo(() => {
    const meals = Object.values(todayMeals).flat();
    if (meals.length > 0) {
      return {
        protein: Math.round(meals.reduce((a, b) => a + (b.protein_g || 0), 0)),
        carbs: Math.round(meals.reduce((a, b) => a + (b.carbs_g || 0), 0)),
        fats: Math.round(meals.reduce((a, b) => a + (b.fats_g || 0), 0)),
      };
    }
    return {
      protein: todayLogs.reduce((a, b) => a + Number(b.protein_g || 0), 0),
      carbs: todayLogs.reduce((a, b) => a + Number(b.carbs_g || 0), 0),
      fats: todayLogs.reduce((a, b) => a + Number(b.fats_g || 0), 0),
    };
  }, [todayMeals, todayLogs]);

  const goals = { protein: profile.protein, carbs: profile.carbs, fats: profile.fats };
  const { bmi, category } = useBMI(profile.weightKg, profile.heightCm);
  const { remaining, net } = useCalories({ consumed, burned, goal: profile.calorieGoal });

  const handleWater = async (delta) => {
    const newVal = Math.max(0, waterGlasses + delta);
    setWaterGlasses(newVal);
    setWater(today, newVal);
    try {
      await fetch(`${API}/logs/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glasses: newVal, logged_on: today }),
      });
    } catch { /* offline-first */ }
  };

  const handleResetDay = async () => {
    try {
      const res = await fetch(`${API}/analytics/day/${today}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Reset failed');
      
      setTodayMeals({});
      setTodayExercises([]);
      setWaterGlasses(0);
      setWater(today, 0);
      
      // Clear from local store as well
      useFoodStore.setState(state => ({
        logs: state.logs.filter(l => l.consumed_on !== today),
        exercises: state.exercises.filter(e => e.logged_on !== today)
      }));
      
      setIsResetModalOpen(false);
      toast.success("Today's data has been reset");
    } catch (err) {
      toast.error('Failed to reset day');
    }
  };

  const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-workout', 'Post-workout'];

  return (
    <div className="space-y-4 pb-24">
      {/* Row 1: Calorie Ring + Stats */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <CalorieRing consumed={consumed} goal={profile.calorieGoal} />
            <div className="space-y-4">
              <MacroSummary macros={macros} goals={goals} />
              <button
                onClick={() => navigate('/log-food')}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-accent-from to-[var(--copper-main)] px-4 py-2 text-sm font-semibold text-txt-main shadow-lg shadow-[var(--accent-from)]/30 transition hover:shadow-xl"
              >
                <Plus size={16} className="mr-1" /> Quick-add meal
              </button>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <StatsCards
            remaining={remaining}
            burned={burned}
            net={net}
            water={waterGlasses}
          />
          {/* Water Controls */}
          <div className="flex items-center justify-between rounded-xl border border-[#60A5FA]/20 bg-[#60A5FA]/10 p-3">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-[#60A5FA]" />
              <span className="text-sm text-txt-main/80">Water</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleWater(-1)} className="rounded-full bg-white/10 p-1 text-txt-main/70 hover:bg-white/20">
                <Minus size={14} />
              </button>
              <span className="min-w-[40px] text-center text-sm font-semibold text-txt-main">{waterGlasses}/{profile.waterGoal}</span>
              <button onClick={() => handleWater(1)} className="rounded-full bg-[#60A5FA]/30 p-1 text-[#60A5FA] hover:bg-[#60A5FA]/50">
                <Plus size={14} />
              </button>
            </div>
          </div>
          {/* Streak */}
          <div className="rounded-xl border border-[#43D9AD]/30 bg-[#43D9AD]/10 p-3 text-sm text-txt-main">
            <Flame className="mr-2 inline" size={15} />
            {streakDays || 0} day streak 🔥
          </div>
        </Card>
      </div>

      {/* Row 2: Weekly Chart + BMI */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-txt-main">Weekly Calories</h3>
          <WeeklyChart data={weekly} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-txt-main">BMI Gauge</h3>
          <BMIGauge bmi={bmi} category={category} />
        </Card>
      </div>

      {/* Row 3: Today's Meals & Exercise */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils size={16} className="text-[var(--copper-main)]" />
            <h3 className="text-sm font-semibold text-txt-main">Today&apos;s Meals</h3>
          </div>
          {Object.keys(todayMeals).length > 0 ? (
            mealOrder.filter(m => todayMeals[m]?.length > 0).map((mealType) => (
              <div key={mealType}>
                <p className="mb-1 text-xs font-medium text-[var(--accent-from)]">{mealType}</p>
                {todayMeals[mealType].map((item, idx) => (
                  <div key={`${item.food_name}-${idx}`} className="mb-1 flex items-center justify-between rounded-lg border border-white/5 bg-bg-card px-3 py-2 text-sm text-txt-main/80">
                    <span>{item.food_name}</span>
                    <span className="text-xs text-txt-main/50">{Math.round(item.calories)} kcal</span>
                  </div>
                ))}
              </div>
            ))
          ) : todayLogs.length > 0 ? (
            todayLogs.slice(0, 5).map((item, idx) => (
              <div key={`${item.food_name}-${idx}`} className="flex items-center justify-between rounded-lg border border-white/5 bg-bg-card px-3 py-2 text-sm text-txt-main/80">
                <span>{item.food_name}</span>
                <span className="text-xs text-txt-main/50">{Math.round(item.calories)} kcal</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-txt-main/50">No meals logged today</p>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-[#43D9AD]" />
            <h3 className="text-sm font-semibold text-txt-main">Today&apos;s Exercise</h3>
          </div>
          {todayExercises.length > 0 ? (
            todayExercises.map((ex, idx) => (
              <div key={`${ex.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-white/5 bg-bg-card px-3 py-2 text-sm text-txt-main/80">
                <div>
                  <span className="font-medium">{ex.name}</span>
                  <span className="ml-2 text-xs text-txt-main/50">
                    {ex.exercise_type === 'cardio' ? `${ex.duration_min}min` : `${ex.sets}×${ex.reps}`}
                  </span>
                </div>
                <span className="text-xs text-[var(--copper-main)]">-{Math.round(ex.calories_burned)} kcal</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-txt-main/50">No exercise today</p>
          )}
          <button onClick={() => navigate('/exercise')} className="text-sm text-[var(--accent-from)] hover:underline">
            + Log exercise
          </button>
        </Card>
      </div>

      {/* Row 4: Reset Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="rounded-full border border-red-500/20 px-6 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 hover:border-red-500/40"
        >
          Reset Today's Progress
        </button>
      </div>

      <ConfirmResetModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        onConfirm={handleResetDay} 
      />
    </div>
  );
}
