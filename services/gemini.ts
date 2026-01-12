
import { GoogleGenAI } from "@google/genai";
import { Goal, DailyLog } from '../types';

export const getAIInsights = async (goals: Goal[], logs: DailyLog[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Sort logs by date and take the last 7 entries
    const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    const goalMap = goals.reduce((acc, g) => ({ ...acc, [g.id]: g.title }), {} as Record<string, string>);

    const prompt = `
      Act as a world-class life coach and data analyst. 
      The user has the following goals: ${goals.map(g => g.title).join(', ')}.
      
      Here is their recent progress:
      ${recentLogs.map(l => `${l.date}: Completed ${l.completedGoalIds.map(id => goalMap[id]).join(', ')}`).join('\n')}
      
      Based on this data, provide a very short (max 2 sentences), highly encouraging insight or a motivational push. 
      Focus on patterns or potential improvements. Be brief for mobile reading.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep pushing! Consistency is the key to mastering your habits.";
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Your progress is building momentum. Every day counts!";
  }
};
