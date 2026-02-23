// Shared types for the Logger app

export type Category =
  | 'FilmTV'
  | 'Book'
  | 'Game'
  | 'Hike'
  | 'Gym'
  | 'Event'
  | 'Food'
  | 'Travel'
  | 'Sport';

export interface LogEntry {
  id: string;           // UUID via crypto.randomUUID()
  title: string;
  category: Category;
  rating: number;       // 1–5, 0.5 increments — "How good was it?"
  mood?: number;        // 1–5, 0.5 increments — "How did it make you feel?"
  solo?: boolean;       // true = alone, false = with others
  duration?: number;    // raw number, pair with durationUnit
  durationUnit?: 'hours' | 'days' | 'weeks';
  notes: string;
  date: string;         // ISO date string
  categoryMeta?: CategoryMeta;
}

// Discriminated union keeps category-specific metadata type-safe.
// TypeScript will error if Film/TV metadata is accidentally stored on a Gym entry.
export type CategoryMeta =
  | { type: 'filmtv'; format: 'Film' | 'TV Show' }
  | { type: 'book';   status: 'Finished' | 'In Progress' | 'DNF' }
  | { type: 'game';   mode: 'Single-player' | 'Multiplayer' }
  | { type: 'sport';  result: 'Won' | 'Lost' | 'Drew' | 'N/A' }
  | { type: 'food';   setting: 'Restaurant' | 'Home-cooked' | 'Takeaway' }
  | { type: 'travel'; destination: string }
  | { type: 'event';  eventType: 'Concert' | 'Party' | 'Festival' | 'Exhibition' | 'Other' };

// Rendering position is separate from the log data itself.
// x and y are percentage-based (10–90%) within the game canvas.
export interface CharacterState {
  logId: string;
  x: number;
  y: number;
}
