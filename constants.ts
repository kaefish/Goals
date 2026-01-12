
export const GOAL_CATEGORIES = [
  'Health',
  'Learning',
  'Productivity',
  'Mindfulness',
  'Finance',
  'Other'
];

export const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-emerald-100 text-emerald-700',
  Learning: 'bg-blue-100 text-blue-700',
  Productivity: 'bg-amber-100 text-amber-700',
  Mindfulness: 'bg-purple-100 text-purple-700',
  Finance: 'bg-indigo-100 text-indigo-700',
  Other: 'bg-slate-100 text-slate-700',
};

export const DEFAULT_GOALS_LIST = [
  { title: 'Meditate', categories: ['Mindfulness'] },
  { title: 'Practice ASL', categories: ['Learning'] },
  { title: 'Practice Spanish', categories: ['Learning'] },
  { title: 'Walk', categories: ['Health', 'Mindfulness'] },
  { title: 'Hit Protein Goal', categories: ['Health'] },
  { title: 'Pamper / Self Care', categories: ['Mindfulness'] },
  { title: 'Complete the Crossword', categories: ['Learning'] },
  { title: 'Cook', categories: ['Productivity'] },
  { title: 'Ali', categories: ['Other'] },
  { title: 'Clean', categories: ['Productivity'] },
  { title: 'Read', categories: ['Learning'] },
  { title: 'Write', categories: ['Learning'] },
  { title: 'Journal', categories: ['Mindfulness'] },
  { title: 'Workout', categories: ['Health'] },
];
