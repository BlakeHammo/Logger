import type { LogEntry } from '../types';

interface Props {
  selectedCharacter: LogEntry | null;
  onClose: () => void;
}

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export function CharacterDetails({ selectedCharacter, onClose }: Props) {
  if (!selectedCharacter) {
    return <p style={{ color: '#aaa' }}>Click a character or entry to see details.</p>;
  }

  return (
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
        onClick={onClose}
        style={{
          marginTop: '10px', background: '#444', color: 'white',
          border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '0.9rem',
        }}
      >
        Close
      </button>
    </div>
  );
}
