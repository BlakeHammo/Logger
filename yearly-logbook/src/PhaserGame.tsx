import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './game/MainScene';
import type { LogEntry, CharacterState } from './types';
import { CATEGORY_CONFIG } from './categoryConfig';

interface Props {
    logs: LogEntry[];
    characters: CharacterState[];
    onCharacterClick?: (id: string) => void;
    onCharacterHover?: (id: string | null) => void;
    highlightedLogId?: string | null;
}

export default function PhaserGame({ logs, characters, onCharacterClick, onCharacterHover, highlightedLogId }: Props) {
    const gameRef    = useRef<Phaser.Game | null>(null);
    const sceneRef   = useRef<MainScene | null>(null);
    const spawnedIds = useRef<Set<string>>(new Set());

    // Use refs for callbacks so Phaser always calls the latest version
    // without needing to re-register on every render.
    const onClickRef = useRef(onCharacterClick);
    const onHoverRef = useRef(onCharacterHover);
    useEffect(() => { onClickRef.current = onCharacterClick; });
    useEffect(() => { onHoverRef.current = onCharacterHover; });

    // 1. Initialise the Phaser game once
    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-container',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: '100%',
                height: '100%',
            },
            physics: {
                default: 'arcade',
                arcade: { gravity: { x: 0, y: 0 }, debug: false },
            },
            scene: MainScene,
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        // Listen for the scene's own ready signal (emitted at end of create())
        // so we're guaranteed the scene is fully initialised before using it.
        game.events.on('mainscene-ready', (scene: MainScene) => {
            sceneRef.current = scene;

            // Wire callbacks via refs — no re-registration needed on re-renders
            scene.setCharacterClickCallback((id) => onClickRef.current?.(id));
            scene.setCharacterHoverCallback((id) => onHoverRef.current?.(id));
        });

        return () => {
            game.destroy(true);
            gameRef.current = null;
            sceneRef.current = null;
            spawnedIds.current.clear();
        };
    }, []);

    // 2. Spawn new characters when the logs/characters arrays change
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Reset
        if (logs.length === 0) {
            scene.clearAllCharacters();
            spawnedIds.current.clear();
            return;
        }

        logs.forEach(log => {
            if (spawnedIds.current.has(log.id)) return;

            const charState = characters.find(c => c.logId === log.id);
            if (!charState) return;

            const { color } = CATEGORY_CONFIG[log.category];
            const x = (charState.x / 100) * scene.cameras.main.width;
            const y = (charState.y / 100) * scene.cameras.main.height;

            scene.addCharacter(log.id, x, y, log.category, log.rating, color);
            spawnedIds.current.add(log.id);
        });
    }, [logs, characters]);

    // 3. Sync highlight with Phaser
    useEffect(() => {
        sceneRef.current?.highlightCharacter(highlightedLogId ?? null);
    }, [highlightedLogId]);

    return (
        <div
            id="phaser-container"
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        />
    );
}
