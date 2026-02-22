import { useState, useEffect, useRef } from 'react';

const MIN_WIDTH = 180;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 300;

export function usePanelResize() {
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('panel-width');
    return saved ? Number(saved) : DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);

  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, width: 0 });

  useEffect(() => {
    localStorage.setItem('panel-width', String(panelWidth));
  }, [panelWidth]);

  // Document-level listeners registered once — refs keep values current
  // without needing to be in the dependency array.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStart.current.x;
      const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStart.current.width + delta));
      setPanelWidth(clamped);
    };

    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onResizeStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, width: panelWidth };
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  return { panelWidth, isResizing, onResizeStart };
}
