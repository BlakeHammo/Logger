import { useState, useMemo } from 'react';
import PhaserGame from './PhaserGame';
import type { LogEntry, Category } from './types';
import { useLogStore } from './hooks/useLogStore';
import { useFilters } from './hooks/useFilters';
import { usePanelResize } from './hooks/usePanelResize';
import { AddLogForm } from './components/AddLogForm';
import { FilterBar } from './components/FilterBar';
import { EntriesList } from './components/EntriesList';
import { CalendarView } from './components/CalendarView';
import { CharacterDetails } from './components/CharacterDetails';

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

  const currentYear = new Date().getFullYear();

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

  // --- HANDLERS ---
  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({ title: inputTitle.trim(), category, rating, notes, date: new Date(dateInput).toISOString() });
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
    if (selectedCharacter === null) setHighlightedLogId(id);
  };

  // --- HELPERS ---
  const getTabStyle = (tabName: string) => ({
    background: activeTab === tabName ? '#333' : 'transparent',
    color: activeTab === tabName ? '#fff' : '#aaa',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
  });

  // --- RENDER ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* TOP NAVBAR */}
      <div style={{
        height: '60px', background: '#000', borderBottom: '2px solid #fff',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px',
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
          width: `${panelWidth}px`, minWidth: '180px', maxWidth: '700px',
          flexShrink: 0, padding: '20px', background: '#000',
          display: 'flex', flexDirection: 'column', color: 'white',
          overflow: 'auto', boxSizing: 'border-box',
        }}>

          {activeTab === 'add' && (
            <AddLogForm
              inputTitle={inputTitle}   setInputTitle={setInputTitle}
              category={category}       setCategory={setCategory}
              rating={rating}           setRating={setRating}
              notes={notes}             setNotes={setNotes}
              dateInput={dateInput}     setDateInput={setDateInput}
              onSubmit={handleLog}
            />
          )}

          {activeTab === 'entries' && (
            <div>
              <FilterBar
                filterTitle={filterTitle}           setFilterTitle={setFilterTitle}
                filterCategories={filterCategories} toggleCategoryFilter={toggleCategoryFilter}
                filterRatingMin={filterRatingMin}   setFilterRatingMin={setFilterRatingMin}
                filterRatingMax={filterRatingMax}   setFilterRatingMax={setFilterRatingMax}
                filterDateFrom={filterDateFrom}     setFilterDateFrom={setFilterDateFrom}
                filterDateTo={filterDateTo}         setFilterDateTo={setFilterDateTo}
                isFilterActive={isFilterActive}
                clearFilters={clearFilters}
                filteredCount={filteredLogs.length}
                totalCount={logs.length}
              />
              <EntriesList
                groupedLogs={groupedLogs}
                totalCount={logs.length}
                filteredCount={filteredLogs.length}
                selectedDate={selectedDate}
                onLogClick={log => {
                  setSelectedCharacter(log);
                  setActiveTab('details');
                  setHighlightedLogId(log.id);
                  setSelectedDate(null);
                }}
                onLogHoverEnter={id => setHighlightedLogId(id)}
                onLogHoverLeave={() => setHighlightedLogId(null)}
              />
            </div>
          )}

          {activeTab === 'details' && (
            <CharacterDetails
              selectedCharacter={selectedCharacter}
              onClose={() => { setSelectedCharacter(null); setHighlightedLogId(null); }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              calendarDays={calendarDays}
              calendarOffset={calendarOffset}
              logCountByDate={logCountByDate}
              onDayClick={dateKey => {
                setSelectedDate(dateKey);
                setActiveTab('entries');
                clearDateFilters();
              }}
            />
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
            width: '5px', flexShrink: 0, cursor: 'col-resize',
            background: isResizing ? '#555' : '#222',
            borderLeft: '1px solid #333', borderRight: '1px solid #333',
            transition: 'background 0.15s', zIndex: 10,
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
