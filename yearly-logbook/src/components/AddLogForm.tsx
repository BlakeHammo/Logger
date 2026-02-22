import type { Category } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';

interface Props {
  inputTitle: string;  setInputTitle: (v: string) => void;
  category: Category;  setCategory: (v: Category) => void;
  rating: number;      setRating: (v: number) => void;
  notes: string;       setNotes: (v: string) => void;
  dateInput: string;   setDateInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddLogForm({
  inputTitle, setInputTitle,
  category, setCategory,
  rating, setRating,
  notes, setNotes,
  dateInput, setDateInput,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <div><strong>Date</strong></div>
        <input
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', cursor: 'pointer' }}
          type="date"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
          required
        />
      </div>

      <div>
        <div><strong>Title</strong></div>
        <input
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          value={inputTitle}
          onChange={e => setInputTitle(e.target.value)}
          placeholder="Elden Ring"
          required
        />
      </div>

      <div>
        <div><strong>Category</strong></div>
        <select
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
        >
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
          ))}
        </select>
      </div>

      <div>
        <div><strong>Rating (1–5)</strong></div>
        <input
          style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer', accentColor: 'white' }}
          type="range" min="1" max="5" step="0.5"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
        />
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>{rating}</div>
      </div>

      <div>
        <div><strong>Notes</strong></div>
        <textarea
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional details..."
          rows={3}
        />
      </div>

      <button type="submit" style={{
        padding: '10px', background: '#333', color: 'white',
        border: 'none', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold',
      }}>
        Spawn Character
      </button>
    </form>
  );
}
