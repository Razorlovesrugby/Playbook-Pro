import type { SpeedKey } from './config';
import { ANIMATION_CONFIG } from './config';

const SPEEDS = Object.keys(ANIMATION_CONFIG.SPEEDS) as SpeedKey[];

interface SpeedControlProps {
  value: SpeedKey;
  onChange: (s: SpeedKey) => void;
}

export function SpeedControl({ value, onChange }: SpeedControlProps) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: value === s ? 'none' : '1px solid rgba(255,255,255,0.2)',
            background: value === s ? 'white' : 'transparent',
            color: value === s ? '#0a0f1a' : 'rgba(255,255,255,0.5)',
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: value === s ? 700 : 400,
            cursor: 'pointer',
            minWidth: 44,
            minHeight: 44,
            transition: 'all 0.15s',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
