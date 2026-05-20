import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useStore } from '../store/useStore';
import type { Task } from '../types';

interface MonthViewProps {
  currentDate: Date;
  onEditTask: (task: Task) => void;
  onDayClick: (date: Date) => void;
}

function tailwindToHex(color: string): string {
  const map: Record<string, string> = {
    'bg-purple-500': '#a855f7',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-red-500': '#ef4444',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-orange-500': '#f97316',
  };
  return map[color] ?? '#a855f7';
}

export function MonthView({ currentDate, onEditTask, onDayClick }: MonthViewProps) {
  const { tasks, categories } = useStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? tailwindToHex(cat.color) : '#a855f7';
  };

  const getTasksForDay = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    return tasks.filter((t) =>
      t.date === dateStr || (t.recurring && t.recurringDays?.includes(dayOfWeek))
    );
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Chunk into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day name headers */}
      <div className="grid grid-cols-7 bg-white border-b border-slate-200 flex-shrink-0">
        {dayNames.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 h-full" style={{ minHeight: `${weeks.length * 120}px` }}>
          {allDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayDay = isToday(day);
            const visibleTasks = dayTasks.slice(0, 6);
            const overflow = dayTasks.length - visibleTasks.length;

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={`border-b border-r border-slate-200 p-1.5 cursor-pointer hover:bg-purple-50/50 transition-colors flex flex-col min-h-[100px] ${
                  !isCurrentMonth ? 'bg-slate-50/70' : 'bg-white'
                }`}
              >
                {/* Day number */}
                <div className="flex items-center mb-1">
                  <span
                    className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      todayDay
                        ? 'bg-purple-600 text-white'
                        : isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Task pills */}
                <div className="flex flex-col gap-0.5 flex-1">
                  {visibleTasks.map((task) => {
                    const color = getCategoryColor(task.categoryId);
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                        className="flex items-center gap-1 rounded px-1 py-0.5 cursor-pointer hover:opacity-80 truncate"
                        style={{ backgroundColor: color + '22', borderLeft: `2px solid ${color}` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-slate-700 truncate">
                          {task.completed ? '✓ ' : ''}{task.title}
                        </span>
                      </div>
                    );
                  })}
                  {overflow > 0 && (
                    <div className="text-xs text-slate-400 pl-1">+{overflow} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
