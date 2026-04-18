import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmResetModal({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-line bg-bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-semibold text-txt-main">Reset Today's Progress?</h3>
              <button 
                onClick={onClose}
                className="ml-auto rounded-full p-1 text-txt-main/50 transition hover:bg-txt-main/10 hover:text-txt-main"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="mb-6 text-sm text-txt-main/70">
              This will clear all <b>today's</b> entries, including food, exercise, and water logs. Your previous historical data will remain intact.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-txt-main/70 transition hover:bg-txt-main/10 hover:text-txt-main"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Confirm Reset
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
