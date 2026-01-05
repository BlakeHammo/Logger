import { useState, useEffect } from 'react';
import PhaserGame from './PhaserGame';
// Main Controller

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
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('village-logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputTitle, setInputTitle] = useState("");
  const [category, setCategory] = useState("Movie");
  const [rating, setRating] = useState(5);
  
  // NEW: State for showing character details
  const [selectedCharacter, setSelectedCharacter] = useState<{
    id: number;
    title: string;
    category: string;
    rating: number;
  } | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('village-logs', JSON.stringify(logs));
  }, [logs]);

  // --- HANDLERS ---
  const handleLog = (e: React.FormEvent) => {
    e.preventDefault(); // stops page from refreshing

    const newLog: LogEntry = {
      id: Date.now(),   // Unique ID using timestamp
      title: inputTitle,
      category: category,
      rating: rating,
      x: Math.random() * 80 + 10, // Random X between 10-90%
      y: Math.random() * 80 + 10  // Random Y between 10-90%
    };
    
    setLogs([...logs, newLog]);   // Add to array (creates new array)
    setInputTitle("");            // Clear input field
  };

  const clearLogs = () => {
    if(confirm("Are you sure you want to delete your village?")) {
        setLogs([]);
        setSelectedCharacter(null); // Clear selection when resetting
    }
  };

  // NEW: Handle character clicks
  const handleCharacterClick = (id: number, title: string, category: string, rating: number) => {
    setSelectedCharacter({ id, title, category, rating });
  };

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
        zIndex: 10,
        color: 'white'
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

        <hr style={{ width: '100%', margin: '15px 0' }} />

        {/* NEW: Selected Character Details */}
        {selectedCharacter && (
          <div style={{
            padding: '15px',
            background: '#222',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #555'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Selected Character</h3>
            <p style={{ margin: '5px 0' }}><strong>Title:</strong> {selectedCharacter.title}</p>
            <p style={{ margin: '5px 0' }}><strong>Category:</strong> {selectedCharacter.category}</p>
            <p style={{ margin: '5px 0' }}><strong>Rating:</strong> {'⭐'.repeat(selectedCharacter.rating)}</p>
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
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3>History ({logs.length})</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
            {logs.map(log => (
              <li key={log.id} style={{ marginBottom: '5px' }}>
                <strong>{log.category}</strong>: {log.title} {'⭐'.repeat(log.rating)}
              </li>
            ))}
          </ul>
        </div>

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
  )
}

export default App