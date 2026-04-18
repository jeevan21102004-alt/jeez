import { Dumbbell, Home, LineChart, PlusCircle, Settings, Utensils } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/log-food', icon: Utensils, label: 'Log' },
  { to: '/exercise', icon: Dumbbell, label: 'Exercise' },
  { to: '/history', icon: LineChart, label: 'History' },
  { to: '/progress', icon: PlusCircle, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[min(92vw,620px)] -translate-x-1/2 rounded-full border border-border-line bg-bg-card/90 p-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center rounded-full px-1.5 py-2 text-[10px] transition ${
                isActive
                  ? 'bg-gradient-to-r from-accent-from to-accent-to text-bg-base shadow-md shadow-[var(--accent-from)]/20 border border-[#F1D592]/30'
                  : 'text-txt-main/50 hover:text-txt-main hover:bg-border-line/40'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
