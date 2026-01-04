import Phaser from 'phaser';

// Define what a character looks like
interface CharacterSprite extends Phaser.Physics.Arcade.Sprite {
    logId: number;
}

export default class MainScene extends Phaser.Scene {
    // A group to hold all our little people
    characters!: Phaser.Physics.Arcade.Group;

    constructor() {
        super('MainScene');
    }

    // We removed Preload. We don't need to download images anymore.

    create() {
        console.log("GAME: Create function started...");

        // We use 'this.scale' to get the actual screen size in pixels
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. Create a "Green" background using a generic rectangle
        this.cameras.main.setBackgroundColor('#567d46')

        // 2. Create the graphics for our character manually
        // This draws a white circle and saves it as a texture called "dude"
        const graphics = this.make.graphics({ x: 0, y: 0,});
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 16); // Draw a circle
        graphics.generateTexture('dude', 32, 32); // Save it as 'dude'

        // 3. Create the group for characters
        this.characters = this.physics.add.group();

        console.log("GAME: Group created. Ready to spawn!");
    }

    // React calls this when a new log is added
        addCharacter(id: number, xPerc: number, yPerc: number, tint: number) {
        
        if (!this.characters) {
            // ... waiting logic (keep this the same) ...
             this.time.addEvent({
                delay: 100,
                callback: () => this.addCharacter(id, xPerc, yPerc, tint),
                loop: false
            });
            return;
        }

        
        const x = (xPerc / 100) * this.cameras.main.width;
        const y = (yPerc / 100) * this.cameras.main.height;

        const player = this.characters.create(x, y, 'dude') as CharacterSprite;
        
        player.logId = id;
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.setTint(tint); 

        this.assignRandomWalk(player);
    }

    assignRandomWalk(player: CharacterSprite) {
        // If player was destroyed (e.g. reset button), stop logic
        if(!player.active) return;

        const speedX = Phaser.Math.Between(-50, 50);
        const speedY = Phaser.Math.Between(-50, 50);

        player.setVelocity(speedX, speedY);

        // Reset this logic in 2 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => this.assignRandomWalk(player),
            loop: false
        });
    }
}