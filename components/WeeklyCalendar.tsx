
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { DailyLog, Goal } from '../types';

interface WeeklyCalendarProps {
  logs: DailyLog[];
  goals: Goal[];
  onDateSelect: (date: string) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ logs, goals, onDateSelect }) => {
  const [baseDate, setBaseDate] = useState(new Date());

  const getWeekData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate.getTime());
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: log ? log.completedGoalIds.length : 0,
        fullDate: dateStr
      });
    }
    return data;
  };

  const weekData = getWeekData();
  const weeklyTotal = weekData.reduce((sum, d) => sum + d.count, 0);
  const maxPossible = goals.length * 7;

  const shiftWeek = (days: number) => {
    const newDate = new Date(baseDate.getTime());
    newDate.setDate(baseDate.getDate() + days);
    setBaseDate(newDate);
  };

  const isCurrentWeek = baseDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Weekly Progress</h2>
          <p className="text-xs text-slate-500 font-medium">
            {weekData[0].fullDate} — {weekData[6].fullDate}
          </p>
        </div>
        <div className="flex space-x-1 items-center">
          <button 
            onClick={() => shiftWeek(-7)} 
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          {!isCurrentWeek && (
            <button 
              onClick={() => setBaseDate(new Date())}
              className="text-[10px] font-bold text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 flex items-center"
            >
              <RotateCcw size={10} className="mr-1" /> Today
            </button>
          )}
          <button 
            onClick={() => shiftWeek(7)} 
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                labelStyle={{fontWeight: 'bold', fontSize: '12px'}}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                // Fix: Use data.payload to access custom properties in Recharts onClick to avoid TS errors
                onClick={(data: any) => data && data.payload && onDateSelect(data.payload.fullDate)}
                className="cursor-pointer"
              >
                {weekData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count === goals.length && goals.length > 0 ? '#10b981' : '#6366f1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-tighter">Weekly Total</p>
          <p className="text-2xl font-bold text-slate-900">{weeklyTotal} <span className="text-sm text-slate-400 font-normal">Actions</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-tighter">Completion</p>
          <p className="text-2xl font-bold text-indigo-600">
            {maxPossible > 0 ? Math.round((weeklyTotal / maxPossible) * 100) : 0}%
          </p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Breakdown (Tap to Edit)</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {weekData.map((day, idx) => (
            <button 
              key={idx} 
              onClick={() => onDateSelect(day.fullDate)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 ${idx !== 0 ? 'border-t border-slate-50' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${day.count > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                  <span className="text-xs font-bold">{day.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{day.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{day.fullDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 {Array.from({ length: Math.min(goals.length, 5) }).map((_, i) => (
                   <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < day.count ? 'bg-emerald-400' : 'bg-slate-100'}`} 
                   />
                 ))}
                 <span className="ml-2 text-xs font-bold text-slate-600">{day.count}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WeeklyCalendar;
