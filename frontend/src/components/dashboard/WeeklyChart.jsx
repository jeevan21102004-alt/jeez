import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-border-line bg-bg-card p-3 shadow-xl">
        <p className="mb-1 text-xs font-medium text-txt-main/70">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {Math.round(p.value)} kcal
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data = [] }) {
  const hasData = data.some((d) => d.calories_in > 0);
  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-txt-main/30">
        Log food to see weekly trends
      </div>
    );
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" stroke="#A3A3B3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#A3A3B3" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#A3A3B3', paddingTop: 8 }} />
          <Bar dataKey="calories_in" name="Intake" fill="var(--accent-from)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="calories_out" name="Burned" fill="var(--copper-main)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart> 
      </ResponsiveContainer>
    </div>
  );
}
