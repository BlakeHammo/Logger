import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  groupedLogs: Record<string, Record<string, LogEntry[]>>;
  totalCount: number;
  filteredCount: number;
  selectedDate: string | null;
  onLogClick: (log: LogEntry) => void;
  onLogHoverEnter: (id: string) => void;
  onLogHoverLeave: () => void;
}

export function EntriesList({
  groupedLogs,
  totalCount,
  filteredCount,
  selectedDate,
  onLogClick,
  onLogHoverEnter,
  onLogHoverLeave,
}: Props) {
  const highlightedDayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedDate && highlightedDayRef.current) {
      highlightedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate]);

  const isDaySelected = (logsInDay: LogEntry[]) => {
    if (!selectedDate) return false;
    return logsInDay.some(
      log => new Date(log.date).toLocaleDateString('en-US') === selectedDate
    );
  };

  if (filteredCount === 0 && totalCount > 0) {
    return <p style={{ color: '#aaa' }}>No entries match the current filters.</p>;
  }

  if (totalCount === 0) {
    return <p style={{ color: '#aaa' }}>No entries yet.</p>;
  }

  return (
    <>
      {Object.entries(groupedLogs).map(([monthYear, days]) => (
        <div key={monthYear} style={{ marginBottom: '25px' }}>
          <h4 style={{ borderBottom: '1px solid #fff', paddingBottom: '5px', marginBottom: '15px' }}>
            {monthYear}
          </h4>

          {Object.entries(days).map(([dayKey, logsInDay]) => {
            const isSelected = isDaySelected(logsInDay);
            return (
              <div
                key={dayKey}
                ref={isSelected ? highlightedDayRef : null}
                style={{
                  marginBottom: '15px',
                  paddingLeft: '5px',
                  border: isSelected ? '2px solid #fff' : '2px solid transparent',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  fontWeight: 'bold', marginBottom: '5px', fontSize: '0.95rem',
                  color: isSelected ? '#fff' : 'inherit',
                }}>
                  {dayKey}
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', marginTop: '5px' }}>
                  {logsInDay.map(log => (
                    <li
                      key={log.id}
                      style={{ marginBottom: '5px', cursor: 'pointer' }}
                      onMouseEnter={() => onLogHoverEnter(log.id)}
                      onMouseLeave={onLogHoverLeave}
                      onClick={() => onLogClick(log)}
                    >
                      {log.category}: {log.title} {'⭐'.repeat(Math.floor(log.rating))}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
