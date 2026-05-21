# PLAYBOOK — Module 03: Animation Engine

**Product:** Playbook
**Module:** Animation Engine
**Version:** 1.0
**Dependencies:** Module 02 (Canvas Core)
**Agent task:** Build the animation system that moves players between steps and drives the Overview auto-play and Step by Step modes.

---

## 1. User Story

**As a player watching a play**, I want to see players smoothly move to their destinations and lines trace their paths — so I understand the timing and sequence of the play, not just the start and end positions.

---

## 2. Animation Model

### How Steps Animate

Each step defines WHERE players are at the START of that step. The LINES in the step define where players are going during that step.

When animating from Step N to Step N+1:
1. Players are at their Step N positions (x, y)
2. Players animate ALONG their Option 1 lines to reach their Step N+1 positions
3. Lines trace/draw as players move
4. Once animation completes, Step N+1 positions are shown

**Important:** Steps carry player positions forward automatically — Step N+1's player positions are derived from the destinations of Step N's Option 1 lines. If a player has no Option 1 line in Step N, they remain stationary (their position in Step N+1 equals their position in Step N).

### Two Viewing Modes

**Overview Mode (auto-play)**
- Steps animate sequentially: Step 1 → Step 2 → ... → Step N
- Each step plays for its animation duration, then auto-advances
- Loops back to Step 1 after the final step (optional, configurable)
- User can pause/resume
- Speed multiplier applies to all animations

**Step by Step Mode (manual)**
- Shows Step 1 by default with all lines visible
- User taps "Next" to animate to Step 2
- User can tap "Previous" to go back (snaps instantly, no reverse animation)
- Option cards visible — tapping highlights that option's lines, dims others
- Speed multiplier still applies to the transition animation when user taps Next

---

## 3. Animation Parameters

```typescript
const ANIMATION_CONFIG = {
  // Duration of one step's animation in milliseconds (at 1x speed)
  BASE_STEP_DURATION_MS: 1800,

  // Speed multipliers
  SPEEDS: {
    '0.5x': 0.5,
    '1x':   1.0,
    '2x':   2.0,
  },

  // Easing function
  EASING: 'easeInOut', // Konva.Easings.EaseInOut

  // Pause between steps in Overview mode (ms, at 1x)
  INTER_STEP_PAUSE_MS: 400,

  // Line draw duration as fraction of step duration
  // Lines start drawing at step start and complete at this fraction
  LINE_DRAW_FRACTION: 0.7,

  // Ball transfer: instant at the moment the pass line's midpoint is reached
  BALL_TRANSFER_FRACTION: 0.5,
};
```

---

## 4. The AnimatedCanvas Component

Build `AnimatedCanvas` on top of `PlaybookCanvas` (Module 02). It wraps the canvas and drives animations using Konva Tweens.

```typescript
interface AnimatedCanvasProps {
  play: PlayData;           // Full play (all steps)
  zone: FieldZone;
  mode: 'overview' | 'step_by_step';
  speed: '0.5x' | '1x' | '2x';
  currentStep: number;      // Which step is currently shown (0-indexed)
  isPlaying: boolean;       // Controlled by parent
  activeOptions: number[];  // Which options to show (for step-by-step)
  onStepChange: (newStep: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  width: number;
  height: number;
}
```

### Animation State Machine

```
IDLE
  │
  ├── [play/auto-advance] → ANIMATING
  │
ANIMATING
  │
  ├── [tween completes] → PAUSING (inter-step pause)
  │                       │
  │                       └── [pause expires OR mode=step_by_step] → IDLE
  │
  ├── [user pauses] → IDLE (freeze at current tween position)
  │
  └── [user prev] → IDLE (snap to previous step)
```

---

## 5. Player Position Interpolation

During animation from Step N to Step N+1, each player tweens from their Step N position to their destination.

