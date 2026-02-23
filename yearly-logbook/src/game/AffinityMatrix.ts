import type { Category } from '../types';

// Affinity values: positive = attraction, negative = repulsion.
// Range is roughly −0.6 (strong repel) to +0.55 (strong attract).
// Same-category cohesion is handled separately in the Boids loop (always positive).
//
// Design rationale:
//   Passive/cognitive group  (FilmTV, Book, Game)  → repelled by Physical
//   Physical group           (Gym, Sport, Hike)    → repelled by Passive
//   Social/lifestyle group   (Event, Food, Travel) → broadly attractive hub
//   Gym ↔ Sport              strong mutual attraction (exercise buddies)
//   FilmTV ↔ Gym             strong mutual repulsion (couch vs gym)

export const AFFINITY: Record<Category, Partial<Record<Category, number>>> = {
  FilmTV: {
    Book:   0.35,  // both sedentary, inner-world
    Food:   0.20,  // dinner-and-a-movie energy
    Game:   0.15,  // screen culture overlap
    Event:  0.15,
    Travel: 0.10,
    Hike:  -0.20,
    Sport: -0.40,
    Gym:   -0.55,
  },
  Book: {
    FilmTV: 0.35,
    Travel: 0.30,  // exploration, curiosity
    Hike:   0.20,  // solitude + nature
    Food:   0.15,
    Event:  0.10,
    Game:  -0.10,
    Sport: -0.20,
    Gym:   -0.25,
  },
  Game: {
    FilmTV: 0.15,
    Event:  0.25,
    Food:   0.20,
    Sport:  0.15,
    Travel: 0.10,
    Book:  -0.10,
    Hike:  -0.15,
    Gym:   -0.20,
  },
  Hike: {
    Travel: 0.45,  // both about going somewhere
    Sport:  0.30,
    Food:   0.25,  // post-hike meal
    Book:   0.20,
    Gym:    0.20,
    Event:  0.15,
    FilmTV:-0.20,
    Game:  -0.15,
  },
  Gym: {
    Sport:  0.55,  // strongest cross-category bond
    Hike:   0.20,
    Event:  0.15,
    Travel: 0.10,
    Food:   0.05,
    Game:  -0.20,
    Book:  -0.30,
    FilmTV:-0.55,
  },
  Event: {
    Food:   0.50,  // events and food go together
    Travel: 0.35,
    Sport:  0.25,
    Game:   0.25,
    Gym:    0.15,
    FilmTV: 0.15,
    Hike:   0.15,
    Book:   0.10,
  },
  Food: {
    Event:  0.50,
    Travel: 0.30,
    Hike:   0.25,
    FilmTV: 0.20,
    Game:   0.20,
    Sport:  0.20,
    Book:   0.15,
    Gym:    0.05,
  },
  Travel: {
    Hike:   0.45,
    Event:  0.35,
    Food:   0.30,
    Book:   0.30,
    Sport:  0.20,
    FilmTV: 0.10,
    Game:   0.10,
    Gym:    0.10,
  },
  Sport: {
    Gym:    0.55,
    Hike:   0.30,
    Event:  0.25,
    Food:   0.20,
    Travel: 0.20,
    Game:   0.15,
    Book:  -0.20,
    FilmTV:-0.40,
  },
};

/** Look up affinity between two categories, defaulting to 0 (neutral). */
export function getAffinity(a: Category, b: Category): number {
  return AFFINITY[a]?.[b] ?? 0;
}
