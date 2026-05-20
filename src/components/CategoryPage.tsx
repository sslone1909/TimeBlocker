import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import { TaskModal } from './TaskModal';
import type { Task } from '../types';

const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-purple-500': '#a855f7', 'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308', 'bg-red-500': '#ef4444', 'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1', 'bg-orange-500': '#f97316',
};

function toHex(color: string) { return TAILWIND_TO_HEX[color] ?? '#a855f7'; }

interface CategoryPageProps {
  categoryId: string;
}

export function CategoryPage({ categoryId }: CategoryPageProps) {
  const { categories, goals, tasks, toggleTask, toggleSignal, addGoal, updateGoal, deleteGoal } = useStore();
  const category = categories.find((c) => c.id === categoryId);

  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-purple-500');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('bg-purple-500');
  const [editCategoryId, setEditCategoryId] = useState('');

  const isUnassigned = categoryId === '__unassigned__';
  const displayName = isUnassigned ? 'Unassigned Projects' : category?.name;
  const displayColor = isUnassigned ? '#94a3b8' : (category ? TAILWIND_TO_HEX[category.color] ?? '#a855f7' : '#a855f7');

  if (!isUnassigned && !category) return <div className="flex-1 flex items-center justify-center text-slate-400">Category not found.</div>;

  const catTasks = isUnassigned ? [] : tasks.filter((t) => t.categoryId === categoryId);
  const activeSignalCount = tasks.filter((t) => t.signal && !t.completed).length;

  // Unassigned tab shows all goals with no categoryId; normal tabs show goals tagged to this category
  const categoryGoals = isUnassigned
    ? goals.filter((g) => !g.categoryId)
    : goals.filter((g) => g.categoryId === categoryId);

  const goalGroups = categoryGoals.map((goal) => ({
    goal,
    tasks: catTasks.filter((t) => t.goalId === goal.id),
  }));

  const unassignedTasks = catTasks.filter((t) => !t.goalId || !categoryGoals.find((g) => g.id === t.goalId));

  const openEdit = (goal: { id: string; name: string; color: string; categoryId?: string }) => {
    setEditingGoalId(goal.id);
    setEditName(goal.name);
    setEditColor(goal.color);
    setEditCategoryId(goal.categoryId ?? categoryId);
  };

  const handleSaveEdit = () => {
    if (!editingGoalId || !editName.trim()) return;
    updateGoal({ id: editingGoalId, name: editName.trim(), color: editColor, categoryId: editCategoryId });
    setEditingGoalId(null);
  };

  const toggleGoal = (id: string) =>
    setExpandedGoals((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAddTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    addGoal({ id: crypto.randomUUID(), name: newProjectName.trim(), color: newProjectColor, categoryId });
    setNewProjectName('');
    setNewProjectColor('bg-purple-500');
    setShowAddProject(false);
  };

  const chartTaskData = [
    ...goalGroups.map(({ goal, tasks: gt }) => ({
      name: goal.name.length > 8 ? goal.name.slice(0, 8) + '…' : goal.name,
      count: gt.length,
      color: toHex(goal.color),
    })),
    ...(unassignedTasks.length > 0 ? [{ name: 'Unassigned', count: unassignedTasks.length, color: '#94a3b8' }] : []),
  ];

  const chartHoursData = [
    ...goalGroups.map(({ goal, tasks: gt }) => ({
      name: goal.name.length > 8 ? goal.name.slice(0, 8) + '…' : goal.name,
      hours: Math.round(gt.reduce((s, t) => s + t.durationSlots * 30, 0) / 60 * 10) / 10,
      color: toHex(goal.color),
    })),
    ...(unassignedTasks.length > 0 ? [{
      name: 'Unassigned',
      hours: Math.round(unassignedTasks.reduce((s, t) => s + t.durationSlots * 30, 0) / 60 * 10) / 10,
      color: '#94a3b8',
    }] : []),
  ];

  function TaskRow({ task }: { task: Task }) {
    const durationMins = task.durationSlots * 30;
    const durationLabel = durationMins >= 60 ? `${durationMins / 60}h` : `${durationMins}m`;
    const canSignal = task.completed || activeSignalCount < 3;

    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 group ${task.completed ? 'opacity-60' : ''}`}>
        <button
          onClick={() => toggleTask(task.id)}
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
            task.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 hover:border-purple-400'
          }`}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div
          className={`flex-1 text-sm cursor-pointer ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
          onClick={() => handleEditTask(task)}
        >
          {task.title}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
          <span>{durationLabel}</span>
          {task.cost != null && <span className="text-green-600">${task.cost}</span>}
          <span>{format(parseISO(task.date), 'MMM d')}</span>
        </div>

        <button
          onClick={() => canSignal && toggleSignal(task.id)}
          className={`flex-shrink-0 text-sm transition-colors cursor-pointer ${
            task.signal ? 'text-purple-500' : canSignal ? 'text-slate-200 hover:text-purple-400' : 'text-slate-100 cursor-not-allowed'
          }`}
          title={task.signal ? 'Remove from Signal' : canSignal ? 'Mark as Signal' : 'Signal limit reached'}
        >
          ⚡
        </button>
      </div>
    );
  }


  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: displayColor }} />
            <h1 className="text-2xl font-bold text-slate-800">{displayName}</h1>
            <span className="text-sm text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {catTasks.length} tasks
            </span>
          </div>
          <button
            onClick={handleAddTask}
            className="flex items-center gap-1 bg-purple-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          >
            + Add Task
          </button>
        </div>

        {/* Projects section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Projects</h2>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              + Add Project
            </button>
          </div>

          {/* Add project inline form */}
          {showAddProject && (
            <div className="bg-white border border-purple-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">New Project</p>
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <p className="text-xs text-slate-500 mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(TAILWIND_TO_HEX).map(([cls, hex]) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setNewProjectColor(cls)}
                      className="w-7 h-7 rounded-full cursor-pointer border-2 transition-all"
                      style={{ backgroundColor: hex, borderColor: newProjectColor === cls ? '#1e293b' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddProject} className="flex-1 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 cursor-pointer">Add Project</button>
                <button onClick={() => setShowAddProject(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {/* Responsive project card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalGroups.map(({ goal, tasks: gt }) => {
              const completed = gt.filter((t) => t.completed).length;
              const pct = gt.length > 0 ? Math.round((completed / gt.length) * 100) : 0;
              const isOpen = expandedGoals[goal.id] !== false;
              const isEditing = editingGoalId === goal.id;
              return (
                <div key={goal.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                  {/* Inline edit form */}
                  {isEditing ? (
                    <div className="px-4 py-4 space-y-3 border-b border-slate-100">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        autoFocus
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5">Color</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {Object.entries(TAILWIND_TO_HEX).map(([cls, hex]) => (
                            <button key={cls} type="button" onClick={() => setEditColor(cls)}
                              className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                              style={{ backgroundColor: hex, borderColor: editColor === cls ? '#1e293b' : 'transparent' }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5">Category</p>
                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="flex-1 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 cursor-pointer">Save</button>
                        <button onClick={() => setEditingGoalId(null)} className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
                        <button onClick={() => { deleteGoal(goal.id); setEditingGoalId(null); }} className="py-1.5 px-3 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100 cursor-pointer">Delete</button>
                      </div>
                    </div>
                  ) : (
                  /* Card header */
                  <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: toHex(goal.color) }} />
                        <span className="text-sm font-semibold text-slate-800 truncate">{goal.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-400">{completed}/{gt.length}</span>
                        <button onClick={() => openEdit(goal)} className="text-purple-400 hover:text-purple-600 cursor-pointer text-base leading-none" title="Edit project">✎</button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{pct}% complete</p>
                  </div>
                  )}

                  {/* Task list (collapsible) */}
                  {isOpen && !isEditing && (
                    <div className="flex-1">
                      {gt.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-slate-400">No tasks yet.</p>
                      ) : (
                        gt.map((t) => <TaskRow key={t.id} task={t} />)
                      )}
                    </div>
                  )}

                  {/* Card footer */}
                  {!isEditing && <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => handleAddTask()}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                    >
                      + Add Task
                    </button>
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {isOpen ? '− Hide' : '+ Show'} tasks
                    </button>
                  </div>}
                </div>
              );
            })}

            {/* Unassigned card */}
            {unassignedTasks.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 bg-slate-300" />
                      <span className="text-sm font-semibold text-slate-800">Unassigned</span>
                    </div>
                    <span className="text-xs text-slate-400">{unassignedTasks.filter(t => t.completed).length}/{unassignedTasks.length}</span>
                  </div>
                </div>
                {expandedGoals['__unassigned__'] !== false && (
                  <div className="flex-1">
                    {unassignedTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                  </div>
                )}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                  <button onClick={handleAddTask} className="text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer">+ Add Task</button>
                  <button onClick={() => toggleGoal('__unassigned__')} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                    {expandedGoals['__unassigned__'] !== false ? '− Hide' : '+ Show'} tasks
                  </button>
                </div>
              </div>
            )}

            {/* Empty state if no goals at all */}
            {goalGroups.length === 0 && unassignedTasks.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm">No projects yet.</div>
                <div className="text-xs mt-1">Click "Add Project" to create your first one.</div>
              </div>
            )}
          </div>
        </section>

        {/* Graphs section */}
        {catTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold text-slate-600 mb-3">Tasks per Project</h3>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartTaskData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartTaskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold text-slate-600 mb-3">Hours per Project</h3>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartHoursData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit="h" />
                      <Tooltip formatter={(v) => [`${v}h`, 'Hours']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                        {chartHoursData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Task modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        prefilledSlot={editingTask ? null : { date: format(new Date(), 'yyyy-MM-dd'), startSlot: 18 }}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
      />
    </div>
  );
}
