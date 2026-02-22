import './DualRangeSlider.css';

interface Props {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

export function DualRangeSlider({ min, max, step, valueMin, valueMax, onChangeMin, onChangeMax }: Props) {
  const range = max - min;
  const pct   = (v: number) => ((v - min) / range) * 100;

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeMin(Math.min(Number(e.target.value), valueMax));
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeMax(Math.max(Number(e.target.value), valueMin));
  };

  // When both thumbs are at the maximum, promote the min input so it can
  // still be dragged leftward.
  const minZ = valueMin === max ? 5 : 3;

  const thumbStyle = (p: number): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: `${p}%`,
    transform: 'translate(-50%, -50%)',
    width: '13px',
    height: '13px',
    background: '#fff',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 6,
    boxShadow: '0 0 0 2px #111',
  });

  return (
    <div style={{ position: 'relative', height: '18px', userSelect: 'none' }}>
      {/* Track */}
      <div style={{
        position: 'absolute',
        top: '50%', transform: 'translateY(-50%)',
        height: '3px', width: '100%',
        background: '#444', borderRadius: '2px',
        pointerEvents: 'none',
      }}>
        {/* Selected-range fill */}
        <div style={{
          position: 'absolute',
          left: `${pct(valueMin)}%`,
          width: `${pct(valueMax) - pct(valueMin)}%`,
          height: '100%',
          background: '#fff',
          borderRadius: '2px',
        }} />
      </div>

      {/* Min input — only its thumb hitbox responds (see CSS) */}
      <input
        className="drs-input"
        type="range" min={min} max={max} step={step}
        value={valueMin}
        onChange={handleMin}
        style={{ zIndex: minZ }}
      />

      {/* Max input */}
      <input
        className="drs-input"
        type="range" min={min} max={max} step={step}
        value={valueMax}
        onChange={handleMax}
        style={{ zIndex: 4 }}
      />

      {/* Custom visible thumb circles */}
      <div style={thumbStyle(pct(valueMin))} />
      <div style={thumbStyle(pct(valueMax))} />
    </div>
  );
}
