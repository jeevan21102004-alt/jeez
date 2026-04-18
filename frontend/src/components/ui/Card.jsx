import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ className, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'rounded-2xl border border-border-line bg-bg-card p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
