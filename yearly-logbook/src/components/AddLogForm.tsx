import { useState } from 'react';
import type { Category, LogEntry, CategoryMeta } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';

interface Props {
  onSubmit: (entry: Omit<LogEntry, 'id'>) => void;
}

// Categories that have extra contextual fields in the form
const META_CATEGORIES: Category[] = ['FilmTV', 'Book', 'Game', 'Sport', 'Food', 'Travel', 'Event'];

const MOOD_LABELS: Record<number, string> = {
  1: 'Awful', 1.5: 'Sad', 2: 'Poor', 2.5: 'Meh', 3: 'OK',
  3.5: 'Good', 4: 'Great', 4.5: 'Excellent', 5: 'Amazing',
};

// Reusable pill-button group for selecting one option from a small set
function PillGroup<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '3px 10px',
            background: value === opt ? '#555' : '#1a1a1a',
            color: value === opt ? '#fff' : '#777',
            border: `1px solid ${value === opt ? '#888' : '#444'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px', boxSizing: 'border-box',
  background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: '#888', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '5px',
};

export function AddLogForm({ onSubmit }: Props) {
  // --- Shared form state ---
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState<Category>('FilmTV');
  const [rating, setRating]       = useState(3);
  const [mood, setMood]           = useState(3);
  const [solo, setSolo]           = useState(true);
  const [duration, setDuration]   = useState('');
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'weeks'>('hours');
  const [notes, setNotes]         = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  // --- Category-specific meta state ---
  const [filmTVFormat,  setFilmTVFormat]  = useState<'Film' | 'TV Show'>('Film');
  const [bookStatus,    setBookStatus]    = useState<'Finished' | 'In Progress' | 'DNF'>('Finished');
  const [gameMode,      setGameMode]      = useState<'Single-player' | 'Multiplayer'>('Single-player');
  const [sportResult,   setSportResult]   = useState<'Won' | 'Lost' | 'Drew' | 'N/A'>('N/A');
  const [foodSetting,   setFoodSetting]   = useState<'Restaurant' | 'Home-cooked' | 'Takeaway'>('Restaurant');
  const [travelDest,    setTravelDest]    = useState('');
  const [eventType,     setEventType]     = useState<'Concert' | 'Party' | 'Festival' | 'Exhibition' | 'Other'>('Concert');

  const buildCategoryMeta = (): CategoryMeta | undefined => {
    switch (category) {
      case 'FilmTV':  return { type: 'filmtv', format: filmTVFormat };
      case 'Book':    return { type: 'book', status: bookStatus };
      case 'Game':    return { type: 'game', mode: gameMode };
      case 'Sport':   return { type: 'sport', result: sportResult };
      case 'Food':    return { type: 'food', setting: foodSetting };
      case 'Travel':  return travelDest.trim() ? { type: 'travel', destination: travelDest.trim() } : undefined;
      case 'Event':   return { type: 'event', eventType };
      default:        return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      category,
      rating,
      mood,
      solo,
      duration:     duration ? Number(duration) : undefined,
      durationUnit: duration ? durationUnit : undefined,
      notes,
      date: new Date(dateInput).toISOString(),
      categoryMeta: buildCategoryMeta(),
    });
    // Reset fields that should clear after submission
    setTitle('');
    setNotes('');
    setDuration('');
    setTravelDest('');
  };

  const hasMeta = META_CATEGORIES.includes(category);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Date */}
      <div>
        <div style={labelStyle}>Date</div>
        <input
          style={{ ...inputStyle, cursor: 'pointer' }}
          type="date"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
          required
        />
      </div>

      {/* Title */}
      <div>
        <div style={labelStyle}>Title</div>
        <input
          style={inputStyle}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Oppenheimer, Elden Ring, Lake District..."
          required
        />
      </div>

      {/* Category */}
      <div>
        <div style={labelStyle}>Category</div>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
        >
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
          <span>Rating — how good was it?</span>
          <span style={{ color: '#ccc' }}>{rating} / 5</span>
        </div>
        <input
          style={{ width: '100%', cursor: 'pointer', accentColor: '#a020f0' }}
          type="range" min="1" max="5" step="0.5"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
        />
      </div>

      {/* Mood */}
      <div>
        <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
          <span>Mood — how did it make you feel?</span>
          <span style={{ color: '#ccc' }}>{MOOD_LABELS[mood]}</span>
        </div>
        <input
          style={{ width: '100%', cursor: 'pointer', accentColor: '#ff7c2a' }}
          type="range" min="1" max="5" step="0.5"
          value={mood}
          onChange={e => setMood(Number(e.target.value))}
        />
      </div>

      {/* Solo / Social */}
      <div>
        <div style={labelStyle}>Who was there?</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setSolo(true)}
            style={{
              flex: 1, padding: '7px',
              background: solo ? '#333' : '#111',
              color: solo ? '#fff' : '#666',
              border: `1px solid ${solo ? '#777' : '#444'}`,
              borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Solo
          </button>
          <button
            type="button"
            onClick={() => setSolo(false)}
            style={{
              flex: 1, padding: '7px',
              background: !solo ? '#333' : '#111',
              color: !solo ? '#fff' : '#666',
              border: `1px solid ${!solo ? '#777' : '#444'}`,
              borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            With others
          </button>
        </div>
      </div>

      {/* Duration (optional) */}
      <div>
        <div style={labelStyle}>Duration (optional)</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="number"
            min="0"
            step="0.5"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 2"
            style={{ ...inputStyle, flex: 1 }}
          />
          <select
            value={durationUnit}
            onChange={e => setDurationUnit(e.target.value as 'hours' | 'days' | 'weeks')}
            style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </div>
      </div>

      {/* Category-specific meta */}
      {hasMeta && (
        <div style={{
          borderTop: '1px solid #2a2a2a',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ ...labelStyle, color: '#555' }}>
            {CATEGORY_CONFIG[category].label} details
          </div>

          {category === 'FilmTV' && (
            <div>
              <div style={labelStyle}>Format</div>
              <PillGroup options={['Film', 'TV Show'] as const} value={filmTVFormat} onChange={setFilmTVFormat} />
            </div>
          )}

          {category === 'Book' && (
            <div>
              <div style={labelStyle}>Status</div>
              <PillGroup options={['Finished', 'In Progress', 'DNF'] as const} value={bookStatus} onChange={setBookStatus} />
            </div>
          )}

          {category === 'Game' && (
            <div>
              <div style={labelStyle}>Mode</div>
              <PillGroup options={['Single-player', 'Multiplayer'] as const} value={gameMode} onChange={setGameMode} />
            </div>
          )}

          {category === 'Sport' && (
            <div>
              <div style={labelStyle}>Result</div>
              <PillGroup options={['Won', 'Lost', 'Drew', 'N/A'] as const} value={sportResult} onChange={setSportResult} />
            </div>
          )}

          {category === 'Food' && (
            <div>
              <div style={labelStyle}>Setting</div>
              <PillGroup options={['Restaurant', 'Home-cooked', 'Takeaway'] as const} value={foodSetting} onChange={setFoodSetting} />
            </div>
          )}

          {category === 'Travel' && (
            <div>
              <div style={labelStyle}>Destination (optional)</div>
              <input
                style={inputStyle}
                value={travelDest}
                onChange={e => setTravelDest(e.target.value)}
                placeholder="e.g. Tokyo, Scottish Highlands..."
              />
            </div>
          )}

          {category === 'Event' && (
            <div>
              <div style={labelStyle}>Type</div>
              <PillGroup
                options={['Concert', 'Party', 'Festival', 'Exhibition', 'Other'] as const}
                value={eventType}
                onChange={setEventType}
              />
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <div style={labelStyle}>Notes</div>
        <textarea
          style={{ ...inputStyle, resize: 'vertical' }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional thoughts..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: '10px', background: '#222', color: 'white',
          border: '1px solid #555', borderRadius: '6px',
          cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
          marginTop: '4px',
        }}
      >
        Spawn Character
      </button>
    </form>
  );
}
