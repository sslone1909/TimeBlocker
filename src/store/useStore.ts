import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Goal, Task, Habit } from '../types';

interface StoreState {
  categories: Category[];
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteCategory: (id: string) => void;
  deleteGoal: (id: string) => void;
  toggleSignal: (id: string) => void;
  rolloverTasks: (today: string) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, date: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Family', color: 'bg-pink-500' },
  { id: 'cat-2', name: 'Business', color: 'bg-blue-500' },
  { id: 'cat-3', name: 'Health', color: 'bg-green-500' },
  { id: 'cat-4', name: 'Finance', color: 'bg-yellow-500' },
];

const defaultGoals: Goal[] = [
  { id: 'goal-1', name: 'Project A', color: 'bg-purple-500' },
  { id: 'goal-2', name: 'Project B', color: 'bg-indigo-500' },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      goals: defaultGoals,
      tasks: [],
      habits: [],

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      addCategory: (cat) =>
        set((state) => ({ categories: [...state.categories, cat] })),

      updateCategory: (cat) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === cat.id ? cat : c)),
        })),

      addGoal: (goal) =>
        set((state) => ({ goals: [...state.goals, goal] })),

      updateGoal: (goal) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goal.id ? goal : g)),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) =>
            t.categoryId === id ? { ...t, categoryId: '' } : t
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          tasks: state.tasks.map((t) =>
            t.goalId === id ? { ...t, goalId: '' } : t
          ),
        })),

      toggleSignal: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          if (task.signal) {
            // Always allow turning off
            return { tasks: state.tasks.map((t) => t.id === id ? { ...t, signal: false } : t) };
          }

          // Turning on: completed tasks have no limit; incomplete tasks capped at 3
          if (!task.completed) {
            const activeSignalCount = state.tasks.filter((t) => t.signal && !t.completed).length;
            if (activeSignalCount >= 3) return state; // block — at limit
          }

          return { tasks: state.tasks.map((t) => t.id === id ? { ...t, signal: true } : t) };
        }),

      rolloverTasks: (today) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            !t.completed && !t.recurring && t.date < today
              ? { ...t, date: today }
              : t
          ),
        })),

      addHabit: (habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),

      updateHabit: (habit) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),

      toggleHabitDate: (id, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const already = h.completedDates.includes(date);
            return {
              ...h,
              completedDates: already
                ? h.completedDates.filter((d) => d !== date)
                : [...h.completedDates, date],
            };
          }),
        })),
    }),
    {
      name: 'timeblock-data',
    }
  )
);
