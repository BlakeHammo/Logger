import { useState, useEffect } from 'react';
import type { LogEntry, CharacterState } from '../types';

export function useLogStore() {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('village-logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [characters, setCharacters] = useState<CharacterState[]>(() => {
    const saved = localStorage.getItem('village-characters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('village-logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('village-characters', JSON.stringify(characters));
  }, [characters]);

  // Creates a paired LogEntry + CharacterState with a shared UUID.
  // Random position is generated here because it's a data-creation concern,
  // not a UI concern — the caller doesn't need to know about it.
  const addEntry = (entry: Omit<LogEntry, 'id'>) => {
    const id = crypto.randomUUID();
    setLogs(prev => [...prev, { ...entry, id }]);
    setCharacters(prev => [...prev, {
      logId: id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }]);
  };

  const clearAll = () => {
    setLogs([]);
    setCharacters([]);
  };

  return { logs, characters, addEntry, clearAll };
}
