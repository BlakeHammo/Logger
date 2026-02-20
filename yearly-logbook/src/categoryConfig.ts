import type { Category } from './types';

export type MovementProfile = 'energetic' | 'wandering' | 'erratic' | 'explorer' | 'default';

export interface CategoryConfig {
    color: number;           // Phaser hex tint
    texture: string;         // Key for the Phaser texture
    movement: MovementProfile;
    label: string;           // Human-readable display name
}

// Single source of truth for all category-driven behaviour.
// Adding a new category only requires adding an entry here.
export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
    Movie: {
        color: 0xa020f0,
        texture: 'circle',
        movement: 'wandering',
        label: 'Movie',
    },
    Game: {
        color: 0x00ff00,
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
        color: 0xff0000,
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
};
