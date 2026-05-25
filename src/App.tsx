import { useState } from 'react';
import { ResponsiveCanvas } from './canvas';
import { AnimatedCanvas, SpeedControl, usePlayAnimation } from './animation';
import type { PlayData, OptionNumber } from './types';

// ─── Demo Play: 3-step midfield strike ────────────────────────────────────
// Step 1 → 9 passes to 10, 12 runs a line.
// Step 2 → 10 carries and offloads to 12.
// Step 3 → 12 scores (no lines, end of play).

const DEMO_PLAY: PlayData = {
  id: 'demo-001',
  title: 'Midfield Strike',
  zone: 'full',
  steps: [
    {
      players: [
        { id: 'p9',  number: 9,  team: 'attack',  x: 50, y: 50, has_ball: true  },
        { id: 'p10', number: 10, team: 'attack',  x: 40, y: 58, has_ball: false },
        { id: 'p12', number: 12, team: 'attack',  x: 60, y: 56, has_ball: false },
        { id: 'p11', number: 11, team: 'attack',  x: 25, y: 48, has_ball: false },
        { id: 'p14', number: 14, team: 'attack',  x: 74, y: 48, has_ball: false },
        { id: 'd6',  number: 6,  team: 'defence', x: 44, y: 40, has_ball: false },
        { id: 'd7',  number: 7,  team: 'defence', x: 56, y: 38, has_ball: false },
        { id: 'd8',  number: 8,  team: 'defence', x: 50, y: 36, has_ball: false },
      ],
      lines: [
        { id: 's1-l1', from_player_id: 'p9',  to_player_id: 'p10', to_x: 38, to_y: 66, option: 1, line_type: 'pass' },
        { id: 's1-l2', from_player_id: 'p12', to_x: 65, to_y: 42, option: 2, line_type: 'run'  },
        { id: 's1-l3', from_player_id: 'p9',  to_x: 60, to_y: 66, option: 3, line_type: 'run'  },
      ],
      annotations: [
        { id: 'a1', type: 'text', x: 48, y: 22, text: 'Step 1 — 9 passes to 10' },
      ],
      description: 'Scrum midfield — 9 fires to 10',
    },
    {
      players: [
        { id: 'p9',  number: 9,  team: 'attack',  x: 50, y: 53, has_ball: false },
        { id: 'p10', number: 10, team: 'attack',  x: 38, y: 66, has_ball: true  },
        { id: 'p12', number: 12, team: 'attack',  x: 65, y: 42, has_ball: false },
        { id: 'p11', number: 11, team: 'attack',  x: 25, y: 54, has_ball: false },
        { id: 'p14', number: 14, team: 'attack',  x: 74, y: 54, has_ball: false },
        { id: 'd6',  number: 6,  team: 'defence', x: 42, y: 46, has_ball: false },
        { id: 'd7',  number: 7,  team: 'defence', x: 54, y: 44, has_ball: false },
        { id: 'd8',  number: 8,  team: 'defence', x: 48, y: 43, has_ball: false },
      ],
      lines: [
        { id: 's2-l1', from_player_id: 'p10', to_player_id: 'p12', to_x: 70, to_y: 55, option: 1, line_type: 'pass' },
        { id: 's2-l2', from_player_id: 'p10', to_x: 36, to_y: 76, option: 2, line_type: 'run'  },
      ],
      annotations: [
        { id: 'a2', type: 'text', x: 48, y: 22, text: 'Step 2 — 10 offloads to 12' },
      ],
      description: '10 receives, offloads to 12 on the loop',
    },
    {
      players: [
        { id: 'p9',  number: 9,  team: 'attack',  x: 50, y: 56, has_ball: false },
        { id: 'p10', number: 10, team: 'attack',  x: 38, y: 70, has_ball: false },
        { id: 'p12', number: 12, team: 'attack',  x: 70, y: 55, has_ball: true  },
        { id: 'p11', number: 11, team: 'attack',  x: 25, y: 60, has_ball: false },
        { id: 'p14', number: 14, team: 'attack',  x: 74, y: 60, has_ball: false },
        { id: 'd6',  number: 6,  team: 'defence', x: 40, y: 52, has_ball: false },
        { id: 'd7',  number: 7,  team: 'defence', x: 52, y: 50, has_ball: false },
        { id: 'd8',  number: 8,  team: 'defence', x: 46, y: 50, has_ball: false },
      ],
      lines: [],
      annotations: [
        { id: 'a3', type: 'text', x: 48, y: 22, text: 'Step 3 — 12 in space' },
      ],
      description: '12 takes the ball into open space',
    },
  ],
};

