import type { Category } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';
import { DualRangeSlider } from './DualRangeSlider';

interface Props {
  filterTitle: string;          setFilterTitle: (v: string) => void;
  filterCategories: Category[]; toggleCategoryFilter: (cat: Category) => void;
  filterRatingMin: number;      setFilterRatingMin: (v: number) => void;
  filterRatingMax: number;      setFilterRatingMax: (v: number) => void;
  filterDateFrom: string;       setFilterDateFrom: (v: string) => void;
  filterDateTo: string;         setFilterDateTo: (v: string) => void;
  isFilterActive: boolean;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const phaserColorToCss = (color: number) =>
  '#' + color.toString(16).padStart(6, '0');

export function FilterBar({
  filterTitle, setFilterTitle,
  filterCategories, toggleCategoryFilter,
  filterRatingMin, setFilterRatingMin,
  filterRatingMax, setFilterRatingMax,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  isFilterActive, clearFilters,
  filteredCount, totalCount,
}: Props) {
  return (
    <div style={{
      marginBottom: '15px',
      padding: '10px',
      background: '#111',
      border: '1px solid #444',
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '0.8rem',
    }}>
      {/* Title search */}
      <input
        type="text"
        placeholder="Search title..."
        value={filterTitle}
        onChange={e => setFilterTitle(e.target.value)}
        style={{
          background: '#222', color: '#fff', border: '1px solid #555',
          padding: '4px 8px', borderRadius: '4px', width: '100%',
          boxSizing: 'border-box', fontSize: '0.8rem',
        }}
      />

      {/* Category toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
          const isActive = filterCategories.includes(cat);
          const cssColor = phaserColorToCss(CATEGORY_CONFIG[cat].color);
          return (
            <button
              key={cat}
              onClick={() => toggleCategoryFilter(cat)}
              style={{
                padding: '2px 8px',
                background: isActive ? cssColor : '#333',
                color: isActive ? '#000' : '#aaa',
                border: `1px solid ${cssColor}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              {CATEGORY_CONFIG[cat].label}
            </button>
          );
        })}
      </div>

      {/* Rating range */}
      <div>
        <div style={{ color: '#aaa', marginBottom: '6px', fontSize: '0.75rem' }}>
          Rating: {filterRatingMin} – {filterRatingMax}
        </div>
        <DualRangeSlider
          min={1} max={5} step={0.5}
          valueMin={filterRatingMin}
          valueMax={filterRatingMax}
          onChangeMin={setFilterRatingMin}
          onChangeMax={setFilterRatingMax}
        />
      </div>

      {/* Date range — stacked so it fits at any panel width */}
      <div style={{ color: '#aaa', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
        Date Range:
        <input
          type="date"
          value={filterDateFrom}
          onChange={e => setFilterDateFrom(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#222', color: '#fff',
            border: '1px solid #555', padding: '3px 6px',
            borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer',
          }}
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={e => setFilterDateTo(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#222', color: '#fff',
            border: '1px solid #555', padding: '3px 6px',
            borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer',
          }}
        />
      </div>

      {/* Clear button — only shown when a filter is active */}
      {isFilterActive && (
        <button
          onClick={clearFilters}
          style={{
            background: 'transparent', color: '#aaa',
            border: '1px solid #555', padding: '3px 8px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
            alignSelf: 'flex-end',
          }}
        >
          Clear filters ({filteredCount}/{totalCount})
        </button>
      )}
    </div>
  );
}
