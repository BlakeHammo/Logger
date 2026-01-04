import { useState, useEffect } from 'react';
import PhaserGame from './PhaserGame';

// Define what a "Log Entry" looks like.
export interface LogEntry {
  id: number;
  title: string;
  category: string;
  rating: number;
  x: number; 
  y: number;
}

function App() {
  // --- STATE ---
  
  // 1. Load logs from Local Storage (or start empty)
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('village-logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Form Inputs
  const [inputTitle, setInputTitle] = useState("");
  const [category, setCategory] = useState("Movie");
  const [rating, setRating] = useState(5);

  // --- EFFECTS ---

  // Save to Local Storage whenever 'logs' changes
  useEffect(() => {
    localStorage.setItem('village-logs', JSON.stringify(logs));
  }, [logs]);

  // --- HANDLERS ---

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: LogEntry = {
      id: Date.now(),
      title: inputTitle,
      category: category,
      rating: rating,
      // Random spawn position (0-100 percentage)
      x: Math.random() * 80 + 10, 
      y: Math.random() * 80 + 10 
    };
    
    setLogs([...logs, newLog]); 
    setInputTitle(""); 
  };

  const clearLogs = () => {
    if(confirm("Are you sure you want to delete your village?")) {
        setLogs([]);
    }
  }

  // --- RENDER ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* LEFT SIDE: The Dashboard */}
      <div style={{ 
        width: '300px', 
        padding: '20px', 
        background: '#000000ff', 
        borderRight: '2px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10 // Keep this on top of the game canvas if they overlap
      }}>
        <h2>Yearly Logbook</h2>
        
        <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div>
            <label><strong>Title</strong></label>
            <input 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)} 
              placeholder="E.g. Played Elden Ring" 
              required 
            />
          </div>
          
          <div>
            <label><strong>Category</strong></label>
            <select 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Movie">Movie/Show</option>
              <option value="Game">Video Game</option>
              <option value="Hike">Hike/Nature</option>
              <option value="Gym">Gym/Workout</option>
              <option value="Event">Event</option>
            </select>
          </div>

          <div>
            <label><strong>Rating (1-5)</strong></label>
            <input 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              type="number" 
              min="1" max="5" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))} 
            />
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

        <hr style={{ width: '100%' }} />
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3>History ({logs.length})</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
            {logs.map(log => (
              <li key={log.id} style={{ marginBottom: '5px' }}>
                <strong>{log.category}</strong>: {log.title}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={clearLogs} style={{ marginTop: '10px', background: 'red', color: 'white', border: 'none', padding: '5px' }}>
            Reset Village
        </button>
      </div>

      {/* RIGHT SIDE: The Phaser Game */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
         {/* We pass the logs array into the game component */}
         <PhaserGame logs={logs} />
      </div>

    </div>
  )
}

export default App