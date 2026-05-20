import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/useStore';
import type { Task, CustomField } from '../types';

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  prefilledSlot: { date: string; startSlot: number } | null;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
];

const SWATCH_HEX: Record<string, string> = {
  'bg-purple-500': '#a855f7',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-red-500': '#ef4444',
  'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
};

function slotToTimeLabel(slot: number): string {
  const totalMinutes = slot * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const minuteStr = minutes === 0 ? '00' : String(minutes).padStart(2, '0');
  return `${displayHour}:${minuteStr} ${period}`;
}

const DURATION_OPTIONS = [
  { label: '30 min', slots: 1 },
  { label: '1 hr', slots: 2 },
  { label: '1.5 hr', slots: 3 },
  { label: '2 hr', slots: 4 },
  { label: '2.5 hr', slots: 5 },
  { label: '3 hr', slots: 6 },
  { label: '4 hr', slots: 8 },
  { label: '5 hr', slots: 10 },
  { label: '6 hr', slots: 12 },
  { label: '8 hr', slots: 16 },
];

export function TaskModal({ open, task, prefilledSlot, onClose }: TaskModalProps) {
  const { categories, goals, tasks, addTask, updateTask, deleteTask, addCategory, addGoal } = useStore();

  const today = format(new Date(), 'yyyy-MM-dd');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [startSlot, setStartSlot] = useState(0);
  const [durationSlots, setDurationSlots] = useState(2);
  const [categoryId, setCategoryId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [cost, setCost] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [recurring, setRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // New category inline
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-purple-500');

  // New goal inline
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalColor, setNewGoalColor] = useState('bg-purple-500');

  useEffect(() => {
    if (!open) return;

    if (task) {
      setTitle(task.title);
      setDate(task.date);
      setStartSlot(task.startSlot);
      setDurationSlots(task.durationSlots);
      setCategoryId(task.categoryId);
      setGoalId(task.goalId);
      setCost(task.cost != null ? String(task.cost) : '');
      setNotes(task.notes);
      setCompleted(task.completed);
      setCustomFields(task.customFields);
      setRecurring(task.recurring ?? false);
      setRecurringDays(task.recurringDays ?? []);
    } else {
      setTitle('');
      setDate(prefilledSlot?.date ?? today);
      setStartSlot(prefilledSlot?.startSlot ?? 0);
      setDurationSlots(2);
      setCategoryId(categories[0]?.id ?? '');
      setGoalId(goals[0]?.id ?? '');
      setCost('');
      setNotes('');
      setCompleted(false);
      setCustomFields([]);
      setRecurring(false);
      setRecurringDays([]);
    }

    setShowNewCategory(false);
    setNewCatName('');
    setNewCatColor('bg-purple-500');
    setShowNewGoal(false);
    setNewGoalName('');
    setNewGoalColor('bg-purple-500');
  }, [open, task, prefilledSlot]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    const conflict = tasks.find((t) => {
      if (t.id === task?.id) return false;
      if (t.date !== date) return false;
      return startSlot < t.startSlot + t.durationSlots && t.startSlot < startSlot + durationSlots;
    });

    if (conflict) {
      setConflictError(`Conflicts with "${conflict.title}"`);
      return;
    }

    setConflictError(null);
    const savedTask: Task = {
      id: task?.id ?? uuidv4(),
      title: title.trim(),
      date,
      startSlot,
      durationSlots,
      categoryId,
      goalId,
      cost: cost !== '' ? parseFloat(cost) : null,
      completed,
      customFields,
      notes,
      recurring,
      recurringDays: recurring ? recurringDays : [],
    };

    if (task) {
      updateTask(savedTask);
    } else {
      addTask(savedTask);
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = { id: uuidv4(), name: newCatName.trim(), color: newCatColor };
    addCategory(newCat);
    setCategoryId(newCat.id);
    setShowNewCategory(false);
    setNewCatName('');
    setNewCatColor('bg-purple-500');
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) return;
    const newGoal = { id: uuidv4(), name: newGoalName.trim(), color: newGoalColor };
    addGoal(newGoal);
    setGoalId(newGoal.id);
    setShowNewGoal(false);
    setNewGoalName('');
    setNewGoalColor('bg-purple-500');
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { id: uuidv4(), label: '', value: '' }]);
  };

  const handleCustomFieldChange = (id: string, field: 'label' | 'value', val: string) => {
    setCustomFields(customFields.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date + Start Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setConflictError(null); }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <select
                value={startSlot}
                onChange={(e) => { setStartSlot(Number(e.target.value)); setConflictError(null); }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 48 }, (_, i) => (
                  <option key={i} value={i}>{slotToTimeLabel(i)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conflict error */}
          {conflictError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              <span>⚠</span>
              <span>{conflictError} — please choose a different time or duration.</span>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <select
              value={durationSlots}
              onChange={(e) => { setDurationSlots(Number(e.target.value)); setConflictError(null); }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.slots} value={opt.slots}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={showNewCategory ? '__new__' : categoryId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewCategory(true);
                } else {
                  setCategoryId(e.target.value);
                  setShowNewCategory(false);
                }
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="__new__">+ New Category</option>
            </select>
            {showNewCategory && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                      style={{
                        backgroundColor: SWATCH_HEX[c],
                        borderColor: newCatColor === c ? '#1e293b' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goal</label>
            <select
              value={showNewGoal ? '__new__' : goalId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewGoal(true);
                } else {
                  setGoalId(e.target.value);
                  setShowNewGoal(false);
                }
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">— No Goal —</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
              <option value="__new__">+ New Goal</option>
            </select>
            {showNewGoal && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Goal name"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGoalColor(c)}
                      className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                      style={{
                        backgroundColor: SWATCH_HEX[c],
                        borderColor: newGoalColor === c ? '#1e293b' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewGoal(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cost (optional)</label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
              <span className="px-3 text-slate-500 text-sm bg-slate-50 border-r border-slate-300 py-2">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-3 py-2 text-sm text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Custom Fields</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
              >
                + Add Field
              </button>
            </div>
            {customFields.length > 0 && (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                      className="w-1/3 border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="text-slate-400 hover:text-red-500 text-lg leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-slate-700 cursor-pointer">
                Recurring
              </label>
            </div>
            {recurring && (
              <div className="flex gap-1.5 flex-wrap pl-6">
                {[
                  { label: 'M', day: 1 },
                  { label: 'T', day: 2 },
                  { label: 'W', day: 3 },
                  { label: 'T', day: 4 },
                  { label: 'F', day: 5 },
                  { label: 'S', day: 6 },
                  { label: 'S', day: 0 },
                ].map(({ label, day }) => {
                  const active = recurringDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setRecurringDays(active
                          ? recurringDays.filter((d) => d !== day)
                          : [...recurringDays, day])
                      }
                      className={`w-8 h-8 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-purple-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <label htmlFor="completed" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as completed
            </label>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
