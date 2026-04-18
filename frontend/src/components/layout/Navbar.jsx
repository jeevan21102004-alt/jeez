import { Bell, Flame, Moon, Sun, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { formatDatePretty } from '../../utils/formatters';

export default function Navbar() {
  const { profile, updateProfile, streakDays } = useUserStore();
  const isDark = profile.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 mb-4 flex items-center justify-between rounded-2xl border border-border-line bg-bg-card/80 p-4 backdrop-blur-xl">
      <div>
        <p className="text-xs text-txt-main/50">{formatDatePretty()}</p>
        <h1 className="text-lg font-semibold text-txt-main">
          Hi {profile.name || 'there'}{' '}
          <span className="text-base">👋</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {streakDays > 0 && (
          <div className="hidden items-center gap-1 rounded-full border border-[var(--accent-from)]/20 bg-[var(--accent-from)]/10 px-2.5 py-1 text-xs text-[var(--accent-from)] sm:flex">
            <Flame size={12} /> {streakDays}d
          </div>
        )}
        <button
          onClick={() => updateProfile({ theme: isDark ? 'light' : 'dark' })}
          className="rounded-full border border-border-line p-2 text-txt-main/70 transition hover:bg-txt-main/10 hover:text-[var(--accent-from)]"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="rounded-full border border-border-line p-2 text-txt-main/70 transition hover:bg-txt-main/10 hover:text-[var(--accent-from)]">
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-1 rounded-full border border-[var(--accent-from)]/40 bg-gradient-to-r from-accent-from/10 to-accent-to/5 px-3 py-1 text-xs font-medium text-[var(--accent-from)]">
          <Sparkles size={12} className="text-[var(--accent-to)]" />
          Premium
        </div>
      </div>
    </header>
  );
}
