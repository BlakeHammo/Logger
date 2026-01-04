import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './game/MainScene';

interface LogEntry {
    id: number;
    title: string;
    category: string;
    rating: number;
    x: number;
    y: number;
}

interface Props {
    logs: LogEntry[];
}

export default function PhaserGame({ logs }: Props) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<MainScene | null>(null);

    // 1. Initialize the Game Engine (Run once)
    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-container', // Attaches to the div below
            width: '100%',
            height: '100%',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x : 0, y: 0 }, // No gravity (Top down)
                    debug: false
                }
            },
            scene: MainScene
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        // Wait for the scene to be ready so we can talk to it
        game.events.on('ready', () => {
            const scene = game.scene.getScene('MainScene') as MainScene;
            sceneRef.current = scene;
            
            // Initial Load of existing logs
            // We pass it to the scene, the scene handles the "Waiting" if it needs to
            logs.forEach(log => spawnLog(log));
        });

        return () => {
            game.destroy(true);
        };
    }, []);

    // 2. Helper to spawn a guy
    const spawnLog = (log: LogEntry) => {
        if (!sceneRef.current) return;
        
        // Determine Color (Tint)
        let color = 0xffffff;
        if (log.category === 'Gym') color = 0xff0000;
        if (log.category === 'Game') color = 0x00ff00;
        if (log.category === 'Movie') color = 0xa020f0;

        // Check if character already exists to prevent duplicates (simple check)
        const exists = sceneRef.current.characters?.getChildren().find(
            (c: any) => c.logId === log.id
        );

        if (!exists) {
            sceneRef.current.addCharacter(log.id, log.x, log.y, color);
        }
    };

    // 3. Watch for new logs from React
    useEffect(() => {
        if (sceneRef.current) {
            // Find logs that aren't in the game yet
            logs.forEach(log => spawnLog(log));
        }
    }, [logs]);

    return (
        <div 
            id="phaser-container" 
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        />
    );
}