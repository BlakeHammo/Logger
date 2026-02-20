import { useEffect, useRef, useState } from 'react';
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
    visibleLogIds?: Set<string> | null;
}

export default function PhaserGame({ logs, characters, onCharacterClick, onCharacterHover, highlightedLogId, visibleLogIds }: Props) {
    const gameRef    = useRef<Phaser.Game | null>(null);
    const sceneRef   = useRef<MainScene | null>(null);
    const spawnedIds = useRef<Set<string>>(new Set());

    // Becomes true after mainscene-ready fires. Adding this to effect #2's
    // dependency array means the spawn effect re-runs exactly once after the
    // scene is ready — at which point the camera has its correct dimensions.
    const [sceneReady, setSceneReady] = useState(false);

    // Refs for callbacks — Phaser always calls the latest version without
    // needing to re-register on every render.
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

        game.events.on('mainscene-ready', (scene: MainScene) => {
            sceneRef.current = scene;
            scene.setCharacterClickCallback((id) => onClickRef.current?.(id));
            scene.setCharacterHoverCallback((id) => onHoverRef.current?.(id));
            // Trigger effect #2 to run. By the time React processes this
            // state update, the camera will have its correct dimensions.
            setSceneReady(true);
        });

        return () => {
            game.destroy(true);
            gameRef.current  = null;
            sceneRef.current = null;
            spawnedIds.current.clear();
            setSceneReady(false);
        };
    }, []);

    // 2. Spawn characters whenever logs change OR the scene first becomes ready
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

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
    }, [logs, characters, sceneReady]);

    // 3. Sync highlight with Phaser
    useEffect(() => {
        sceneRef.current?.highlightCharacter(highlightedLogId ?? null);
    }, [highlightedLogId]);

    // 4. Sync filter visibility — dims non-matching characters via alpha
    useEffect(() => {
        sceneRef.current?.applyVisibilityFilter(visibleLogIds ?? null);
    }, [visibleLogIds]);

    return (
        <div
            id="phaser-container"
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        />
    );
}
