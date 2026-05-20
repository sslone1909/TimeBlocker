import { useState } from 'react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useStore } from '../store/useStore';
import { TaskModal } from '../components/TaskModal';
import type { Task } from '../types';

const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-purple-500': '#a855f7', 'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308', 'bg-red-500': '#ef4444', 'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1', 'bg-orange-500': '#f97316',
};
function toHex(c: string) { return TAILWIND_TO_HEX[c] ?? '#a855f7'; }

function friendlyDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today — ' + format(d, 'MMM d, yyyy');
  if (isTomorrow(d)) return 'Tomorrow — ' + format(d, 'MMM d, yyyy');
  if (isYesterday(d)) return 'Yesterday — ' + format(d, 'MMM d, yyyy');
  return format(d, 'EEEE, MMM d, yyyy');
}

interface AllTasksPageProps {
  onAddTask: () => void;
}

export function AllTasksPage({ onAddTask }: AllTasksPageProps) {
  const { tasks, categories, goals, toggleTask, toggleSignal } = useStore();
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeSignalCount = tasks.filter((t) => t.signal && !t.completed).length;

  // Sort all non-recurring tasks by date ascending, then by startSlot
  const sortedTasks = [...tasks]
    .filter((t) => !t.recurring || t.date)
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      return dateCmp !== 0 ? dateCmp : a.startSlot - b.startSlot;
    });

  // Group by date
  const groups: Record<string, Task[]> = {};
  for (const task of sortedTasks) {
    if (!groups[task.date]) groups[task.date] = [];
    groups[task.date].push(task);
  }
  const sortedDates = Object.keys(groups).sort();

  const toggleDateCollapse = (date: string) =>
    setCollapsedDates((prev) => ({ ...prev, [date]: !prev[date] }));

  function TaskRow({ task }: { task: Task }) {
    const cat = categories.find((c) => c.id === task.categoryId);
    const goal = goals.find((g) => g.id === task.goalId);
    const durationMins = task.durationSlots * 30;
    const durationLabel = durationMins >= 60 ? `${durationMins / 60}h` : `${durationMins}m`;
    const canSignal = task.completed || activeSignalCount < 3;

    return (
      <div
        className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        {/* Complete toggle */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
            task.completed
              ? 'bg-purple-600 border-purple-600 text-white'
              : 'border-slate-300 hover:border-purple-400'
          }`}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Title */}
        <div
          className={`flex-1 min-w-0 cursor-pointer ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
          onClick={() => { setEditingTask(task); setShowCompletedModal(true); }}
        >
          <span className="text-sm font-medium truncate block">{task.title}</span>
          {goal && (
            <span className="text-xs text-slate-400 truncate block">{goal.name}</span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {task.recurring && (
            <span className="text-xs text-purple-400" title="Recurring">↻</span>
          )}
          {task.cost != null && (
            <span className="text-xs text-green-600 font-medium">${task.cost}</span>
          )}
          <span className="text-xs text-slate-400">{durationLabel}</span>
          {cat && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: toHex(cat.color) }} />
              <span className="text-xs text-slate-500">{cat.name}</span>
            </div>
          )}
          {/* Signal */}
          <button
            onClick={() => canSignal && toggleSignal(task.id)}
            className={`text-sm transition-colors cursor-pointer ${
              task.signal ? 'text-purple-500' : canSignal ? 'text-slate-200 hover:text-purple-400' : 'text-slate-100 cursor-not-allowed'
            }`}
            title={task.signal ? 'Remove from Signal' : canSignal ? 'Mark as Signal' : 'Signal limit reached'}
          >
            ⚡
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">All Tasks</h1>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1 bg-purple-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          >
            + Add Task
          </button>
        </div>

        {sortedDates.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm">No tasks yet. Add one to get started.</div>
          </div>
        )}

        {/* Date groups */}
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const allTasks = groups[date];
            const incomplete = allTasks.filter((t) => !t.completed);
            const completed = allTasks.filter((t) => t.completed);
            const isCollapsed = collapsedDates[date];

            return (
              <div key={date} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Date header */}
                <button
                  onClick={() => toggleDateCollapse(date)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">{friendlyDate(date)}</span>
                    <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {incomplete.length} remaining · {completed.length} done
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">{isCollapsed ? '+' : '−'}</span>
                </button>

                {!isCollapsed && (
                  <>
                    {/* Incomplete tasks — always expanded */}
                    {incomplete.length === 0 && completed.length > 0 && (
                      <div className="px-4 py-2 text-xs text-slate-400">All tasks complete.</div>
                    )}
                    {incomplete.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}

                    {/* Completed tasks — collapsed by default under a toggle */}
                    {completed.length > 0 && (
                      <CompletedGroup tasks={completed} TaskRow={TaskRow} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      <TaskModal
        open={showCompletedModal}
        task={editingTask}
        prefilledSlot={null}
        onClose={() => { setShowCompletedModal(false); setEditingTask(null); }}
      />
    </div>
  );
}

function CompletedGroup({ tasks, TaskRow }: { tasks: Task[]; TaskRow: React.ComponentType<{ task: Task }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2 border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="text-xs text-slate-400 font-medium">
          {open ? '▾' : '▸'} Completed ({tasks.length})
        </span>
      </button>
      {open && tasks.map((task) => <TaskRow key={task.id} task={task} />)}
    </>
  );
}
