// Shared types for the Logger app

export type Category = 'Movie' | 'Game' | 'Hike' | 'Gym' | 'Event';

export interface LogEntry {
  id: string;         // UUID via crypto.randomUUID()
  title: string;
  category: Category;
  rating: number;     // 1–5, 0.5 increments
  notes: string;
  date: string;       // ISO date string
}

// Rendering position is separate from the log data itself.
// x and y are percentage-based (10–90%) within the game canvas.
export interface CharacterState {
  logId: string;
  x: number;
  y: number;
}
