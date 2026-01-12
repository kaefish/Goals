
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Award,
  Circle,
  RotateCcw,
  Trash2,
  GripVertical,
  Check
} from 'lucide-react';
import { Goal, DailyLog, ViewType } from './types';
import { getGoals, saveGoals, getLogs, saveLogs } from './services/storage';
import { getAIInsights } from './services/gemini';
import { CATEGORY_COLORS, GOAL_CATEGORIES, DEFAULT_GOALS_LIST } from './constants';
import MonthlyCalendar from './components/MonthlyCalendar';
import WeeklyCalendar from './components/WeeklyCalendar';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [isAiInsightExpanded, setIsAiInsightExpanded] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // New Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategories, setNewGoalCategories] = useState<string[]>([]);

  // Initialize data
  useEffect(() => {
    const savedGoals = getGoals();
    if (savedGoals.length === 0) {
      const initialGoals: Goal[] = DEFAULT_GOALS_LIST.map((g, idx) => ({
        id: `default-${idx}-${Date.now()}`,
        title: g.title,
        categories: g.categories,
        createdAt: Date.now()
      }));
      setGoals(initialGoals);
      saveGoals(initialGoals);
    } else {
      setGoals(savedGoals);
    }
    setLogs(getLogs());
  }, []);

  // Sync data
  useEffect(() => {
    if (goals.length > 0) saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Fetch AI Insights periodically
  useEffect(() => {
    if (goals.length > 0 && logs.length > 0) {
      setIsLoadingInsight(true);
      getAIInsights(goals, logs).then(insight => {
        setAiInsight(insight);
        setIsLoadingInsight(false);
      });
    }
  }, [goals.length, logs.length]);

  const today = new Date().toISOString().split('T')[0];
  
  const selectedLog = useMemo(() => {
    return logs.find(l => l.date === selectedDate) || { date: selectedDate, completedGoalIds: [] };
  }, [logs, selectedDate]);

  const toggleGoalCompletion = (goalId: string) => {
    if (isEditMode) return;
    setLogs(prev => {
      const existing = prev.find(l => l.date === selectedDate);
      if (existing) {
        const isCompleted = existing.completedGoalIds.includes(goalId);
        return prev.map(l => l.date === selectedDate ? {
          ...l,
          completedGoalIds: isCompleted 
            ? l.completedGoalIds.filter(id => id !== goalId)
            : [...l.completedGoalIds, goalId]
        } : l);
      } else {
        return [...prev, { date: selectedDate, completedGoalIds: [goalId] }];
      }
    });
  };

  const addGoal = () => {
    if (newGoalTitle.trim() && newGoalCategories.length > 0) {
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: newGoalTitle.trim(),
        categories: newGoalCategories,
        createdAt: Date.now()
      };
      setGoals([...goals, newGoal]);
      setNewGoalTitle('');
      setNewGoalCategories([]);
    }
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    setLogs(logs.map(l => ({
      ...l,
      completedGoalIds: l.completedGoalIds.filter(gid => gid !== id)
    })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Essential for some browsers
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newGoals = [...goals];
    const draggedItem = newGoals[draggedIndex];
    newGoals.splice(draggedIndex, 1);
    newGoals.splice(dropIndex, 0, draggedItem);
    
    setGoals(newGoals);
    setDraggedIndex(null);
  };

  const handleDateJump = (date: string) => {
    setSelectedDate(date);
    setActiveView('today');
    setIsEditMode(false);
  };

  const shiftDate = (days: number) => {
    const date = new Date(selectedDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === today;

  const streakCount = useMemo(() => {
    let count = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    let checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = sortedLogs.find(l => l.date === dateStr);
      if (log && log.completedGoalIds.length > 0) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return count;
  }, [logs, today]);

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    year: isToday ? undefined : 'numeric'
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GoalStride</h1>
            {!isToday && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase ml-1">Archive</span>}
          </div>
          <p className="text-xs text-slate-500 font-medium">{formattedDate}</p>
        </div>
      </header>

      {/* Date Switcher for 'today' view */}
      {activeView === 'today' && (
        <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between">
          <button onClick={() => shiftDate(-1)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-slate-800">{isToday ? "Today" : formattedDate}</span>
             {!isToday && (
               <button 
                onClick={() => setSelectedDate(today)}
                className="text-[10px] font-bold text-indigo-600 flex items-center"
               >
                 <RotateCcw size={10} className="mr-1" /> Back to Today
               </button>
             )}
          </div>
          <button 
            onClick={() => shiftDate(1)} 
            disabled={isToday}
            className={`p-2 transition-colors ${isToday ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar pb-24">
        {activeView === 'today' && (
          <div className="space-y-6">
            {/* AI Insight Card */}
            {isToday && aiInsight && !isEditMode && (
              <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg relative overflow-hidden group transition-all duration-300 ${isAiInsightExpanded ? 'p-4' : 'p-3'}`}>
                <div className={`absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-all ${isAiInsightExpanded ? 'opacity-20' : 'opacity-0 scale-50'}`}>
                  <TrendingUp size={isAiInsightExpanded ? 64 : 32} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center">
                      <Award size={14} className="mr-1" />
                      AI Insights
                    </h3>
                    <button 
                      onClick={() => setIsAiInsightExpanded(!isAiInsightExpanded)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isAiInsightExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {isAiInsightExpanded && (
                    <p className="text-sm font-medium leading-relaxed mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      {isLoadingInsight ? "Refining your strategy..." : aiInsight}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {!isEditMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-tighter">Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedLog.completedGoalIds.length} <span className="text-sm text-slate-400 font-normal">/ {goals.length}</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-tighter">Current Streak</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {streakCount} <span className="text-sm text-slate-400 font-normal">days</span>
                  </p>
                </div>
              </div>
            )}

            {/* Goal List Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {isEditMode ? "Manage Goals" : (isToday ? "Today's Focus" : "Record for " + formattedDate)}
                </h2>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center transition-colors ${
                    isEditMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                      : 'text-indigo-600 hover:bg-indigo-50 underline decoration-indigo-200'
                  }`}
                >
                  {isEditMode ? <><Check size={14} className="mr-1" /> Done</> : <><Plus size={14} className="mr-1" /> Edit Goals</>}
                </button>
              </div>
              
              {isEditMode && (
                <div className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">New Goal</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="Goal Title..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {GOAL_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNewGoalCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                            newGoalCategories.includes(cat) ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-400 border border-indigo-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={addGoal}
                      disabled={!newGoalTitle.trim() || newGoalCategories.length === 0}
                      className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {goals.length > 0 ? goals.map((goal, index) => (
                  <div 
                    key={goal.id}
                    draggable={isEditMode}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`w-full p-3 rounded-xl border transition-all duration-200 ${
                      isEditMode 
                        ? `bg-white border-slate-200 shadow-md ${draggedIndex === index ? 'opacity-50 border-indigo-400 border-dashed' : ''}` 
                        : (selectedLog.completedGoalIds.includes(goal.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 shadow-sm')
                    }`}
                  >
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 px-1">
                            <GripVertical size={18} />
                          </div>
                          <input 
                            value={goal.title}
                            onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                            className="flex-1 text-sm font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none pb-0.5 appearance-none"
                          />
                          <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-8">
                          {GOAL_CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                const newCats = goal.categories.includes(cat)
                                  ? goal.categories.filter(c => c !== cat)
                                  : [...goal.categories, cat];
                                if (newCats.length > 0) updateGoal(goal.id, { categories: newCats });
                              }}
                              className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all ${
                                goal.categories.includes(cat) ? CATEGORY_COLORS[cat] : 'bg-slate-50 text-slate-300'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleGoalCompletion(goal.id)}
                        className="w-full flex items-center text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-1">
                            {goal.categories.map(cat => (
                              <span key={cat} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${CATEGORY_COLORS[cat]}`}>
                                {cat}
                              </span>
                            ))}
                          </div>
                          <h4 className={`mt-1 font-semibold text-sm text-slate-900 ${selectedLog.completedGoalIds.includes(goal.id) ? 'line-through opacity-40' : ''}`}>
                            {goal.title}
                          </h4>
                        </div>
                        {selectedLog.completedGoalIds.includes(goal.id) ? (
                          <CheckCircle2 className="text-indigo-600" size={20} />
                        ) : (
                          <Circle className="text-slate-200" size={20} />
                        )}
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="bg-slate-100 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                    <p className="text-slate-500 text-sm">No goals set up yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeView === 'week' && (
          <WeeklyCalendar logs={logs} goals={goals} onDateSelect={handleDateJump} />
        )}

        {activeView === 'month' && (
          <MonthlyCalendar logs={logs} goals={goals} onDateSelect={handleDateJump} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center sticky bottom-0 z-10 pb-6 sm:pb-3">
        <NavButton 
          active={activeView === 'today'} 
          onClick={() => { setActiveView('today'); setIsEditMode(false); }} 
          icon={<CheckCircle2 size={24} />} 
          label="Track" 
        />
        <NavButton 
          active={activeView === 'week'} 
          onClick={() => { setActiveView('week'); setIsEditMode(false); }} 
          icon={<BarChart3 size={24} />} 
          label="Week" 
        />
        <NavButton 
          active={activeView === 'month'} 
          onClick={() => { setActiveView('month'); setIsEditMode(false); }} 
          icon={<Calendar size={24} />} 
          label="Month" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
