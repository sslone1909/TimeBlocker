import { useState } from 'react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import type { Habit } from '../types';

const COLOR_SWATCHES: Record<string, string> = {
  'bg-purple-500': '#a855f7',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-red-500': '#ef4444',
  'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
};

export function MyDayPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay();

  const { tasks, habits, toggleTask, addHabit, updateHabit, deleteHabit, toggleHabitDate, categories } = useStore();

  const todayTasks = tasks.filter(
    (t) => t.date === today || (t.recurring && t.recurringDays?.includes(dayOfWeek))
  ).sort((a, b) => a.startSlot - b.startSlot);

  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;

  const completedHabits = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;

  const totalItems = totalTasks + totalHabits;
  const completedItems = completedTasks + completedHabits;
  const remainingItems = totalItems - completedItems;

  const pieData =
    totalItems === 0
      ? [{ name: 'No items', value: 1 }]
      : completedItems === totalItems
      ? [{ name: 'Complete', value: 1 }]
      : [
          { name: 'Done', value: completedItems },
          { name: 'Remaining', value: remainingItems },
        ];

  const pieColors =
    totalItems === 0
      ? ['#e2e8f0']
      : completedItems === totalItems
      ? ['#a855f7']
      : ['#a855f7', '#e2e8f0'];

  const slotToTime = (slot: number) => {
    const h = Math.floor(slot / 2);
    const m = slot % 2 === 0 ? '00' : '30';
    const ampm = h < 12 ? 'AM' : 'PM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m} ${ampm}`;
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? (COLOR_SWATCHES[cat.color] ?? '#a855f7') : '#a855f7';
  };

  // Habit management state
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('bg-purple-500');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitColor, setEditHabitColor] = useState('bg-purple-500');

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit({
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      color: newHabitColor,
      completedDates: [],
    });
    setNewHabitName('');
    setNewHabitColor('bg-purple-500');
    setShowAddHabit(false);
  };

  const handleSaveEditHabit = () => {
    if (!editingHabit || !editHabitName.trim()) return;
    updateHabit({ ...editingHabit, name: editHabitName.trim(), color: editHabitColor });
    setEditingHabit(null);
  };

  const completionPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Day</h1>
          <p className="text-sm text-slate-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Today's Tasks */}
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Today's Tasks</h2>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => {
                const color = getCategoryColor(task.categoryId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                      style={{
                        borderColor: color,
                        backgroundColor: task.completed ? color : 'transparent',
                      }}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {slotToTime(task.startSlot)} · {task.durationSlots * 30} min
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Habits */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">Habits</h2>
            <button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
            >
              + Add Habit
            </button>
          </div>

          {showAddHabit && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-3 space-y-3">
              <input
                type="text"
                placeholder="Habit name"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddHabit(); if (e.key === 'Escape') setShowAddHabit(false); }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 flex-wrap">
                {Object.entries(COLOR_SWATCHES).map(([cls, hex]) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setNewHabitColor(cls)}
                    className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                    style={{ backgroundColor: hex, borderColor: newHabitColor === cls ? '#1e293b' : 'transparent' }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddHabit} className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 cursor-pointer">Add</button>
                <button onClick={() => setShowAddHabit(false)} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {habits.length === 0 && !showAddHabit ? (
            <p className="text-sm text-slate-400">No habits yet. Add one to start tracking.</p>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const done = habit.completedDates.includes(today);
                const color = COLOR_SWATCHES[habit.color] ?? '#a855f7';
                const isEditing = editingHabit?.id === habit.id;

                if (isEditing) {
                  return (
                    <div key={habit.id} className="bg-white border border-purple-200 rounded-xl px-4 py-3 shadow-sm space-y-3">
                      <input
                        type="text"
                        value={editHabitName}
                        onChange={(e) => setEditHabitName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditHabit(); if (e.key === 'Escape') setEditingHabit(null); }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(COLOR_SWATCHES).map(([cls, hex]) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setEditHabitColor(cls)}
                            className="w-5 h-5 rounded-full cursor-pointer border-2 transition-all"
                            style={{ backgroundColor: hex, borderColor: editHabitColor === cls ? '#1e293b' : 'transparent' }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveEditHabit} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 cursor-pointer">Save</button>
                        <button onClick={() => setEditingHabit(null)} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
                        <button
                          onClick={() => { if (confirm(`Delete habit "${habit.name}"?`)) { deleteHabit(habit.id); setEditingHabit(null); } }}
                          className="px-3 py-1 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100 cursor-pointer ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm group"
                  >
                    <button
                      onClick={() => toggleHabitDate(habit.id, today)}
                      className="w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer"
                      style={{
                        borderColor: color,
                        backgroundColor: done ? color : 'transparent',
                      }}
                    >
                      {done && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm font-medium ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {habit.name}
                    </span>
                    <button
                      onClick={() => { setEditingHabit(habit); setEditHabitName(habit.name); setEditHabitColor(habit.color); }}
                      className="text-xs text-slate-300 hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer px-1"
                      title="Edit"
                    >
                      ✎
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Day Progress Pie Chart */}
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Day Progress</h2>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i] ?? '#e2e8f0'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-purple-600">{completionPercent}%</span>
                <span className="text-xs text-slate-400">complete</span>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                <span className="text-slate-600">{completedItems} done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 flex-shrink-0" />
                <span className="text-slate-600">{remainingItems} remaining</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Tasks</span>
                <span>{completedTasks} / {totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span>Habits</span>
                <span>{completedHabits} / {totalHabits}</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
