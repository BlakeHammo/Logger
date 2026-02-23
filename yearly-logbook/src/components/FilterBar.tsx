import type { Category } from '../types';
import { CATEGORY_CONFIG } from '../categoryConfig';
import { DualRangeSlider } from './DualRangeSlider';

type SoloFilter  = 'all' | 'solo' | 'social';
type DurationUnit = 'hours' | 'days' | 'weeks';

interface Props {
  filterTitle: string;          setFilterTitle: (v: string) => void;
  filterCategories: Category[]; toggleCategoryFilter: (cat: Category) => void;
  filterRatingMin: number;      setFilterRatingMin: (v: number) => void;
  filterRatingMax: number;      setFilterRatingMax: (v: number) => void;
  filterMoodMin: number;        setFilterMoodMin: (v: number) => void;
  filterMoodMax: number;        setFilterMoodMax: (v: number) => void;
  filterSolo: SoloFilter;       setFilterSolo: (v: SoloFilter) => void;
  filterDurationMin: string;        setFilterDurationMin: (v: string) => void;
  filterDurationMinUnit: DurationUnit; setFilterDurationMinUnit: (v: DurationUnit) => void;
  filterDateFrom: string;       setFilterDateFrom: (v: string) => void;
  filterDateTo: string;         setFilterDateTo: (v: string) => void;
  isFilterActive: boolean;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const phaserColorToCss = (color: number) =>
  '#' + color.toString(16).padStart(6, '0');

const sectionLabel: React.CSSProperties = {
  color: '#666', fontSize: '0.7rem', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '5px',
};

const inputBase: React.CSSProperties = {
  background: '#222', color: '#fff', border: '1px solid #555',
  borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.75rem',
};

export function FilterBar({
  filterTitle, setFilterTitle,
  filterCategories, toggleCategoryFilter,
  filterRatingMin, setFilterRatingMin,
  filterRatingMax, setFilterRatingMax,
  filterMoodMin, setFilterMoodMin,
  filterMoodMax, setFilterMoodMax,
  filterSolo, setFilterSolo,
  filterDurationMin, setFilterDurationMin,
  filterDurationMinUnit, setFilterDurationMinUnit,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  isFilterActive, clearFilters,
  filteredCount, totalCount,
}: Props) {
  return (
    <div style={{
      marginBottom: '15px', padding: '10px',
      background: '#111', border: '1px solid #333',
      borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px',
      fontSize: '0.8rem',
    }}>

      {/* Title search */}
      <input
        type="text"
        placeholder="Search title..."
        value={filterTitle}
        onChange={e => setFilterTitle(e.target.value)}
        style={{ ...inputBase, padding: '4px 8px', width: '100%' }}
      />

      {/* Category toggles */}
      <div>
        <div style={sectionLabel}>Category</div>
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
                  background: isActive ? cssColor : '#222',
                  color: isActive ? '#000' : '#aaa',
                  border: `1px solid ${cssColor}`,
                  borderRadius: '12px', cursor: 'pointer',
                  fontSize: '0.7rem', fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {CATEGORY_CONFIG[cat].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <div style={sectionLabel}>Rating: {filterRatingMin} – {filterRatingMax}</div>
        <DualRangeSlider
          min={1} max={5} step={0.5}
          valueMin={filterRatingMin} valueMax={filterRatingMax}
          onChangeMin={setFilterRatingMin} onChangeMax={setFilterRatingMax}
        />
      </div>

      {/* Mood */}
      <div>
        <div style={sectionLabel}>Mood: {filterMoodMin} – {filterMoodMax}</div>
        <DualRangeSlider
          min={1} max={5} step={0.5}
          valueMin={filterMoodMin} valueMax={filterMoodMax}
          onChangeMin={setFilterMoodMin} onChangeMax={setFilterMoodMax}
        />
      </div>

      {/* Solo / Social */}
      <div>
        <div style={sectionLabel}>Who</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'solo', 'social'] as SoloFilter[]).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterSolo(opt)}
              style={{
                flex: 1, padding: '3px 0',
                background: filterSolo === opt ? '#444' : '#1a1a1a',
                color: filterSolo === opt ? '#fff' : '#666',
                border: `1px solid ${filterSolo === opt ? '#777' : '#333'}`,
                borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
              }}
            >
              {opt === 'all' ? 'All' : opt === 'solo' ? 'Solo' : 'With others'}
            </button>
          ))}
        </div>
      </div>

      {/* Min Duration */}
      <div>
        <div style={sectionLabel}>Min Duration</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input
            type="number"
            min="0"
            step="0.5"
            value={filterDurationMin}
            onChange={e => setFilterDurationMin(e.target.value)}
            placeholder="any"
            style={{ ...inputBase, flex: 1, padding: '3px 6px' }}
          />
          <select
            value={filterDurationMinUnit}
            onChange={e => setFilterDurationMinUnit(e.target.value as DurationUnit)}
            style={{ ...inputBase, cursor: 'pointer', padding: '3px 4px' }}
          >
            <option value="hours">hrs</option>
            <option value="days">days</option>
            <option value="weeks">wks</option>
          </select>
        </div>
      </div>

      {/* Date range */}
      <div>
        <div style={sectionLabel}>Date Range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="date" value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
            style={{ ...inputBase, width: '100%', padding: '3px 6px', cursor: 'pointer' }}
          />
          <input
            type="date" value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
            style={{ ...inputBase, width: '100%', padding: '3px 6px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Clear — only when a filter is active */}
      {isFilterActive && (
        <button
          onClick={clearFilters}
          style={{
            background: 'transparent', color: '#888',
            border: '1px solid #444', padding: '3px 8px',
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
