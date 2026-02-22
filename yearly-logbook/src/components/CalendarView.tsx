interface Props {
  calendarDays: Date[];
  calendarOffset: number;
  logCountByDate: Record<string, number>;
  onDayClick: (dateKey: string) => void;
}

const getHeatColor = (count: number) => {
  if (count === 0) return '#1a1a1a';
  if (count === 1) return '#0e4429';
  if (count === 2) return '#006d32';
  if (count === 3) return '#26a641';
  return '#39d353';
};

export function CalendarView({ calendarDays, calendarOffset, logCountByDate, onDayClick }: Props) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '3px', marginBottom: '5px', fontSize: '0.7rem',
        textAlign: 'center', color: '#aaa',
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginTop: '15px' }}>
        {Array.from({ length: calendarOffset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {calendarDays.map(date => {
          const dateKey = date.toLocaleDateString('en-US');
          const logCount = logCountByDate[dateKey] || 0;

          return (
            <div
              key={dateKey}
              title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${logCount} logs`}
              style={{
                aspectRatio: '1',
                backgroundColor: getHeatColor(logCount),
                borderRadius: '2px',
                cursor: logCount > 0 ? 'pointer' : 'default',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => { if (logCount > 0) e.currentTarget.style.transform = 'scale(1.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={() => { if (logCount > 0) onDayClick(dateKey); }}
            />
          );
        })}
      </div>
    </div>
  );
}