```typescript
// Compute each player's destination in the next step
function computePlayerDestinations(
  currentStep: StepData,
  nextStep: StepData | null
): Map<string, { x: number; y: number }> {
  const destinations = new Map<string, { x: number; y: number }>();

  for (const player of currentStep.players) {
    if (nextStep) {
      // Find this player in the next step
      const nextPlayer = nextStep.players.find(p => p.id === player.id);
      if (nextPlayer) {
        destinations.set(player.id, { x: nextPlayer.x, y: nextPlayer.y });
      } else {
        // Player not in next step — stays at current position
        destinations.set(player.id, { x: player.x, y: player.y });
      }
    } else {
      // Last step — players stay put
      destinations.set(player.id, { x: player.x, y: player.y });
    }
  }

  return destinations;
}
```

### Konva Tween Per Player Node

```typescript
function animateStep(
  stepIndex: number,
  speed: '0.5x' | '1x' | '2x',
  onComplete: () => void
) {
  const currentStep = play.steps[stepIndex];
  const nextStep = play.steps[stepIndex + 1] ?? null;
  const destinations = computePlayerDestinations(currentStep, nextStep);
  const duration = ANIMATION_CONFIG.BASE_STEP_DURATION_MS * ANIMATION_CONFIG.SPEEDS[speed] / 1000;

  const tweens: Konva.Tween[] = [];

  for (const [playerId, dest] of destinations) {
    const nodeRef = playerNodeRefs.get(playerId); // Konva.Group ref
    if (!nodeRef) continue;

    const { px: toPx, py: toPy } = gridToPixel(dest.x, dest.y, zone, width, height);

    const tween = new Konva.Tween({
      node: nodeRef,
      x: toPx,
      y: toPy,
      duration,
      easing: Konva.Easings.EaseInOut,
    });

    tweens.push(tween);
    tween.play();
  }

  // Fire onComplete when all tweens finish
  let completed = 0;
  tweens.forEach(t => {
    t.onFinish = () => {
      completed++;
      if (completed === tweens.length) onComplete();
    };
  });

  // If no tweens (no players), fire immediately
  if (tweens.length === 0) setTimeout(onComplete, duration * 1000);

  return tweens; // Return for cleanup
}
```

---

## 6. Line Drawing Animation

Lines animate (draw from start to end) during the step's animation. Use Konva's `dash` offset animation to create a "drawing" effect.

```typescript
// For run lines — animate strokeDashOffset to create draw effect
// For pass lines — they already have a dash pattern, animate dashOffset to show movement

function animateLineDraw(
  lineRef: Konva.Arrow,
  lineLength: number,
  duration: number
) {
  // Set initial state: line fully hidden (dashOffset = total line length)
  const totalDash = lineLength;
  lineRef.dash([totalDash, totalDash]);
  lineRef.dashOffset(totalDash);

  const tween = new Konva.Tween({
    node: lineRef,
    dashOffset: 0,
    duration: duration * ANIMATION_CONFIG.LINE_DRAW_FRACTION,
    easing: Konva.Easings.EaseOut,
  });

  tween.play();
  return tween;
}

// For pass lines (already dashed) — show animated flow
function animatePassLine(
  lineRef: Konva.Arrow,
  duration: number
) {
  // Start with dashOffset = dash pattern length (8+5=13)
  lineRef.dashOffset(13);
  const tween = new Konva.Tween({
    node: lineRef,
    dashOffset: 0,
    duration,
    easing: Konva.Easings.Linear,
  });
  tween.play();
  return tween;
}
```

---

## 7. Ball Transfer

When a step has a pass line (Option 1), the ball visually transfers from the passer to the receiver mid-animation.

```typescript
// Fired at BALL_TRANSFER_FRACTION through the step animation duration
function handleBallTransfer(currentStep: StepData) {
  const passLine = currentStep.lines.find(
    l => l.line_type === 'pass' && l.option === 1 && l.to_player_id != null
  );
  if (!passLine) return;

  const passer = currentStep.players.find(p => p.id === passLine.from_player_id);
  const receiver = currentStep.players.find(p => p.id === passLine.to_player_id);
  if (!passer || !receiver) return;

  // Update has_ball state
  setAnimationPlayerState(prev => ({
    ...prev,
    [passer.id]:   { ...prev[passer.id],   has_ball: false },
    [receiver.id]: { ...prev[receiver.id], has_ball: true  },
  }));
  // The canvas will re-render the oval on the new player
}
```

