export interface Category {
  id: string;
  name: string;
  color: string; // tailwind bg color class like 'bg-purple-500'
}

export interface Goal {
  id: string;
  name: string;
  color: string;
  categoryId?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Task {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  startSlot: number; // 0-47 (30-min slots, 0 = midnight)
  durationSlots: number; // number of 30-min slots
  categoryId: string;
  goalId: string;
  cost: number | null;
  completed: boolean;
  signal?: boolean;
  recurring?: boolean;
  recurringDays?: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  customFields: CustomField[];
  notes: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string; // tailwind bg color class
  completedDates: string[]; // 'YYYY-MM-DD' strings
}