type ViewMode = 'overview' | 'step_by_step';

const BTN: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  fontSize: 13,
  minWidth: 44,
  minHeight: 44,
};

const BTN_PRIMARY: React.CSSProperties = {
  ...BTN,
  background: '#4A90D9',
  border: 'none',
  color: 'white',
  fontWeight: 600,
};

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const anim = usePlayAnimation({ play: DEMO_PLAY });

  const switchMode = (m: ViewMode) => {
    anim.pause();
    anim.reset();
    setViewMode(m);
  };

  const stepCount = DEMO_PLAY.steps.length;
  const atStart = anim.currentStep === 0;
  const atEnd   = anim.currentStep === stepCount - 1;

  const toggleOption = (opt: OptionNumber) => {
    anim.setActiveOptions(
      anim.activeOptions.includes(opt)
        ? anim.activeOptions.filter(o => o !== opt)
        : [...anim.activeOptions, opt],
    );
  };

  const OPTION_COLOURS_DEMO: Record<OptionNumber, string> = {
    1: '#F5C518',
    2: '#4A90D9',
    3: '#FF8C00',
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', fontFamily: 'system-ui', color: 'white' }}>
      <h1 style={{ color: '#ccc', fontSize: 18, marginBottom: 4 }}>
        Playbook Pro — Spec 03: Animation Engine
      </h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
        {DEMO_PLAY.title} · {stepCount} steps
      </p>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['overview', 'step_by_step'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={viewMode === m ? BTN_PRIMARY : BTN}
          >
            {m === 'overview' ? '▶ Overview' : '⏭ Step by Step'}
          </button>
        ))}
      </div>

      {/* Option filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#666' }}>Options:</span>
        {([1, 2, 3] as OptionNumber[]).map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', color: OPTION_COLOURS_DEMO[opt] }}>
            <input
              type="checkbox"
              checked={anim.activeOptions.includes(opt)}
              onChange={() => toggleOption(opt)}
            />
            Option {opt}
          </label>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ background: '#0a0f1a', borderRadius: 10, padding: 4, marginBottom: 12 }}>
        <AnimatedCanvas
          play={DEMO_PLAY}
          zone={DEMO_PLAY.zone}
          mode={viewMode}
          speed={anim.speed}
          currentStep={anim.currentStep}
          isPlaying={anim.isPlaying}
          activeOptions={anim.activeOptions}
          onStepChange={anim.setCurrentStep}
          onPlayingChange={anim.setIsPlaying}
          width={780}
          height={520}
        />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {viewMode === 'overview' ? (
          <>
            <button
              onClick={anim.isPlaying ? anim.pause : anim.play}
              style={BTN_PRIMARY}
            >
              {anim.isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={anim.reset} style={BTN}>↺ Reset</button>
          </>
        ) : (
          <>
            <button onClick={anim.prevStep} disabled={atStart} style={{ ...BTN, opacity: atStart ? 0.3 : 1 }}>
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: '#888', minWidth: 80, textAlign: 'center' }}>
              Step {anim.currentStep + 1} / {stepCount}
            </span>
            <button onClick={anim.nextStep} disabled={atEnd} style={{ ...BTN, opacity: atEnd ? 0.3 : 1 }}>
              Next →
            </button>
            <button onClick={anim.reset} style={BTN}>↺ Reset</button>
          </>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <SpeedControl value={anim.speed} onChange={anim.setSpeed} />
        </div>
      </div>

      {/* Step description */}
      {DEMO_PLAY.steps[anim.currentStep]?.description && (
        <p style={{ marginTop: 12, color: '#888', fontSize: 13, fontStyle: 'italic' }}>
          {DEMO_PLAY.steps[anim.currentStep]?.description}
        </p>
      )}

      {/* Static canvas (Spec 02) still visible below for reference */}
      <hr style={{ borderColor: '#222', margin: '32px 0 16px' }} />
      <h2 style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
        Spec 02 reference — static canvas
      </h2>
      <div style={{ background: '#0a0f1a', borderRadius: 10, padding: 4 }}>
        <ResponsiveCanvas
          step={DEMO_PLAY.steps[0]!}
          zone="full"
          activeOptions={[1, 2, 3]}
        />
      </div>
    </div>
  );
}
