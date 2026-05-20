import { useRef } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import type { Task } from '../types';

interface DayViewProps {
  currentDate: Date;
  onEditTask: (task: Task) => void;
  onSlotClick: (date: string, startSlot: number) => void;
}

const SLOT_HEIGHT = 28; // px per 30-min slot
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

export function DayView({ currentDate, onEditTask, onSlotClick }: DayViewProps) {
  const { tasks, categories } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayOfWeek = currentDate.getDay();
  const dayTasks = tasks.filter((t) =>
    t.date === dateStr || (t.recurring && t.recurringDays?.includes(dayOfWeek))
  );

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? tailwindToHex(cat.color) : '#a855f7';
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="text-sm font-semibold text-slate-700">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative flex" style={{ minHeight: `${TOTAL_SLOTS * SLOT_HEIGHT}px` }}>
          {/* Time labels column */}
          <div className="w-16 flex-shrink-0 relative">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${hour * SLOTS_PER_HOUR * SLOT_HEIGHT}px`, height: `${SLOTS_PER_HOUR * SLOT_HEIGHT}px` }}
              >
                <span className="text-xs text-slate-400 leading-none mt-0.5">
                  {slotToTimeLabel(hour * 2)}
                </span>
              </div>
            ))}
          </div>

          {/* Slots + Tasks */}
          <div className="flex-1 relative border-l border-slate-200">
            {/* Slot rows */}
            {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => (
              <div
                key={slot}
                onClick={() => onSlotClick(dateStr, slot)}
                className={`absolute left-0 right-0 cursor-pointer hover:bg-purple-50 transition-colors ${
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
                  className="absolute left-1 right-1 rounded-md cursor-pointer overflow-hidden shadow-sm z-10 flex items-start"
                  style={{
                    top: `${top + 1}px`,
                    height: `${height - 2}px`,
                    backgroundColor: color + '22',
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div className="flex-1 px-1.5 py-0.5 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
                      {task.completed && (
                        <span className="text-green-500">&#10003;</span>
                      )}
                      {task.title}
                    </div>
                    {height > SLOT_HEIGHT && (
                      <div className="text-xs text-slate-500">
                        {slotToTimeLabel(task.startSlot)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
