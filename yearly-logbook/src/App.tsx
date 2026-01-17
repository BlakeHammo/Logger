import { useState, useEffect } from 'react';
import PhaserGame from './PhaserGame';
// Main Controller

export interface LogEntry {
  id: number;
  title: string;
  category: string;
  rating: number;
  notes: string;
  date: string;
  x: number; 
  y: number;
}

function App() {
  // --- STATE ---
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('village-logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputTitle, setInputTitle] = useState("");
  const [category, setCategory] = useState("Movie");
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  
  // NEW: State for showing character details
  const [selectedCharacter, setSelectedCharacter] = useState<{
    id: number;
    title: string;
    category: string;
    rating: number;
    notes: string;
    date: string;
  } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'add' | 'entries' | 'details' | 'calendar'>('add');

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('village-logs', JSON.stringify(logs));
  }, [logs]); // Save logs to localStorage whenever they change

  useEffect(() => {
    setDateInput(new Date().toISOString().split('T')[0]);
  }, []); // Set date input to today on initial load


  // --- HANDLERS ---
  const handleLog = (e: React.FormEvent) => {
    e.preventDefault(); // stops page from refreshing

    const newLog: LogEntry = {
      id: Date.now(),   // Unique ID using timestamp
      title: inputTitle,
      category: category,
      rating: rating,
      notes: notes,
      date: new Date(dateInput).toISOString(),
      x: Math.random() * 80 + 10, // Random X between 10-90%
      y: Math.random() * 80 + 10  // Random Y between 10-90%
    };
    
    setLogs([...logs, newLog]);   // Add to array (creates new array)
    setInputTitle("");            // Clear input field
    setNotes("");                 // Clear notes field
  };

  const clearLogs = () => {
    if(confirm("Are you sure you want to delete your village?")) {
        setLogs([]);
        setSelectedCharacter(null); // Clear selection when resetting
    }
  };

  // Handle character clicks - receives just the ID
  const handleCharacterClick = (id: number) => {
    const log = logs.find(l => l.id === id);
    if (log) {
      setSelectedCharacter(log);
      setActiveTab('details');
    }
  };

  // Helper function to format date nicely
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group by month, then by day
  const groupLogsByMonthAndDay = (logs: LogEntry[]) => {
    const grouped: Record<string, Record<string, LogEntry[]>> = {};
    
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedLogs.forEach(log => {
      const date = new Date(log.date);
      
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });

      const dayKey = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric' 
      }); 
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {};
      }

      if (!grouped[monthYear][dayKey]) {
        grouped[monthYear][dayKey] = [];
      }

      grouped[monthYear][dayKey].push(log);
    });
    
    return grouped;
  };


  const getTabStyle = (tabName: string) => ({
    background: activeTab === tabName ? '#333' : 'transparent',
    color: activeTab === tabName ? '#fff' : '#aaa',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
  });



  const generateYearCalendar = (year: number) => {
    const days = [];
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31); // December 31st of the given year

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const getLogCountByDate = (logs: LogEntry[]) => {
    const counts: Record<string, number> = {};

    logs.forEach(log => {
      const dateKey = new Date(log.date).toLocaleDateString('en-US');
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    return counts;
  };

  // --- RENDER ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* TOP NAVBAR */}
        <div style={{
          height: '60px',
          background: '#000',
          borderBottom: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '10px'
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Yearly Logbook</h2>

          {/* Tab buttons will go here - we'll add these in step 2 */}
          <button onClick={() => {
              setActiveTab('add'); 
              setSelectedCharacter(null); // Clear selection when leaving details
            }}
            style={getTabStyle('add')}
          >
            Add Log
          </button>
          
          <button onClick={() => {
              setActiveTab('entries'); 
              setSelectedCharacter(null); // Clear selection when leaving details
            }}
            style={getTabStyle('entries')}
          >
            Entries
          </button>

          <button onClick={() => {
              setActiveTab('details'); 
            }}
            style={getTabStyle('details')}
          >
            Details
          </button>

          <button onClick={() => {
              setActiveTab('calendar');
              setSelectedCharacter(null); // Clear selection when leaving details 
            }}
            style={getTabStyle('calendar')}
          >
            Calendar
          </button>

        </div>



      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT SIDE: The Dashboard */}
        <div style={{ 
          width: '15%', 
          padding: '20px', 
          background: '#000000ff', 
          borderRight: '2px solid #ffffffff',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          overflow: 'scroll'
        }}>          
        
          {activeTab === 'add' && ( // -- ADD new log entry --------------------------------------------------------------------------------
            <div>
              {<form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
              
              <div>
                <div><strong>Date</strong></div>
                <input 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', cursor: 'pointer' }}
                  type="date" 
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)} 
                  required 
                />
              </div>
              
              <div>
                <div><strong>Title</strong></div>
                <input 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)} 
                  placeholder="Elden Ring" 
                  required 
                />
              </div>
              
              <div>
                <div><strong>Category</strong></div>
                <select 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Movie">Movie</option>
                  <option value="Game">Video Game</option>
                  <option value="Hike">Hike</option>
                  <option value="Gym">Gym/Workout</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div>
                <div><strong>Rating (1-5)</strong></div>
                <input 
                  style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer', accentColor: 'white'}}
                  type="range" 
                  min="1" max="5"
                  step= "0.5"
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))} 
                />
                <div
                  style={{ textAlign: 'center', fontSize: '2rem', boxSizing: 'border-box'}}
                >{rating}</div>
              </div>

              <div>
                <div><strong>Notes</strong></div>
                <textarea 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Additional details..."
                  rows={3}
                ></textarea>
              </div>

              <button 
                type="submit" 
                style={{ 
                  padding: '10px', 
                  background: '#333', 
                  color: 'white', 
                  border: 'none', 
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontWeight: 'bold'
                }}
              >
                Spawn Character
              </button>
              </form>
              }   
            </div>
          )}
          
          {activeTab === 'entries' && ( // -- Log HISTORY --------------------------------------------------------------------------------------------------
            <div>
              {logs.length === 0 ? (
                <p style={{ color: '#aaa' }}>No entries yet.</p>
              ) : (
                Object.entries(groupLogsByMonthAndDay(logs)).map(([monthYear, days]) => (
                  <div key={monthYear} style={{ marginBottom: '25px' }}>
                    <h4 style={{ borderBottom: '1px solid #fff', paddingBottom: '5px',marginBottom: '15px'}}>
                      {monthYear}
                    </h4>
                    
                    {Object.entries(days).map(([dayKey, logsInDay]) => (
                      <div key={dayKey} style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px',fontSize: '0.95rem'}}>
                          {dayKey}
                        </div>
                        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', marginTop: '5px' }}>
                          {logsInDay.map(log => (
                            <li 
                              key={log.id}
                              style={{ marginBottom: '5px', cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedCharacter(log);
                                setActiveTab('details');
                              }}
                            >
                              {log.category}: {log.title} {'⭐'.repeat(Math.floor(log.rating))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === 'calendar' && ( // -- Calendar View --------------------------------------------------------------------------------------------------
            <div>
              <div style = {{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '5px', fontSize: '0.7rem', textAlign: 'center', color: '#aaa' }}>
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginTop: '15px'}}>
                
                { /* Add empty cells for the offset */}
                {(() => {
                  const firstDay = new Date(2026, 0, 1).getDay(); // January 1, 2026
                  const emptyCells = [];
                  for (let i = 0; i < firstDay; i++) {
                    emptyCells.push(<div key={`empty-${i}`}></div>);
                  }
                  return emptyCells;
                })()}
                
                
                {generateYearCalendar(2026).map(date => {
                  const dateKey = date.toLocaleDateString('en-US');
                  const logCount = getLogCountByDate(logs)[dateKey] || 0;

                  // Color intensity based on log count
                  let bgColor = '#1a1a1a'; // No logs
                  if (logCount === 1) bgColor = '#0e4429';
                  if (logCount === 2) bgColor = '#006d32';
                  if (logCount === 3) bgColor = '#26a641';
                  if (logCount >= 4) bgColor = '#39d353';

                  return (
                    <div
                      key = {dateKey}
                      title = {`${date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}: ${logCount} logs`}
                      style ={{ aspectRatio: '1', backgroundColor: bgColor, borderRadius: '2px', cursor: logCount > 0 ? 'pointer' : 'default', transition: 'transform 0.2s' }}
                      onMouseOver = {(e) => {
                        if (logCount > 0) {
                          e.currentTarget.style.transform = 'scale(1.2)';
                        }
                      }}
                      
                      onMouseOut = {(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      
                      onClick = {() => {
                        if (logCount > 0) {
                          // Find logs for this day and show them
                          const logsForDay = logs.filter(log =>
                            new Date(log.date).toLocaleDateString('en-US') === dateKey
                          );

                          console.log('Logs for', dateKey, logsForDay)
                        }
                      }}
                    />
                  );   
                })}
              </div>
            </div>
          )}

          {selectedCharacter && ( // when character selected, show details
            <div style={{
              padding: '15px',
              background: '#222',
              borderRadius: '8px',
              marginBottom: '15px',
              marginTop: '15px',
              border: '2px solid #ffffffff'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Selected Character</h3>
              <p style={{ margin: '5px 0' }}><strong>Title:</strong> {selectedCharacter.title}</p>
              <p style={{ margin: '5px 0' }}><strong>Category:</strong> {selectedCharacter.category}</p>
              <p style={{ margin: '5px 0' }}><strong>Rating:</strong> {'⭐'.repeat(selectedCharacter.rating)}</p>
              <p style={{ margin: '5px 0' }}><strong>Notes:</strong> {selectedCharacter.notes}</p>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {formatDate(selectedCharacter.date)}</p>
              <button 
                onClick={() => setSelectedCharacter(null)}
                style={{ 
                  marginTop: '10px', 
                  background: '#444', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Close
              </button>
            </div>
          )}
          
          <button 
            onClick={clearLogs} 
            style={{ 
              marginTop: '10px', 
              background: 'red', 
              color: 'white', 
              border: 'none', 
              padding: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reset Village
          </button>
        </div>

        {/* RIGHT SIDE: The Phaser Game */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          <PhaserGame logs={logs} onCharacterClick={handleCharacterClick} />
        </div>

      </div>
    </div>
  )
}

export default App