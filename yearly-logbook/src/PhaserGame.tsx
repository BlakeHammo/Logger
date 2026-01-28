import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './game/MainScene';

// The Bridge between React and Phaser

interface LogEntry {
    id: number;
    title: string;
    category: string;
    rating: number;
    notes: string;
    date: string;
    x: number;
    y: number;
}

interface Props {
    logs: LogEntry[];
    onCharacterClick?: (id: number) => void;
    onCharacterHover?: (id: number | null) => void;
    highlightedLogId?: number | null;
}

export default function PhaserGame({ logs, onCharacterClick, onCharacterHover, highlightedLogId }: Props) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<MainScene | null>(null);
    const spawnedIds = useRef<Set<number>>(new Set());

    // 1. Initialize the Game Engine (Run once)
    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-container',

            // Remove width/height strings
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: '100%',
                height: '100%',
            },

            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                },
            },

            scene: MainScene,
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        game.events.on('ready', () => {
            const scene = game.scene.getScene('MainScene') as MainScene;
            sceneRef.current = scene;
            
            // Set up click callback
            if (onCharacterClick) {
                scene.setCharacterClickCallback(onCharacterClick);
            }

            // Set up hover callback
            if (onCharacterHover) {
                scene.setCharacterHoverCallback(onCharacterHover);
            }
            
            // Initial load of existing logs
            logs.forEach(log => {
                spawnLog(log);
                spawnedIds.current.add(log.id);
            });
        });

        return () => {
            game.destroy(true);     // Clean up on unmount
        };
    }, []);             // Empty array = run once on mount

    // 2. Helper to spawn a character
    const spawnLog = (log: LogEntry) => {
        if (!sceneRef.current) return;  // Scene not ready yet
        
        // Determine Color (Tint)
        let color = 0xffffff;
        if (log.category === 'Gym') color = 0xff0000;
        if (log.category === 'Game') color = 0x00ff00;
        if (log.category === 'Movie') color = 0xa020f0;
        if (log.category === 'Hike') color = 0xffaa00;
        if (log.category === 'Event') color = 0x00aaff;

        // Convert percentage to pixels
        const x = (log.x / 100) * sceneRef.current.cameras.main.width;
        const y = (log.y / 100) * sceneRef.current.cameras.main.height;

        // Pass all 7 required arguments
        sceneRef.current.addCharacter(
            log.id, 
            x, 
            y,  
            log.category, 
            log.rating,
            color
        );
    };

    // 3. Watch for new logs from React
    useEffect(() => {
        if (sceneRef.current) {
            // Find logs that haven't been spawned yet
            logs.forEach(log => {
                if (!spawnedIds.current.has(log.id)) {
                    spawnLog(log);
                    spawnedIds.current.add(log.id);
                }
            });

            // Handle reset (when logs array is empty)
            if (logs.length === 0) {
                sceneRef.current.clearAllCharacters();
                spawnedIds.current.clear();
            }
        }
    }, [logs]);

    // 4. Update callback when it changes
    useEffect(() => {
        if (sceneRef.current && onCharacterClick) {
            sceneRef.current.setCharacterClickCallback(onCharacterClick);
        }
    }, [onCharacterClick]);


    // 5. Update hover callback when it changes
    useEffect(() => {
        if (sceneRef.current && onCharacterHover) {
            sceneRef.current.setCharacterHoverCallback(onCharacterHover);
        }
    }, [onCharacterHover]);

    useEffect(() => {        
        if (sceneRef.current) {
            sceneRef.current.highlightCharacter(highlightedLogId ?? null);
        }
    }, [highlightedLogId]);
    
    
    return (
        <div 
            id="phaser-container" 
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        />
    );
}