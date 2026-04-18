import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, AreaChart, Area, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { Calendar, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';

const API = 'http://127.0.0.1:8000';

export default function History() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dayDetail, setDayDetail] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [monthlyRes, insightsRes] = await Promise.all([
          fetch(`${API}/analytics/monthly`),
          fetch(`${API}/analytics/insights`),
        ]);
        const monthly = await monthlyRes.json();
        const insightsData = await insightsRes.json();
        setMonthlyData(monthly.map(d => ({
          ...d,
          date: d.date.slice(5),
          calories_in: Math.round(d.calories_in),
          calories_out: Math.round(d.calories_out),
        })));
        setInsights(insightsData);
      } catch { /* offline */ }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      setLoadingDay(true);
      try {
        const res = await fetch(`${API}/analytics/day/${selectedDate}`);
        const data = await res.json();
        setDayDetail(data);
      } catch { setDayDetail(null); }
      setLoadingDay(false);
    })();
  }, [selectedDate]);

  const macros = useMemo(() => {
    if (!insights) return [];
    return [
      { name: 'Protein', value: Math.round(insights.avg_protein), color: 'var(--accent-from)' },
      { name: 'Carbs', value: Math.round(insights.avg_carbs), color: 'var(--copper-main)' },
      { name: 'Fats', value: Math.round(insights.avg_fats), color: 'var(--accent-to)' },
    ];
  }, [insights]);

  return (
    <div className="space-y-4 pb-24">
      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
            <p className="text-xs text-txt-main/50">Avg Calories/Day</p>
            <p className="mt-1 text-2xl font-bold text-txt-main">{Math.round(insights.avg_calories)}</p>
            <p className="text-xs text-txt-main/40">{insights.total_days_logged} days logged</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border-line bg-bg-card p-4 backdrop-blur-xl">
            <p className="text-xs text-txt-main/50">Avg Burned/Day</p>
            <p className="mt-1 text-2xl font-bold text-[var(--copper-main)]">{Math.round(insights.avg_burned)}</p>
            <p className="text-xs text-txt-main/40">from exercise</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[var(--accent-from)]/20 bg-[var(--accent-from)]/5 p-4 backdrop-blur-xl">
            <p className="text-xs text-txt-main/50"><Award size={12} className="mr-1 inline" /> Best Day</p>
            <p className="mt-1 text-lg font-bold text-[var(--accent-from)]">{Math.round(insights.best_day?.calories || 0)} kcal</p>
            <p className="text-xs text-txt-main/40">{insights.best_day?.date || '—'}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-[var(--copper-main)]/20 bg-[var(--copper-main)]/5 p-4 backdrop-blur-xl">
            <p className="text-xs text-txt-main/50"><AlertCircle size={12} className="mr-1 inline" /> Highest Day</p>
            <p className="mt-1 text-lg font-bold text-[var(--copper-main)]">{Math.round(insights.worst_day?.calories || 0)} kcal</p>
            <p className="text-xs text-txt-main/40">{insights.worst_day?.date || '—'}</p>
          </motion.div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-txt-main">30-Day Calorie Trend</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-from)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--accent-from)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--copper-main)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--copper-main)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="date" stroke="#A3A3B3" fontSize={10} interval={3} />
                <YAxis stroke="#A3A3B3" fontSize={10} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-line)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="calories_in" name="Intake" stroke="var(--accent-from)" fill="url(#calGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="calories_out" name="Burned" stroke="var(--copper-main)" fill="url(#burnGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-txt-main">Avg Macro Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={macros} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>
                  {macros.map((m) => <Cell key={m.name} fill={m.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-line)', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4">
              {macros.map(m => (
                <div key={m.name} className="flex items-center gap-1.5 text-xs text-txt-main/70">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  {m.name}: {m.value}g
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Meal Distribution */}
      {insights?.meal_distribution?.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-txt-main">Calories by Meal Type</h3>
          <div className="space-y-2">
            {insights.meal_distribution.map((m) => (
              <div key={m.meal} className="flex items-center gap-3">
                <span className="w-24 text-xs text-txt-main/70">{m.meal}</span>
                <div className="h-3 flex-1 rounded-full bg-border-line">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-from to-accent-to transition-all duration-500"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
                <span className="w-20 text-right text-xs text-txt-main/50">{Math.round(m.calories)} kcal ({m.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Day Detail */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[var(--accent-from)]" />
            <h3 className="text-sm font-semibold text-txt-main">Day Detail</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-border-line bg-bg-card px-3 py-1.5 text-sm text-txt-main [color-scheme:dark]"
          />
        </div>
        {loadingDay && <p className="text-xs text-txt-main/50">Loading...</p>}
        {dayDetail && !loadingDay && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
              <div className="rounded-xl bg-bg-card p-2 text-center">
                <p className="text-xs text-txt-main/50">Calories</p>
                <p className="text-sm font-bold text-txt-main">{Math.round(dayDetail.totals.calories)}</p>
              </div>
              <div className="rounded-xl bg-bg-card p-2 text-center border border-border-line">
                <p className="text-xs text-txt-main/50">Protein</p>
                <p className="text-sm font-bold text-[var(--accent-from)]">{Math.round(dayDetail.totals.protein)}g</p>
              </div>
              <div className="rounded-xl bg-bg-card p-2 text-center border border-border-line">
                <p className="text-xs text-txt-main/50">Carbs</p>
                <p className="text-sm font-bold text-[var(--copper-main)]">{Math.round(dayDetail.totals.carbs)}g</p>
              </div>
              <div className="rounded-xl bg-bg-card p-2 text-center border border-border-line">
                <p className="text-xs text-txt-main/50">Fats</p>
                <p className="text-sm font-bold text-[var(--accent-to)]">{Math.round(dayDetail.totals.fats)}g</p>
              </div>
              <div className="rounded-xl bg-bg-card p-2 text-center border border-border-line">
                <p className="text-xs text-txt-main/50">Burned</p>
                <p className="text-sm font-bold text-[var(--copper-main)]">{Math.round(dayDetail.totals.burned)}</p>
              </div>
              <div className="rounded-xl bg-bg-card p-2 text-center border border-border-line">
                <p className="text-xs text-txt-main/50">Water</p>
                <p className="text-sm font-bold text-[var(--accent-from)]">{dayDetail.water} 🥤</p>
              </div>
            </div>
            {Object.entries(dayDetail.meals).map(([meal, items]) => (
              <div key={meal}>
                <p className="mb-1 text-xs font-medium text-[var(--accent-from)]">{meal}</p>
                {items.map((item, idx) => (
                  <div key={`${item.food_name}-${idx}`} className="mb-1 flex items-center justify-between rounded-lg border border-border-line bg-bg-card px-3 py-2 text-sm text-txt-main/80">
                    <span>{item.food_name} <span className="text-txt-main/40">({item.serving_size}{item.serving_unit})</span></span>
                    <span className="text-xs text-txt-main/50">{Math.round(item.calories)} kcal</span>
                  </div>
                ))}
              </div>
            ))}
            {Object.keys(dayDetail.meals).length === 0 && (
              <p className="text-sm text-txt-main/40">No food logged for this date</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
