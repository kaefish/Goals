
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { DailyLog, Goal } from '../types';

interface MonthlyCalendarProps {
  logs: DailyLog[];
  goals: Goal[];
  onDateSelect: (date: string) => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ logs, goals, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const resetToToday = () => setCurrentDate(new Date());

  const totalActions = logs.reduce((sum, log) => {
    // Parse manually to avoid TZ shifts
    const [logYear, logMonth] = log.date.split('-').map(Number);
    if (logYear === year && (logMonth - 1) === month) {
      return sum + log.completedGoalIds.length;
    }
    return sum;
  }, 0);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-white text-slate-300';
    if (goals.length === 0) return 'bg-indigo-50 text-indigo-800';
    const ratio = count / goals.length;
    if (ratio >= 0.8) return 'bg-emerald-500 text-white font-bold';
    if (ratio >= 0.5) return 'bg-emerald-300 text-emerald-900 font-bold';
    if (ratio > 0) return 'bg-emerald-100 text-emerald-800 font-bold';
    return 'bg-white text-slate-800';
  };

  const days = [];
  const offset = firstDayOfMonth(month, year);
  
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`pad-${i}`} className="h-12 w-full"></div>);
  }

  for (let d = 1; d <= daysInMonth(month, year); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateStr);
    const count = log ? log.completedGoalIds.length : 0;
    
    days.push(
      <button 
        key={d} 
        onClick={() => onDateSelect(dateStr)}
        className={`h-12 w-full flex flex-col items-center justify-center rounded-xl border border-slate-50 relative transition-all duration-200 active:scale-90 hover:opacity-80 ${getHeatColor(count)}`}
      >
        <span className="text-xs">{d}</span>
        {count > 0 && (
          <span className="text-[8px] absolute bottom-1 font-bold opacity-80">{count}</span>
        )}
      </button>
    );
  }

  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{monthName} {year}</h2>
          <p className="text-xs text-slate-500 font-medium">{totalActions} total actions this month</p>
        </div>
        <div className="flex space-x-1 items-center">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          {!isCurrentMonth && (
            <button 
              onClick={resetToToday} 
              className="text-[10px] font-bold text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 flex items-center"
            >
              <RotateCcw size={10} className="mr-1" /> Today
            </button>
          )}
          <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">
            {day}
          </div>
        ))}
        {days}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-tighter">Monthly Summary</p>
            <p className="text-sm font-bold text-slate-900">{totalActions} Achievements</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Completion</p>
          <p className="text-lg font-bold text-indigo-600">
            {goals.length > 0 ? Math.round((totalActions / (goals.length * daysInMonth(month, year))) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
