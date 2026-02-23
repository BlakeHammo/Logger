import Phaser from 'phaser';
import type { LogEntry } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';
import { buildPersonality, type CharacterPersonality } from './Personality';
import { getAffinity } from './AffinityMatrix';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterSprite extends Phaser.Physics.Arcade.Sprite {
  logId: string;
  personality: CharacterPersonality;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export default class MainScene extends Phaser.Scene {
  characters!: Phaser.Physics.Arcade.Group;

  private characterMap = new Map<string, CharacterSprite>();

  private onCharacterClickRef: ((id: string) => void) | null = null;
  private onCharacterHoverRef: ((id: string | null) => void) | null = null;
  private highlightedCharacter: CharacterSprite | null = null;

  constructor() { super('MainScene'); }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  create() {
    this.cameras.main.setBackgroundColor('#1e2d1e');
    this.createCharacterTextures();

    this.characters = this.physics.add.group();

    this.game.events.emit('mainscene-ready', this);
  }

  update(_time: number, delta: number) {
    this.runBoids(delta / 1000);
  }

  // ─── Texture generation ──────────────────────────────────────────────────────
  // Textures are 24×24 white shapes → tinted to category colour at runtime.
  // Three shapes shared across categories: circle, square, triangle.

  createCharacterTextures() {
    const S = 24; // smaller base texture
    const C = S / 2;
    const g = this.make.graphics({ x: 0, y: 0 });

    const white = () => { g.clear(); g.fillStyle(0xffffff); };

    // Circle — FilmTV, Food, Gym
    white();
    g.fillCircle(C, C, C - 1);
    g.generateTexture('filmtv', S, S);
    g.generateTexture('food',   S, S);
    g.generateTexture('gym',    S, S);

    // Square — Book, Game, Event
    white();
    g.fillRect(1, 1, S - 2, S - 2);
    g.generateTexture('book',  S, S);
    g.generateTexture('game',  S, S);
    g.generateTexture('event', S, S);

    // Triangle — Hike, Travel, Sport
    white();
    g.fillTriangle(C, 1, 1, S - 1, S - 1, S - 1);
    g.generateTexture('hike',   S, S);
    g.generateTexture('travel', S, S);
    g.generateTexture('sport',  S, S);

    g.destroy();
  }

  // ─── Character management ────────────────────────────────────────────────────

  addCharacter(log: LogEntry, x: number, y: number) {
    const config      = CATEGORY_CONFIG[log.category];
    const personality = buildPersonality(log);

    const sprite = this.characters.create(x, y, config.texture) as CharacterSprite;
    sprite.logId       = log.id;
    sprite.personality = personality;

    sprite.setBounce(1.0);
    sprite.setCollideWorldBounds(true);
    sprite.setTint(config.color);
    sprite.setData('originalTint', config.color);
    sprite.setDepth(1);

    // Scale: rating 1 → 0.45×, rating 5 → 0.85× — kept small for 300+ character scenes
    const targetScale = 0.35 + personality.rating * 0.1;

    // Spawn animation: pop in with a bouncy scale tween
    sprite.setScale(0);
    this.tweens.add({
      targets:  sprite,
      scaleX:   targetScale,
      scaleY:   targetScale,
      duration: 450,
      ease:     'Back.easeOut',
    });

    this.characterMap.set(log.id, sprite);

    // Initial velocity — angle varies so characters spread out on spawn
    const angle = Math.random() * Math.PI * 2;
    sprite.setVelocity(
      Math.cos(angle) * personality.maxSpeed * 0.5,
      Math.sin(angle) * personality.maxSpeed * 0.5,
    );

    // Interactivity
    sprite.setInteractive();
    sprite.on('pointerdown', () => this.onCharacterClickRef?.(sprite.logId));
    sprite.on('pointerover', () => this.onCharacterHoverRef?.(sprite.logId));
    sprite.on('pointerout',  () => this.onCharacterHoverRef?.(null));
  }

  clearAllCharacters() {
    if (!this.characters) return;

    this.characterMap.clear();
    this.highlightedCharacter = null;

    this.characters.clear(true, true);
  }

  // ─── Boids / emergent behaviour ──────────────────────────────────────────────
  //
  // Each frame every character evaluates its neighbourhood and accumulates
  // force vectors from six rules, then clamps to its personality's max speed.
  //
  // Rules (all frame-rate independent via dt):
  //   1. Separation   — avoid crowding near neighbours
  //   2. Cohesion     — drift toward same-category centroid
  //   3. Alignment    — match same-category average velocity
  //   4. Affinity     — cross-category attraction / repulsion
  //   5. Gravity      — high-rated characters pull others (global, falls off with distance)
  //   6. Same-day bond — weak spring toward entries logged on the same date
  //   + Recency energy  — recently-logged characters are more restless

  private runBoids(dt: number) {
    const all = this.characters.getChildren() as CharacterSprite[];

    all.forEach(sprite => {
      if (!sprite.active || !sprite.body) return;

      const body = sprite.body as Phaser.Physics.Arcade.Body;
      const p    = sprite.personality;

      let fx = 0;
      let fy = 0;

      // Neighbours within awareness radius
      const nearby = all.filter(o => {
        if (o === sprite || !o.active) return false;
        return Phaser.Math.Distance.BetweenPoints(sprite, o) < p.awarenessRadius;
      });

      // ── 1. Separation ──────────────────────────────────────────────────────
      nearby.forEach(other => {
        const dist    = Phaser.Math.Distance.BetweenPoints(sprite, other);
        const minDist = (sprite.displayWidth + other.displayWidth) * 0.55;
        if (dist < minDist && dist > 1) {
          const strength = (minDist - dist) / minDist * 90;
          fx += (sprite.x - other.x) / dist * strength;
          fy += (sprite.y - other.y) / dist * strength;
        }
      });

      const sameCategory = nearby.filter(o => o.personality.category === p.category);

      // ── 2. Cohesion (same category) ────────────────────────────────────────
      if (sameCategory.length > 0) {
        const avgX = sameCategory.reduce((s, o) => s + o.x, 0) / sameCategory.length;
        const avgY = sameCategory.reduce((s, o) => s + o.y, 0) / sameCategory.length;
        const dx   = avgX - sprite.x;
        const dy   = avgY - sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > sprite.displayWidth && dist > 0) {
          fx += (dx / dist) * 14;
          fy += (dy / dist) * 14;
        }
      }

      // ── 3. Alignment (same category) ───────────────────────────────────────
      if (sameCategory.length > 0) {
        const avgVx = sameCategory.reduce((s, o) => s + (o.body as Phaser.Physics.Arcade.Body).velocity.x, 0) / sameCategory.length;
        const avgVy = sameCategory.reduce((s, o) => s + (o.body as Phaser.Physics.Arcade.Body).velocity.y, 0) / sameCategory.length;
        fx += (avgVx - body.velocity.x) * 0.05;
        fy += (avgVy - body.velocity.y) * 0.05;
      }

      // ── 4. Cross-category affinity / repulsion ─────────────────────────────
      nearby
        .filter(o => o.personality.category !== p.category)
        .forEach(other => {
          const affinity = getAffinity(p.category, other.personality.category);
          if (affinity === 0) return;
          const dx   = other.x - sprite.x;
          const dy   = other.y - sprite.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const falloff  = 1 - dist / p.awarenessRadius;
            const strength = affinity * falloff * 28;
            fx += (dx / dist) * strength;
            fy += (dy / dist) * strength;
          }
        });

      // ── 5. Rating gravity (global) ─────────────────────────────────────────
      // Stars ≥ 4 create an attractive pull on everyone within 280 px
      all.forEach(other => {
        if (other === sprite || !other.active) return;
        const gravStrength = (other.personality.rating - 3) * 1.8; // −3.6..+3.6
        if (gravStrength <= 0) return;
        const dx      = other.x - sprite.x;
        const dy      = other.y - sprite.y;
        const dist    = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 280;
        if (dist < maxDist && dist > 0) {
          const falloff = 1 - dist / maxDist;
          fx += (dx / dist) * gravStrength * falloff * 4.5;
          fy += (dy / dist) * gravStrength * falloff * 4.5;
        }
      });

      // ── 6. Same-day bond ───────────────────────────────────────────────────
      const myDay = p.date.slice(0, 10);
      all.forEach(other => {
        if (other === sprite || !other.active) return;
        if (other.personality.date.slice(0, 10) !== myDay) return;
        const dx   = other.x - sprite.x;
        const dy   = other.y - sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Spring: only pulls when beyond bond distance
        if (dist > 110 && dist > 0) {
          fx += (dx / dist) * 6;
          fy += (dy / dist) * 6;
        }
      });

      // ── Apply forces ───────────────────────────────────────────────────────
      const recencyBoost = p.recency * 18;
      const maxSpeed     = p.maxSpeed + recencyBoost;

      let newVx = body.velocity.x + fx * dt;
      let newVy = body.velocity.y + fy * dt;
      const speed = Math.sqrt(newVx * newVx + newVy * newVy);

      const minSpeed = 12 + recencyBoost * 0.5;
      if (speed > maxSpeed) {
        newVx = (newVx / speed) * maxSpeed;
        newVy = (newVy / speed) * maxSpeed;
      } else if (speed < minSpeed && speed > 0) {
        // Clamp to minimum speed in the current direction — no random snapping
        newVx = (newVx / speed) * minSpeed;
        newVy = (newVy / speed) * minSpeed;
      } else if (speed === 0) {
        // Exact zero only: pick a direction once
        const a = Math.random() * Math.PI * 2;
        newVx = Math.cos(a) * minSpeed;
        newVy = Math.sin(a) * minSpeed;
      }

      sprite.setVelocity(newVx, newVy);

      // Flip sprite to face direction of travel
      if (Math.abs(newVx) > 4) sprite.setFlipX(newVx < 0);
    });
  }

  // ─── Public API called by PhaserGame.tsx ─────────────────────────────────────

  highlightCharacter(logId: string | null) {
    // Restore previous highlight
    if (this.highlightedCharacter) {
      const orig = this.highlightedCharacter.getData('originalTint');
      this.highlightedCharacter.setTint(orig);
      this.highlightedCharacter = null;
    }

    if (logId === null) return;

    const found = this.characterMap.get(logId);
    if (found) {
      found.setTint(0xffff00);
      this.highlightedCharacter = found;
    }
  }

  // Dims characters not in visibleIds via alpha (tint channel stays free for highlight).
  applyVisibilityFilter(visibleIds: Set<string> | null) {
    this.characters.getChildren().forEach(child => {
      const sprite  = child as CharacterSprite;
      const visible = visibleIds === null || visibleIds.has(sprite.logId);
      sprite.setAlpha(visible ? 1 : 0.12);
    });
  }

  setCharacterClickCallback(cb: (id: string) => void) {
    this.onCharacterClickRef = cb;
  }

  setCharacterHoverCallback(cb: (id: string | null) => void) {
    this.onCharacterHoverRef = cb;
  }
}
