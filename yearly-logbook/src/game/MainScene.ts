import Phaser from 'phaser';
import type { Category } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';
import type { MovementProfile } from '../categoryConfig';

interface CharacterSprite extends Phaser.Physics.Arcade.Sprite {
    logId: string;  // UUID string
}

export default class MainScene extends Phaser.Scene {
    characters!: Phaser.Physics.Arcade.Group;

    private onCharacterClickRef: ((id: string) => void) | null = null;
    private onCharacterHoverRef: ((id: string | null) => void) | null = null;
    private highlightedCharacter: CharacterSprite | null = null;

    constructor() {
        super('MainScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#7cbd6b');
        this.createCharacterTextures();
        this.characters = this.physics.add.group();
        this.physics.add.collider(this.characters, this.characters);

        // Signal to PhaserGame that the scene is fully ready
        this.game.events.emit('mainscene-ready', this);
    }

    createCharacterTextures() {
        const g = this.make.graphics({ x: 0, y: 0 });

        g.fillStyle(0xffffff);
        g.fillCircle(16, 16, 16);
        g.generateTexture('circle', 32, 32);

        g.clear();
        g.fillStyle(0xffffff);
        g.fillRect(0, 0, 32, 32);
        g.generateTexture('square', 32, 32);

        g.clear();
        g.fillStyle(0xffffff);
        g.fillTriangle(16, 0, 0, 32, 32, 32);
        g.generateTexture('triangle', 32, 32);

        g.clear();
        g.fillStyle(0xffffff);
        g.fillEllipse(16, 16, 10, 24);
        g.generateTexture('ellipse', 32, 32);
    }

    addCharacter(id: string, x: number, y: number, category: Category, rating: number, color: number) {
        const { texture } = CATEGORY_CONFIG[category];

        const sprite = this.characters.create(x, y, texture) as CharacterSprite;
        sprite.logId = id;
        sprite.setBounce(1);
        sprite.setCollideWorldBounds(true);
        sprite.setTint(color);
        sprite.setData('originalTint', color);

        // Scale: rating 1 → 1.0, rating 5 → 3.0
        const scale = 0.5 + rating * 0.5;
        sprite.setScale(scale);

        sprite.setInteractive();
        sprite.on('pointerdown', () => this.onCharacterClickRef?.(sprite.logId));
        sprite.on('pointerover', () => this.onCharacterHoverRef?.(sprite.logId));
        sprite.on('pointerout',  () => this.onCharacterHoverRef?.(null));

        this.assignPersonalityMovement(sprite, CATEGORY_CONFIG[category].movement);
    }

    assignPersonalityMovement(sprite: CharacterSprite, movement: MovementProfile) {
        if (!sprite.active) return;

        let speedX = 0;
        let speedY = 0;
        let delay = 2000;

        switch (movement) {
            case 'energetic':
                speedX = Phaser.Math.Between(-100, 100);
                speedY = Phaser.Math.Between(-100, 100);
                delay = 1000;
                break;
            case 'wandering':
                speedX = Phaser.Math.Between(-30, 30);
                speedY = Phaser.Math.Between(-30, 30);
                delay = 3000;
                break;
            case 'erratic':
                speedX = Phaser.Math.Between(-70, 70);
                speedY = Phaser.Math.Between(-70, 70);
                delay = 1500;
                break;
            case 'explorer': {
                const dir = Phaser.Math.Between(0, 3);
                const spd = 50;
                speedX = dir % 2 === 0 ? spd : -spd;
                speedY = dir < 2 ? spd : -spd;
                delay = 10000;
                break;
            }
            default:
                speedX = Phaser.Math.Between(-50, 50);
                speedY = Phaser.Math.Between(-50, 50);
        }

        sprite.setVelocity(speedX, speedY);

        // Store the timer on the sprite so it can be cancelled on clear
        const timer = this.time.addEvent({
            delay,
            callback: () => this.assignPersonalityMovement(sprite, movement),
            loop: false,
        });
        sprite.setData('movementTimer', timer);
    }

    // Dims characters that are not in visibleIds via alpha (not tint), so the
    // highlight system (which owns the tint channel) remains fully independent.
    applyVisibilityFilter(visibleIds: Set<string> | null) {
        this.characters.getChildren().forEach(child => {
            const sprite = child as CharacterSprite;
            sprite.setAlpha(visibleIds === null || visibleIds.has(sprite.logId) ? 1 : 0.15);
        });
    }

    highlightCharacter(logId: string | null) {
        if (this.highlightedCharacter) {
            const original = this.highlightedCharacter.getData('originalTint');
            this.highlightedCharacter.setTint(original);
            this.highlightedCharacter = null;
        }

        if (logId === null) return;

        const found = this.characters.getChildren().find(
            child => (child as CharacterSprite).logId === logId
        ) as CharacterSprite | undefined;

        if (found) {
            found.setTint(0xffff00);
            this.highlightedCharacter = found;
        }
    }

    clearAllCharacters() {
        if (!this.characters) return;

        // Cancel every pending movement timer before destroying sprites
        this.characters.getChildren().forEach(child => {
            const timer = child.getData('movementTimer') as Phaser.Time.TimerEvent | undefined;
            timer?.destroy();
        });

        this.highlightedCharacter = null;
        this.characters.clear(true, true);
    }

    setCharacterClickCallback(cb: (id: string) => void) {
        this.onCharacterClickRef = cb;
    }

    setCharacterHoverCallback(cb: (id: string | null) => void) {
        this.onCharacterHoverRef = cb;
    }
}
