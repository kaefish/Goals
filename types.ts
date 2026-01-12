
export interface Goal {
  id: string;
  title: string;
  categories: string[]; // Changed from single category to array
  createdAt: number;
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  completedGoalIds: string[];
}

export type ViewType = 'today' | 'week' | 'month' | 'settings';
