import { motion } from 'framer-motion';

const ringColor = (pct) => {
  if (pct > 100) return { from: 'var(--copper-main)', to: 'var(--copper-main)', glow: 'var(--accent-glow)' };
  return { from: 'var(--accent-from)', to: 'var(--accent-to)', glow: 'var(--accent-glow)' };
};

export default function CalorieRing({ consumed = 0, goal = 2000 }) {
  const pct = Math.min(110, Math.round((consumed / (goal || 1)) * 100));
  const clampedPct = Math.min(100, pct);
  const colors = ringColor(pct);

  const size = 176;
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (clampedPct / 100) * circ;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-4 rounded-full blur-2xl opacity-25"
        style={{ background: colors.glow }}
      />
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border-line)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold leading-none text-txt-main">{Math.round(consumed)}</span>
        <span className="mt-0.5 text-xs text-txt-main/40">/ {goal} kcal</span>
        <span className="mt-1 text-[10px] font-medium" style={{ color: colors.from }}>{pct}%</span>
      </div>
    </motion.div>
  );
}
