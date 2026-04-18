import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({ children, className, variant = 'primary', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition',
        variant === 'primary' &&
          'bg-gradient-to-r from-accent-from to-accent-to text-bg-base shadow-lg shadow-[var(--accent-from)]/20 border border-[#F1D592]/30 hover:shadow-[var(--accent-from)]/50',
        variant === 'ghost' && 'border border-border-line bg-bg-card text-txt-main hover:border-[var(--accent-from)]/50',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
