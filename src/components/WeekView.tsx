import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { useStore } from '../store/useStore';
import type { Task } from '../types';

interface WeekViewProps {
  currentDate: Date;
  onEditTask: (task: Task) => void;
  onSlotClick: (date: string, startSlot: number) => void;
}

const SLOT_HEIGHT = 24; // px per 30-min slot
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = 48;

function slotToTimeLabel(slot: number): string {
  const totalMinutes = slot * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const minuteStr = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;
  return `${displayHour}${minuteStr} ${period}`;
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

export function WeekView({ currentDate, onEditTask, onSlotClick }: WeekViewProps) {
  const { tasks, categories } = useStore();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? tailwindToHex(cat.color) : '#a855f7';
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    return tasks.filter((t) =>
      t.date === dateStr || (t.recurring && t.recurringDays?.includes(dayOfWeek))
    );
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="flex flex-shrink-0 bg-white border-b border-slate-200">
        <div className="w-12 flex-shrink-0" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`flex-1 py-2 text-center border-l border-slate-200 ${
              isToday(day) ? 'bg-purple-50' : ''
            }`}
          >
            <div className="text-xs text-slate-500">{format(day, 'EEE')}</div>
            <div
              className={`text-sm font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
                isToday(day)
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-700'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-12 flex-shrink-0 relative">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start justify-end pr-1"
                style={{ top: `${hour * SLOTS_PER_HOUR * SLOT_HEIGHT}px`, height: `${SLOTS_PER_HOUR * SLOT_HEIGHT}px` }}
              >
                <span className="text-xs text-slate-400 leading-none mt-0.5" style={{ fontSize: '10px' }}>
                  {slotToTimeLabel(hour * 2)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`flex-1 relative border-l border-slate-200 ${isToday(day) ? 'bg-purple-50/30' : ''}`}
                style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}
              >
                {/* Slot rows */}
                {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => (
                  <div
                    key={slot}
                    onClick={() => onSlotClick(dateStr, slot)}
                    className={`absolute left-0 right-0 cursor-pointer hover:bg-purple-100/40 transition-colors ${
                      slot % 2 === 0 ? 'border-t border-slate-200' : 'border-t border-slate-100'
                    }`}
                    style={{ top: `${slot * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                  />
                ))}

                {/* Task blocks */}
                {dayTasks.map((task) => {
                  const color = getCategoryColor(task.categoryId);
                  const top = task.startSlot * SLOT_HEIGHT;
                  const height = task.durationSlots * SLOT_HEIGHT;
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                      className="absolute left-0.5 right-0.5 rounded cursor-pointer overflow-hidden shadow-sm z-10"
                      style={{
                        top: `${top + 1}px`,
                        height: `${Math.max(height - 2, 16)}px`,
                        backgroundColor: color + '33',
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div className="px-1 py-0.5">
                        <div className="text-xs font-medium text-slate-700 truncate flex items-center gap-0.5">
                          {task.completed && <span className="text-green-500">✓</span>}
                          <span style={{ fontSize: '10px' }}>{task.title}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
