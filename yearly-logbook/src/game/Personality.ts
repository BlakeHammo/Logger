import type { LogEntry, Category } from '../types';

export interface CharacterPersonality {
  category: Category;
  rating: number;           // 1–5
  mood: number;             // 1–5 (default 3 if not recorded)
  solo: boolean;            // true = introverted tendency
  recency: number;          // 0–1; 1.0 = logged today, decays to 0 over 30 days
  awarenessRadius: number;  // px — how far the character "sees" others
  maxSpeed: number;         // px/s baseline
  mass: number;             // 0.9–2.1 — heavier = harder to redirect
  date: string;             // ISO string — used for same-day bonding
}

// Base speed per category reflects real-world energy of the activity
const BASE_SPEED: Record<Category, number> = {
  Gym:    120,
  Sport:  110,
  Travel:  85,
  Hike:    80,
  Game:    75,
  Event:   65,
  Food:    55,
  FilmTV:  45,
  Book:    35,
};

export function buildPersonality(log: LogEntry): CharacterPersonality {
  const mood   = log.mood  ?? 3;
  const solo   = log.solo  ?? true;

  // Recency: 1.0 if logged today, linear decay to 0 over 30 days
  const ageDays = (Date.now() - new Date(log.date).getTime()) / 86_400_000;
  const recency = Math.max(0, 1 - ageDays / 30);

  // Higher rating = larger awareness radius (more influence on neighbours)
  // and greater mass (harder to redirect by others)
  const awarenessRadius = 80  + log.rating * 30;  // 110–230 px
  const mass            = 0.6 + log.rating * 0.3;  // 0.9–2.1

  // Speed: category base + mood modifier (unhappy = slower) + recency boost
  const moodMod = (mood - 3) * 8;     // −16 to +16 px/s
  const maxSpeed = Math.max(20, BASE_SPEED[log.category] + moodMod + recency * 25);

  return { category: log.category, rating: log.rating, mood, solo, recency, awarenessRadius, maxSpeed, mass, date: log.date };
}
