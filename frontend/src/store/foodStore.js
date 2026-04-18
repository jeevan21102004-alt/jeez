import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-workout', 'Post-workout'];

const API = 'http://127.0.0.1:8000';

export const useFoodStore = create(
  persist(
    (set, get) => ({
      logs: [],
      exercises: [],
      favorites: [],
      recentFoods: [],
      waterByDate: {},
      weightLogs: [],

      addLog: (entry) =>
        set((s) => {
          const logs = [entry, ...s.logs];
          const recentFoods = [entry, ...s.recentFoods.filter((f) => f.food_name !== entry.food_name)].slice(0, 10);
          const favorites = entry.favorite
            ? [entry, ...s.favorites.filter((f) => f.food_name !== entry.food_name)]
            : s.favorites;
          return { logs, recentFoods, favorites };
        }),

      removeLog: (id) =>
        set((s) => ({
          logs: s.logs.filter((l) => l.id !== id),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l)),
          favorites: s.logs.filter((l) => (l.id === id ? !l.favorite : l.favorite)),
        })),

      addExercise: (exercise) => set((s) => ({ exercises: [exercise, ...s.exercises] })),

      removeExercise: (id) =>
        set((s) => ({
          exercises: s.exercises.filter((e) => e.id !== id),
        })),

      setWater: (dateKey, glasses) =>
        set((s) => ({ waterByDate: { ...s.waterByDate, [dateKey]: glasses } })),

      addWeightLog: (entry) =>
        set((s) => ({ weightLogs: [...s.weightLogs, entry] })),

      setWeightLogs: (logs) => set({ weightLogs: logs }),

      getByDate: (dateKey) => get().logs.filter((l) => l.consumed_on === dateKey),

      syncFromBackend: async (dateKey) => {
        try {
          const [foodRes, exRes, waterRes] = await Promise.all([
            fetch(`${API}/food/logs?on=${dateKey}`),
            fetch(`${API}/logs/exercise?on=${dateKey}`),
            fetch(`${API}/logs/water?on=${dateKey}`),
          ]);
          const foods = await foodRes.json();
          const exercises = await exRes.json();
          const water = await waterRes.json();

          set((s) => ({
            logs: [
              ...foods,
              ...s.logs.filter((l) => l.consumed_on !== dateKey),
            ],
            exercises: [
              ...exercises,
              ...s.exercises.filter((e) => e.logged_on !== dateKey),
            ],
            waterByDate: {
              ...s.waterByDate,
              [dateKey]: water?.glasses || 0,
            },
          }));
        } catch {
          // offline-first: silently fail
        }
      },
    }),
    { name: 'calai-food-store' },
  ),
);
