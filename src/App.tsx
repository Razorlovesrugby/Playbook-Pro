import { useState } from 'react';
import { ResponsiveCanvas } from './canvas';
import type { StepData, FieldZone, OptionNumber } from './types';

// ─── Demo Step Data ────────────────────────────────────────────────────────
// 5 attack + 3 defence players, 2 lines (option 1), 1 annotation.

const DEMO_STEP: StepData = {
  players: [
    { id: 'p1', number: 9,  team: 'attack', x: 50, y: 50, has_ball: true  },
    { id: 'p2', number: 10, team: 'attack', x: 40, y: 60, has_ball: false },
    { id: 'p3', number: 12, team: 'attack', x: 60, y: 60, has_ball: false },
    { id: 'p4', number: 11, team: 'attack', x: 35, y: 45, has_ball: false },
    { id: 'p5', number: 14, team: 'attack', x: 65, y: 45, has_ball: false },
    { id: 'd1', number: 6,  team: 'defence', x: 45, y: 35, has_ball: false },
    { id: 'd2', number: 7,  team: 'defence', x: 55, y: 30, has_ball: false },
    { id: 'd3', number: 8,  team: 'defence', x: 50, y: 40, has_ball: false },
  ],
  lines: [
    { id: 'l1', from_player_id: 'p1', to_x: 40, to_y: 70,  option: 1, line_type: 'run'  },
    { id: 'l2', from_player_id: 'p1', to_x: 60, to_y: 70,  option: 2, line_type: 'run'  },
    { id: 'l3', from_player_id: 'p1', to_x: 50, to_y: 80,  option: 1, line_type: 'pass' },
  ],
  annotations: [
    { id: 'a1', type: 'text', x: 50, y: 10, text: 'Scrum — midfield' },
  ],
};

const ZONES: FieldZone[] = [
  'full', 'opp_22', 'opp_half', 'own_half', 'own_22', 'lineout_l', 'lineout_r',
];

export function App() {
  const [zone, setZone] = useState<FieldZone>('full');
  const [activeOptions, setActiveOptions] = useState<OptionNumber[]>([1, 2, 3]);

  const toggleOption = (opt: OptionNumber) => {
    setActiveOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#ccc', fontSize: 18, marginBottom: 12 }}>
        Playbook Pro — Spec 02: Canvas Core
      </h1>

      {/* Zone picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {ZONES.map(z => (
          <button
            key={z}
            onClick={() => setZone(z)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: zone === z ? '2px solid #4A90D9' : '1px solid #444',
              background: zone === z ? '#1a2a3a' : '#111',
              color: zone === z ? '#4A90D9' : '#888',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Option toggles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([1, 2, 3] as OptionNumber[]).map(opt => {
          const colours: Record<number, string> = { 1: '#F5C518', 2: '#4A90D9', 3: '#FF8C00' };
          return (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, color: colours[opt], fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeOptions.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              Option {opt}
            </label>
          );
        })}
      </div>

      {/* Canvas */}
      <div style={{ background: '#0a0f1a', borderRadius: 10, padding: 4 }}>
        <ResponsiveCanvas
          step={DEMO_STEP}
          zone={zone}
          activeOptions={activeOptions}
        />
      </div>
    </div>
  );
}
