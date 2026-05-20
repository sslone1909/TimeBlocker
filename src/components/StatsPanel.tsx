import { useStore } from '../store/useStore';

const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-purple-500': '#a855f7',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-red-500': '#ef4444',
  'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
};

function toHex(color: string): string {
  return TAILWIND_TO_HEX[color] ?? '#a855f7';
}

export function StatsPanel() {
  const { categories, tasks, toggleSignal } = useStore();

  // Signal / Noise split
  const signalTasks = tasks.filter((t) => t.signal);
  const noiseTasks = tasks
    .filter((t) => !t.signal)
    .sort((a, b) => a.date.localeCompare(b.date));
  const activeSignalCount = tasks.filter((t) => t.signal && !t.completed).length;

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Signal Section */}
        <section>
          <div className="mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Signal</h3>
            <p className="text-xs text-slate-400 mt-0.5">Items that must be completed in the next 18 hours</p>
          </div>

          {signalTasks.length === 0 ? (
            <p className="text-xs text-slate-400 mt-2">No signal tasks. Check the ⚡ on a task below.</p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {signalTasks.map((task) => {
                const cat = categories.find((c) => c.id === task.categoryId);
                return (
                  <div key={task.id} className={`flex items-start gap-2 p-2 rounded-lg border ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-purple-50 border-purple-100'}`}>
                    <button
                      onClick={() => toggleSignal(task.id)}
                      className="mt-0.5 flex-shrink-0 text-purple-500 hover:text-purple-700 cursor-pointer"
                      title="Remove from Signal"
                    >
                      ⚡
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium text-slate-700 truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {cat && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: toHex(cat.color) }} />}
                        <span className="text-xs text-slate-400">{task.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Noise Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Noise</h3>
            <span className="text-xs text-slate-400">{activeSignalCount}/3 signal</span>
          </div>

          {noiseTasks.length === 0 ? (
            <p className="text-xs text-slate-400">No tasks.</p>
          ) : (
            <div className="space-y-1">
              {noiseTasks.map((task) => {
                const cat = categories.find((c) => c.id === task.categoryId);
                const canSignal = task.completed || activeSignalCount < 3;
                return (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 group">
                    <button
                      onClick={() => canSignal && toggleSignal(task.id)}
                      className={`flex-shrink-0 text-sm transition-colors cursor-pointer ${canSignal ? 'text-slate-300 hover:text-purple-500' : 'text-slate-200 cursor-not-allowed'}`}
                      title={canSignal ? 'Mark as Signal' : 'Signal limit reached (3 active tasks)'}
                    >
                      ⚡
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs text-slate-700 truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</div>
                    </div>
                    {cat && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: toHex(cat.color) }} />}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
