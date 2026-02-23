import type { LogEntry, CategoryMeta } from '../types';

interface Props {
  selectedCharacter: LogEntry | null;
  onClose: () => void;
}

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const formatDuration = (duration: number, unit: 'hours' | 'days' | 'weeks') =>
  `${duration} ${unit}${duration === 1 ? '' : ''}`;

const formatMeta = (meta: CategoryMeta): string => {
  switch (meta.type) {
    case 'filmtv':  return meta.format;
    case 'book':    return meta.status;
    case 'game':    return meta.mode;
    case 'sport':   return meta.result !== 'N/A' ? `Result: ${meta.result}` : 'Non-competitive';
    case 'food':    return meta.setting;
    case 'travel':  return meta.destination;
    case 'event':   return meta.eventType;
  }
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Awful', 1.5: 'Bad', 2: 'Poor', 2.5: 'Meh', 3: 'OK',
  3.5: 'Good', 4: 'Great', 4.5: 'Excellent', 5: 'Amazing',
};

const fieldStyle: React.CSSProperties = { margin: '6px 0', fontSize: '0.9rem' };
const labelStyle: React.CSSProperties = { color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

export function CharacterDetails({ selectedCharacter, onClose }: Props) {
  if (!selectedCharacter) {
    return <p style={{ color: '#aaa' }}>Click a character or entry to see details.</p>;
  }

  const {
    title, category, rating, mood, solo, duration, durationUnit, notes, date, categoryMeta,
  } = selectedCharacter;

  return (
    <div style={{
      padding: '15px', background: '#111', borderRadius: '8px',
      border: '1px solid #444', display: 'flex', flexDirection: 'column', gap: '2px',
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
        {title}
      </h3>

      <div style={fieldStyle}>
        <div style={labelStyle}>Category</div>
        <span>{category}{categoryMeta ? ` · ${formatMeta(categoryMeta)}` : ''}</span>
      </div>

      <div style={fieldStyle}>
        <div style={labelStyle}>Date</div>
        <span>{formatDate(date)}</span>
      </div>

      <div style={fieldStyle}>
        <div style={labelStyle}>Rating</div>
        <span>{'★'.repeat(Math.floor(rating))}{rating % 1 ? '½' : ''} ({rating}/5)</span>
      </div>

      {mood !== undefined && (
        <div style={fieldStyle}>
          <div style={labelStyle}>Mood</div>
          <span>{MOOD_LABELS[mood] ?? mood} ({mood}/5)</span>
        </div>
      )}

      {solo !== undefined && (
        <div style={fieldStyle}>
          <div style={labelStyle}>With</div>
          <span>{solo ? 'Solo' : 'With others'}</span>
        </div>
      )}

      {duration !== undefined && durationUnit && (
        <div style={fieldStyle}>
          <div style={labelStyle}>Duration</div>
          <span>{formatDuration(duration, durationUnit)}</span>
        </div>
      )}

      {notes && (
        <div style={{ ...fieldStyle, marginTop: '8px' }}>
          <div style={labelStyle}>Notes</div>
          <p style={{ margin: '4px 0 0 0', color: '#ccc', lineHeight: 1.5 }}>{notes}</p>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: '14px', background: 'transparent', color: '#888',
          border: '1px solid #444', padding: '5px 10px', cursor: 'pointer',
          fontSize: '0.8rem', borderRadius: '4px', alignSelf: 'flex-start',
        }}
      >
        Close
      </button>
    </div>
  );
}
