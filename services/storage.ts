
import { Goal, DailyLog } from '../types';

const GOALS_KEY = 'gs_goals';
const LOGS_KEY = 'gs_logs';

export const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const getGoals = (): Goal[] => {
  const data = localStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs: DailyLog[]) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getLogs = (): DailyLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};
