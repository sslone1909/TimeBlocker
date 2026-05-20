import type { Task } from '../types';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

interface CalendarPanelProps {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  onEditTask: (task: Task) => void;
  onSlotClick: (date: string, startSlot: number) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarPanel({ view, currentDate, onEditTask, onSlotClick, onDayClick }: CalendarPanelProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          onEditTask={onEditTask}
          onSlotClick={onSlotClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          onEditTask={onEditTask}
          onSlotClick={onSlotClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          onEditTask={onEditTask}
          onDayClick={onDayClick}
        />
      )}
    </div>
  );
}
