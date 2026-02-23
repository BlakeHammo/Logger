import type { Category } from './types';

export type MovementProfile = 'energetic' | 'wandering' | 'erratic' | 'explorer' | 'default';

export interface CategoryConfig {
  color: number;            // Phaser hex tint
  texture: string;          // Key for the Phaser texture
  movement: MovementProfile;
  label: string;            // Human-readable display name
}

// Single source of truth for all category-driven behaviour.
// Adding a new category only requires adding an entry here (+ types.ts).
//
// Texture distribution across 4 primitives:
//   circle   — FilmTV (purple), Gym (red), Sport (royal blue)
//   square   — Game (green), Book (amber)
//   triangle — Event (sky blue), Travel (teal)
//   ellipse  — Hike (gold), Food (orange)
export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  FilmTV: {
    color: 0xa020f0,
    texture: 'circle',
    movement: 'wandering',
    label: 'Film / TV',
  },
  Book: {
    color: 0xc8860a,
    texture: 'square',
    movement: 'wandering',
    label: 'Book',
  },
  Game: {
    color: 0x00dd44,
    texture: 'square',
    movement: 'erratic',
    label: 'Video Game',
  },
  Hike: {
    color: 0xffaa00,
    texture: 'ellipse',
    movement: 'explorer',
    label: 'Hike',
  },
  Gym: {
    color: 0xff3333,
    texture: 'circle',
    movement: 'energetic',
    label: 'Gym / Workout',
  },
  Event: {
    color: 0x00aaff,
    texture: 'triangle',
    movement: 'default',
    label: 'Event',
  },
  Food: {
    color: 0xff7c2a,
    texture: 'ellipse',
    movement: 'wandering',
    label: 'Food / Dining',
  },
  Travel: {
    color: 0x00d4aa,
    texture: 'triangle',
    movement: 'explorer',
    label: 'Travel',
  },
  Sport: {
    color: 0x4169e1,
    texture: 'circle',
    movement: 'energetic',
    label: 'Sport',
  },
};
