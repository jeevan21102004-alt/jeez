import { useMemo } from 'react';

export const useCalories = ({ consumed = 0, burned = 0, goal = 2000 }) => {
  return useMemo(() => {
    const net = consumed - burned;
    const remaining = goal - net;
    const pct = Math.max(0, Math.min(100, (net / goal) * 100));
    return { net, remaining, pct };
  }, [consumed, burned, goal]);
};
