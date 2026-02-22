import { useState, useEffect, useRef, useMemo } from 'react';
import PhaserGame from './PhaserGame';
import type { LogEntry, Category } from './types';
import { CATEGORY_CONFIG } from './categoryConfig';
import { DualRangeSlider } from './components/DualRangeSlider';
import { useLogStore } from './hooks/useLogStore';
import { useFilters } from './hooks/useFilters';
import { usePanelResize } from './hooks/usePanelResize';

function App() {
  // --- HOOKS ---
  const { logs, characters, addEntry, clearAll } = useLogStore();
  const {
    filterTitle,      setFilterTitle,
    filterCategories, toggleCategoryFilter,
    filterRatingMin,  setFilterRatingMin,
    filterRatingMax,  setFilterRatingMax,
    filterDateFrom,   setFilterDateFrom,
    filterDateTo,     setFilterDateTo,
    filteredLogs,
    visibleLogIds,
    isFilterActive,
    groupedLogs,
    clearFilters,
    clearDateFilters,
  } = useFilters(logs);
  const { panelWidth, isResizing, onResizeStart } = usePanelResize();

  // --- STATE ---
  const [inputTitle, setInputTitle] = useState('');
  const [category, setCategory] = useState<Category>('Movie');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedCharacter, setSelectedCharacter] = useState<LogEntry | null>(null);
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'add' | 'entries' | 'details' | 'calendar'>('add');

  const highlightedDayRef = useRef<HTMLDivElement | null>(null);
  const currentYear = new Date().getFullYear();

  // --- EFFECTS ---
  useEffect(() => {
    if (selectedDate && highlightedDayRef.current) {
      highlightedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate]);

  // --- HANDLERS ---
  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      title: inputTitle.trim(),
      category,
      rating,
      notes,
      date: new Date(dateInput).toISOString(),
    });
    setInputTitle('');
    setNotes('');
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to delete your village?')) {
      clearAll();
      setSelectedCharacter(null);
      setHighlightedLogId(null);
    }
  };

  const handleCharacterClick = (id: string) => {
    const log = logs.find(l => l.id === id);
    if (log) {
      setSelectedCharacter(log);
      setActiveTab('details');
      setHighlightedLogId(id);
    }
  };

  const handleCharacterHover = (id: string | null) => {
    if (selectedCharacter === null) {
      setHighlightedLogId(id);
    }
  };

  // --- MEMOISED DERIVED DATA ---
  const logCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const key = new Date(log.date).toLocaleDateString('en-US');
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [logs]);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [currentYear]);

  const calendarOffset = useMemo(
    () => new Date(currentYear, 0, 1).getDay(),
    [currentYear]
  );

  // --- HELPERS ---
  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getTabStyle = (tabName: string) => ({
    background: activeTab === tabName ? '#333' : 'transparent',
    color: activeTab === tabName ? '#fff' : '#aaa',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
  });

  const isDaySelected = (logsInDay: LogEntry[]) => {
    if (!selectedDate) return false;
    return logsInDay.some(
      log => new Date(log.date).toLocaleDateString('en-US') === selectedDate
    );
  };

  const getHeatColor = (count: number) => {
    if (count === 0) return '#1a1a1a';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#39d353';
  };

  // Convert a Phaser hex number (e.g. 0xa020f0) to a CSS hex string (#a020f0)
  const phaserColorToCss = (color: number) =>
    '#' + color.toString(16).padStart(6, '0');

  // --- RENDER ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* TOP NAVBAR */}
      <div style={{
        height: '60px',
        background: '#000',
        borderBottom: '2px solid #fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '10px',
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Yearly Logbook</h2>

        <button onClick={() => { setActiveTab('add'); setSelectedCharacter(null); setSelectedDate(null); }}
          style={getTabStyle('add')}>Add Log</button>

        <button onClick={() => { setActiveTab('entries'); setSelectedCharacter(null); setSelectedDate(null); }}
          style={getTabStyle('entries')}>Entries</button>

        <button onClick={() => setActiveTab('details')}
          style={getTabStyle('details')}>Details</button>

        <button onClick={() => { setActiveTab('calendar'); setSelectedCharacter(null); setSelectedDate(null); }}
          style={getTabStyle('calendar')}>Calendar</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT SIDE: Dashboard */}
        <div style={{
          width: `${panelWidth}px`,
          minWidth: '180px',
          maxWidth: '700px',
          flexShrink: 0,
          padding: '20px',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}>

          {/* ADD TAB */}
          {activeTab === 'add' && (
            <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          )}

          {/* ENTRIES TAB */}
          {activeTab === 'entries' && (
            <div>
              {/* FILTER BAR */}
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
                    Clear filters ({filteredLogs.length}/{logs.length})
                  </button>
                )}
              </div>

              {/* LOG LIST */}
              {filteredLogs.length === 0 && logs.length > 0 ? (
                <p style={{ color: '#aaa' }}>No entries match the current filters.</p>
              ) : logs.length === 0 ? (
                <p style={{ color: '#aaa' }}>No entries yet.</p>
              ) : (
                Object.entries(groupedLogs).map(([monthYear, days]) => (
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
                                onMouseEnter={() => setHighlightedLogId(log.id)}
                                onMouseLeave={() => setHighlightedLogId(null)}
                                onClick={() => {
                                  setSelectedCharacter(log);
                                  setActiveTab('details');
                                  setHighlightedLogId(log.id);
                                  setSelectedDate(null);
                                }}
                              >
                                {log.category}: {log.title} {'⭐'.repeat(Math.floor(log.rating))}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div>
              {selectedCharacter ? (
                <div style={{
                  padding: '15px', background: '#222', borderRadius: '8px',
                  border: '2px solid #fff',
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Selected Character</h3>
                  <p style={{ margin: '5px 0' }}><strong>Title:</strong> {selectedCharacter.title}</p>
                  <p style={{ margin: '5px 0' }}><strong>Category:</strong> {selectedCharacter.category}</p>
                  <p style={{ margin: '5px 0' }}><strong>Rating:</strong> {'⭐'.repeat(selectedCharacter.rating)}</p>
                  <p style={{ margin: '5px 0' }}><strong>Notes:</strong> {selectedCharacter.notes}</p>
                  <p style={{ margin: '5px 0' }}><strong>Date:</strong> {formatDate(selectedCharacter.date)}</p>
                  <button
                    onClick={() => { setSelectedCharacter(null); setHighlightedLogId(null); }}
                    style={{
                      marginTop: '10px', background: '#444', color: 'white',
                      border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '0.9rem',
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <p style={{ color: '#aaa' }}>Click a character or entry to see details.</p>
              )}
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
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
                      onClick={() => {
                        if (logCount > 0) {
                          setSelectedDate(dateKey);
                          setActiveTab('entries');
                          // Clear date filters so they don't hide the target day
                          clearDateFilters();
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* RESET BUTTON — always visible */}
          <button
            onClick={clearLogs}
            style={{
              marginTop: 'auto', background: 'red', color: 'white',
              border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            Reset Village
          </button>
        </div>

        {/* RESIZE HANDLE */}
        <div
          onMouseDown={onResizeStart}
          style={{
            width: '5px',
            flexShrink: 0,
            cursor: 'col-resize',
            background: isResizing ? '#555' : '#222',
            borderLeft: '1px solid #333',
            borderRight: '1px solid #333',
            transition: 'background 0.15s',
            zIndex: 10,
          }}
        />

        {/* RIGHT SIDE: Phaser Game */}
        <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden' }}>
          {/* Transparent overlay during drag — prevents the canvas swallowing mouse events */}
          {isResizing && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'col-resize' }} />
          )}
          <PhaserGame
            logs={logs}
            characters={characters}
            onCharacterClick={handleCharacterClick}
            onCharacterHover={handleCharacterHover}
            highlightedLogId={highlightedLogId}
            visibleLogIds={isFilterActive ? visibleLogIds : null}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
