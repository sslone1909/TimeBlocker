import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, isToday } from 'date-fns';
import { CalendarPanel } from './components/CalendarPanel';
import { StatsPanel } from './components/StatsPanel';
import { TaskModal } from './components/TaskModal';
import { CategoryPage } from './components/CategoryPage';
import { AllTasksPage } from './pages/AllTasksPage';
import { MyDayPage } from './pages/MyDayPage';
import { useStore } from './store/useStore';
import type { Task } from './types';
import './index.css';

type ViewType = 'day' | 'week' | 'month' | 'myday';

const COLOR_SWATCHES: Record<string, string> = {
  'bg-purple-500': '#a855f7', 'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308', 'bg-red-500': '#ef4444', 'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1', 'bg-orange-500': '#f97316',
};

function App() {
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory, rolloverTasks } = useStore();
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('timeblock-current-user') || 'null') } catch { return null }
  });
  const [view, setView] = useState<ViewType>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefilledSlot, setPrefilledSlot] = useState<{ date: string; startSlot: number } | null>(null);
  const [statsOpen, setStatsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | string>('calendar');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-purple-500');
  const [showEditCategories, setShowEditCategories] = useState(false);
  const [renamingCatId, setRenamingCatId] = useState<string | null>(null);
  const [renameCatValue, setRenameCatValue] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ id: crypto.randomUUID(), name: newCatName.trim(), color: newCatColor });
    setNewCatName('');
    setNewCatColor('bg-purple-500');
    setShowAddCat(false);
  };

  const handlePrev = () => {
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const formatDateLabel = () => {
    if (view === 'day') {
      if (isToday(currentDate)) return 'Today';
      return format(currentDate, 'MMM d, yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return `Week of ${format(weekStart, 'MMM d')}`;
    } else {
      return format(currentDate, 'MMM yyyy');
    }
  };

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setPrefilledSlot(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setPrefilledSlot(null);
    setModalOpen(true);
  };

  const handleSlotClick = (date: string, startSlot: number) => {
    setEditingTask(null);
    setPrefilledSlot({ date, startSlot });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setPrefilledSlot(null);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  useEffect(() => {
    rolloverTasks(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('timeblock-current-user');
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Row 1: Logo + Tab Nav + User */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="text-xl font-bold text-purple-600 w-32">TimeBlock</div>

        {/* Tab navigation */}
        <div className="flex items-center gap-0.5 flex-wrap justify-center">
          {/* Calendar tab */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calendar
          </button>

          {/* Category tabs */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeTab === cat.id ? 'white' : (COLOR_SWATCHES[cat.color] ?? '#a855f7') }}
              />
              {cat.name}
            </button>
          ))}

          {/* Unassigned projects tab */}
          <button
            onClick={() => setActiveTab('__unassigned__')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === '__unassigned__'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeTab === '__unassigned__' ? 'white' : '#94a3b8' }} />
            Unassigned
          </button>

          {/* Add category button + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="px-2.5 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              title="Add category"
            >
              +
            </button>
            {showAddCat && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-56 space-y-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(COLOR_SWATCHES).map(([cls, hex]) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setNewCatColor(cls)}
                      className="w-5 h-5 rounded-full cursor-pointer border-2 transition-all"
                      style={{ backgroundColor: hex, borderColor: newCatColor === cls ? '#1e293b' : 'transparent' }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddCategory} className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 cursor-pointer">Add</button>
                  <button onClick={() => setShowAddCat(false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded hover:bg-slate-200 cursor-pointer">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User / logout / edit categories */}
        <div className="relative flex flex-col items-end gap-0.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {user?.name && <span className="text-xs text-slate-500 truncate max-w-[100px]">{user.name}</span>}
            <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap">Logout</button>
          </div>
          <button
            onClick={() => { setShowEditCategories(!showEditCategories); setRenamingCatId(null); }}
            className="text-xs text-purple-500 hover:text-purple-700 cursor-pointer whitespace-nowrap"
          >
            Edit Categories
          </button>

          {/* Edit categories dropdown */}
          {showEditCategories && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-72 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Categories</p>
                <button onClick={() => setShowEditCategories(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 group">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_SWATCHES[cat.color] ?? '#a855f7' }} />
                    {renamingCatId === cat.id ? (
                      <input
                        autoFocus
                        value={renameCatValue}
                        onChange={(e) => setRenameCatValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && renameCatValue.trim()) {
                            updateCategory({ ...cat, name: renameCatValue.trim() });
                            setRenamingCatId(null);
                          }
                          if (e.key === 'Escape') setRenamingCatId(null);
                        }}
                        onBlur={() => {
                          if (renameCatValue.trim()) updateCategory({ ...cat, name: renameCatValue.trim() });
                          setRenamingCatId(null);
                        }}
                        className="flex-1 text-sm border border-purple-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <span className="flex-1 text-sm text-slate-700">{cat.name}</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setRenamingCatId(cat.id); setRenameCatValue(cat.name); }}
                        className="text-xs text-purple-400 hover:text-purple-600 cursor-pointer px-1"
                        title="Rename"
                      >✎</button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${cat.name}"? Tasks in this category will become uncategorized.`)) {
                            deleteCategory(cat.id);
                            if (activeTab === cat.id) setActiveTab('calendar');
                          }
                        }}
                        className="text-xs text-slate-300 hover:text-red-500 cursor-pointer px-1"
                        title="Delete"
                      >×</button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-xs text-slate-400 px-2">No categories yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: View toggle + date nav + add task (calendar only) */}
      {activeTab === 'calendar' && (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  view === v ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setView('myday')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === 'myday' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              My Day
            </button>
          </div>
          {view !== 'myday' ? (
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer">&#8249;</button>
              <span className="text-sm font-medium text-slate-700 min-w-[120px] text-center">{formatDateLabel()}</span>
              <button onClick={handleNext} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer">&#8250;</button>
            </div>
          ) : (
            <div />
          )}
          {view !== 'myday' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('__all_tasks__')}
                className="text-sm font-medium text-slate-600 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                All Tasks
              </button>
              <button
                onClick={handleOpenAddTask}
                className="flex items-center gap-1 bg-purple-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
              >
                + Add Task
              </button>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'calendar' ? (
          view === 'myday' ? (
            <MyDayPage />
          ) : (
            <>
              <CalendarPanel
                view={view}
                currentDate={currentDate}
                onEditTask={handleEditTask}
                onSlotClick={handleSlotClick}
                onDayClick={handleDayClick}
              />
              <div className="relative flex-shrink-0 flex">
                <button
                  onClick={() => setStatsOpen(!statsOpen)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors text-slate-500 hover:text-purple-600 text-xs"
                  title={statsOpen ? 'Collapse panel' : 'Expand panel'}
                >
                  {statsOpen ? '›' : '‹'}
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ width: statsOpen ? 320 : 0 }}
                >
                  <div style={{ width: 320 }} className="h-full">
                    <StatsPanel />
                  </div>
                </div>
              </div>
            </>
          )
        ) : activeTab === '__all_tasks__' ? (
          <AllTasksPage onAddTask={handleOpenAddTask} />
        ) : (
          <CategoryPage categoryId={activeTab} />
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        prefilledSlot={prefilledSlot}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