---

## 8. useAnimation Hook

Encapsulate all animation logic in a custom hook.

```typescript
function usePlayAnimation({
  play, mode, speed, initialStep = 0
}: UseAnimationProps): UseAnimationReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeOptions, setActiveOptions] = useState<number[]>([1, 2, 3]);
  const tweenRefs = useRef<Konva.Tween[]>([]);

  // In overview mode, auto-advance when not paused
  useEffect(() => {
    if (mode !== 'overview' || !isPlaying) return;
    const totalSteps = play.steps.length;
    
    // Start animation for current step
    const cleanup = startStepAnimation(currentStep, () => {
      // Inter-step pause
      const pauseTimer = setTimeout(() => {
        if (currentStep + 1 < totalSteps) {
          setCurrentStep(s => s + 1);
        } else {
          // End of play — loop or stop
          setCurrentStep(0);
          setIsPlaying(false); // Auto-stop. Set to setIsPlaying(true) for loop.
        }
      }, ANIMATION_CONFIG.INTER_STEP_PAUSE_MS);
      return () => clearTimeout(pauseTimer);
    });

    return cleanup;
  }, [currentStep, isPlaying, mode, speed]);

  return {
    currentStep,
    isPlaying,
    activeOptions,
    play:  () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    reset: () => { setIsPlaying(false); setCurrentStep(0); },
    nextStep:  () => { setIsPlaying(false); setCurrentStep(s => Math.min(s + 1, play.steps.length - 1)); },
    prevStep:  () => { setIsPlaying(false); setCurrentStep(s => Math.max(s - 1, 0)); },
    goToStep:  (n: number) => { setIsPlaying(false); setCurrentStep(n); },
    setActiveOptions,
  };
}
```

---

## 9. Speed Control

Speed is applied by multiplying all tween durations. The control is managed at the parent page level and passed into the hook.

```tsx
// SpeedControl component
const SPEEDS = ['0.5x', '1x', '2x'] as const;

function SpeedControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3 py-1 rounded text-sm font-mono
            ${value === s 
              ? 'bg-white text-[#0a0f1a] font-bold' 
              : 'text-white/60 hover:text-white border border-white/20'
            }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
```

---

## 10. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Play has only 1 step | Overview mode shows the step statically (no animation). No Next button in Step by Step. |
| User changes speed mid-animation | Kill current tweens, restart current step animation at new speed |
| User taps Previous during animation | Kill tweens, snap to previous step with no animation |
| Step has no players | Canvas renders empty pitch. No tweens to run. |
| Player in Step N has no entry in Step N+1 | Player disappears after Step N animation. (This is valid — a player may exit the play.) |
| Animation stutters on low-end mobile | Reduce tween count: don't animate stationary players (start == end). |
| Tab/window becomes hidden during auto-play | Pause automatically (use Page Visibility API). Resume on visible. |
| Step animation completes faster than expected | `onComplete` callback guards against double-firing with a `completed` flag |

---

## 11. Build Notes for AI Agent

**What to build:**
- `usePlayAnimation` hook
- `AnimatedCanvas` component (wraps `PlaybookCanvas` from Module 02)
- `SpeedControl` component
- Line draw animation utilities
- Ball transfer logic

**What NOT to build here:**
- Play viewer page layout (Module 04)
- Editor controls (Module 05)

**Konva animation notes:**
- Use `Konva.Tween` (not `requestAnimationFrame`) for consistency and pause/resume support
- Store tween refs in `useRef` so they can be killed when user pauses or changes step
- Always call `tween.destroy()` on cleanup to prevent memory leaks
- Konva Stage re-renders via refs — do NOT use React state to drive per-frame positions

**Acceptance criteria:**
- A 3-step play auto-plays from Step 1 → 2 → 3 and stops
- Players visibly move between steps with ease-in-out easing
- Lines draw from start to end as players move
- Ball transfers from passer to receiver mid-animation for pass lines
- Speed control: 2x plays noticeably faster than 0.5x
- In Step by Step mode, tapping Next animates forward; tapping Previous snaps back instantly
- Pause mid-animation freezes players at current position
