import { NavLink } from 'react-router-dom';
import { Home, Utensils, Dumbbell, LineChart, TrendingUp, Settings, Flame } from 'lucide-react';

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Log Food', to: '/log-food', icon: Utensils },
  { label: 'Exercise', to: '/exercise', icon: Dumbbell },
  { label: 'History', to: '/history', icon: LineChart },
  { label: 'Progress', to: '/progress', icon: TrendingUp },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col rounded-r-3xl border-r border-border-line bg-bg-card/90 p-6 lg:flex">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-from to-accent-to shadow-md shadow-[var(--accent-from)]/20">
          <Flame size={18} className="text-bg-base" />
        </div>
        <span className="text-xl font-bold text-txt-main">CalAI</span>
        <span className="ml-auto rounded-full border border-[var(--accent-from)]/30 bg-[var(--accent-from)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent-from)]">PRO</span>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-accent-from/15 to-accent-to/5 text-[var(--accent-from)] shadow-sm'
                  : 'text-txt-main/60 hover:bg-txt-main/10 hover:text-txt-main'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-border-line bg-bg-card p-3">
        <p className="text-xs font-medium text-txt-main">CalAI Premium</p>
        <p className="mt-1 text-[10px] text-txt-main/50">AI-powered nutrition tracking</p>
      </div>
    </aside>
  );
}
