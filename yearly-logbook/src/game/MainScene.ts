import Phaser from 'phaser';
// Game Scene

// Define what a character looks like
interface CharacterSprite extends Phaser.Physics.Arcade.Sprite {
    logId: number;
    logTitle: string;
    logCategory: string;
    logRating: number;
}

export default class MainScene extends Phaser.Scene {
    characters!: Phaser.Physics.Arcade.Group;
    // Store a reference to the callback function
    onCharacterClick?: (id: number, title: string, category: string, rating: number) => void;

    constructor() {
        super('MainScene');
    }

    create() {
        console.log("GAME: Create function started...");

        // 1. Background
        this.cameras.main.setBackgroundColor('#567d46');

        // 2. Create different character shapes
        this.createCharacterTextures();

        // 3. Create the group for characters
        this.characters = this.physics.add.group();

        // 4. ADD COLLISION - characters bounce off each other!
        this.physics.add.collider(this.characters, this.characters);

        console.log("GAME: Group created. Ready to spawn!");
    }

    createCharacterTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        
        // Circle (default)
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('circle', 32, 32);

        // Square (for games)
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('square', 32, 32);

        // Triangle (for events)
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillTriangle(16, 0, 0, 32, 32, 32);
        graphics.generateTexture('triangle', 32, 32);

        // Ellipse (for hikes)
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillEllipse(16, 16, 5, 16, 8);
        graphics.generateTexture('ellipse', 32, 32);
    }

    addCharacter(id: number, xPerc: number, yPerc: number, tint: number, category: string, title: string, rating: number) {
        
        //  If characters group not ready yet, try again shortly
        if (!this.characters) {
            this.time.addEvent({
                delay: 100,
                callback: () => this.addCharacter(id, xPerc, yPerc, tint, category, title, rating),
                loop: false
            });
            return;
        }

        // Convert percentage to actual position
        const x = (xPerc / 100) * this.cameras.main.width;
        const y = (yPerc / 100) * this.cameras.main.height;

        // Choose shape based on category
        let texture = 'circle';
        if (category === 'Game') texture = 'square';
        if (category === 'Event') texture = 'triangle';
        if (category === 'Hike') texture = 'ellipse';

        // Create the character sprite
        const player = this.characters.create(x, y, texture) as CharacterSprite;
        
        // Store the custom data
        player.logId = id;
        player.logTitle = title;
        player.logCategory = category;
        player.logRating = rating;
        
        // Physics properties
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.setTint(tint);

        // SIZE BASED ON RATING (1-5)
        const scale = 0.5 + (rating * 0.2); // 0.7 to 1.5 scale
        player.setScale(scale);

        // Make clickable
        player.setInteractive();
        player.on('pointerdown', () => {
            if (this.onCharacterClick) {
                this.onCharacterClick(player.logId, player.logTitle, player.logCategory, player.logRating);
            }
        });

        // Add hover effect
        player.on('pointerover', () => {
            player.setAlpha(0.7);
        });
        player.on('pointerout', () => {
            player.setAlpha(1);
        });

        // Movement based on category
        this.assignPersonalityMovement(player, category);
    }

    assignPersonalityMovement(player: CharacterSprite, category: string) {
        if (!player.active) return; // Stop if destroyed

        let speedX = 0;
        let speedY = 0;
        let delay = 2000;

        switch(category) {
            case 'Gym':
                // Fast and energetic
                speedX = Phaser.Math.Between(-100, 100);
                speedY = Phaser.Math.Between(-100, 100);
                delay = 1000;
                break;
            
            case 'Movie':
                // Slow and wandering
                speedX = Phaser.Math.Between(-30, 30);
                speedY = Phaser.Math.Between(-30, 30);
                delay = 3000;
                break;
            
            case 'Game':
                // Medium speed with sudden changes
                speedX = Phaser.Math.Between(-70, 70);
                speedY = Phaser.Math.Between(-70, 70);
                delay = 1500;
                break;
            
            case 'Hike':
                // Diagonal exploration
                const direction = Phaser.Math.Between(0, 3);
                const speed = 50;
                if (direction === 0) { speedX = speed; speedY = speed; }
                else if (direction === 1) { speedX = -speed; speedY = speed; }
                else if (direction === 2) { speedX = speed; speedY = -speed; }
                else { speedX = -speed; speedY = -speed; }
                delay = 2500;
                break;
            
            default:
                // Default behavior
                speedX = Phaser.Math.Between(-50, 50);
                speedY = Phaser.Math.Between(-50, 50);
        }

        player.setVelocity(speedX, speedY);

        // Schedule next direction change
        this.time.addEvent({
            delay: delay,
            callback: () => this.assignPersonalityMovement(player, category),
            loop: false
        });
    }

    // Method to clear all characters
    clearAllCharacters() {
        if (this.characters) {
            this.characters.clear(true, true); // Remove and destroy
        }
    }

    // Method to register click callback from React
    setCharacterClickCallback(callback: (id: number, title: string, category: string, rating: number) => void) {
        this.onCharacterClick = callback;
    }
}