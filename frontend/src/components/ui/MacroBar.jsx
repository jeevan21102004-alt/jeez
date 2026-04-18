import { motion } from 'framer-motion';

export default function MacroBar({ label, current, goal, color }) {
  const pct = Math.min(100, Math.round((current / (goal || 1)) * 100));
  const over = current > goal;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-txt-main/80">{label}</span>
        <span className={over ? 'font-semibold' : 'text-txt-main/50'} style={{ color: over ? 'var(--copper-main)' : undefined }}>
          {Math.round(current)}g
          <span className="text-txt-main/30"> / {Math.round(goal)}g</span>
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: over ? 'var(--copper-main)' : color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}
