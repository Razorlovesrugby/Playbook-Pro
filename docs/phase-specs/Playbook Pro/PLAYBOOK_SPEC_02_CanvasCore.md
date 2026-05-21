# PLAYBOOK — Module 02: Canvas Core

**Product:** Playbook
**Module:** Canvas Core (static rendering foundation)
**Version:** 1.0
**Dependencies:** Module 00 (Overview), Module 01 (Data Schema)
**Agent task:** Build the Konva canvas component that renders a single step statically — pitch, players, lines, annotations. Animation is Module 03.

---

## 1. User Story

**As the canvas engine**, I need to read a Play JSON step object and render it correctly on a Konva canvas — with the right pitch markings, player circles, line styles, and annotation overlays — so that both the viewer and editor can display plays accurately.

---

## 2. Frontend UI/UX

### Canvas Dimensions

The canvas is responsive. It fills its container and maintains a fixed aspect ratio based on the active field zone.

| Zone | Aspect Ratio | Notes |
|---|---|---|
| Full Field | 0.67:1 (portrait, pitch-shaped) | Full 100×100 grid |
| Opp 22 / Own 22 | 1.6:1 (landscape) | Shows Y=0 to Y=30, full X width |
| Opp Half / Own Half | 1.2:1 | Shows Y=0 to Y=55, full X width |
| Lineout L/R | 1.4:1 | Shows X=0–50 or X=50–100, Y=0–40 |

**Coordinate mapping:** The canvas component receives a `zone` prop and maps the 0–100 grid coordinates to screen pixels, clipping to the zone's viewport. This allows play data to always use 0–100 coordinates regardless of which zone is active.

### Visual Specs

**Pitch background:** `#0a0f1a` (very dark navy)
**Pitch markings:** white lines at 35% opacity

```
Try line:    Y=0  (thicker, 2px)
5m line:     Y=5
10m line:    Y=10
22m line:    Y=22 (dashed, distinct)
Halfway:     Y=50 (thicker, 2px)
Left channel:  X=5, X=15
Right channel: X=85, X=95
```

**Attack player node:**
- Shape: Circle
- Diameter: 24px (scales with canvas size — use 2.4% of canvas width as baseline)
- Fill: `#6B7280` (grey-500)
- Stroke: `#9CA3AF` (grey-400), 1.5px
- Text: jersey number, white, bold, 11px, centred
- Hit area: full circle + 8px padding (for easier tap on mobile)

**Defence player node:**
- Shape: Circle
- Diameter: 22px
- Fill: `#EF4444` (red-500)
- Stroke: `#FCA5A5` (red-300), 1.5px
- Text: jersey number OR 'D', white, bold, 10px

**Ball carrier node (attack only):**
- Shape: Ellipse (not circle)
- Width: 36px, Height: 22px (same centre as the player's x,y)
- Fill: `#F5C518` (yellow)
- Stroke: `#D97706`, 2px
- Text: jersey number, `#1a1a1a`, bold, 11px

**Run line (solid):**
- Konva.Arrow or Konva.Line with arrowhead
- strokeWidth: 2.5px
- lineCap: 'round'
- lineJoin: 'round'
- pointerLength: 8, pointerWidth: 6 (arrowhead)
- Colour: see Option colours below

**Pass line (dashed):**
- Same as run line but with: `dash: [8, 5]`
- animated dash in animation mode (handled in Module 03)

**Option colours:**
```
Option 1 (Yellow): #F5C518
Option 2 (Blue):   #4A90D9
Option 3 (Orange): #FF8C00
```

**Annotation — Text:**
- Konva.Text
- fill: white
- fontSize: 12px
- Background pill: Konva.Rect behind text, fill `rgba(0,0,0,0.6)`, cornerRadius: 4, padding: 4

**Annotation — Arrow:**
- Konva.Arrow, fill white, stroke white, strokeWidth 2

**Annotation — Circle:**
- Konva.Circle, stroke white, strokeWidth 2, fill transparent

**Annotation — Target (crosshair):**
- Konva.Circle (outer ring) + Konva.Line (crosshair lines), stroke white

---

## 3. Konva Layer Architecture

Use 4 Konva layers stacked in this order (bottom to top):

```
Layer 4 — Annotation Layer   (text, arrows, circles, targets)
Layer 3 — Node Layer         (player circles + ovals) — interactive hit detection
Layer 2 — Line Layer         (run lines, pass lines)
Layer 1 — Pitch Layer        (pitch background, markings)
```

**Why this order:**
- Pitch renders once and never changes during interaction
- Lines render below player nodes so arrowheads appear behind circles
- Annotations always render on top of everything
- Only Layer 3 (nodes) needs hit detection enabled — other layers have `listening={false}`

### React Component Structure

```tsx
// PlaybookCanvas.tsx — the single canvas component used everywhere

interface PlaybookCanvasProps {
  step: StepData;          // The step to render (from play_data.steps[n])
  zone: FieldZone;         // Active field zone (clips the viewport)
  activeOptions: number[]; // Which options to show (e.g., [1,2,3] = all, [2] = only blue)
  width: number;           // Container width in px
  height: number;          // Container height in px
  isEditor?: boolean;      // If true, nodes are draggable (editor mode)
  onNodeClick?: (playerId: string) => void;
  onNodeDrag?: (playerId: string, x: number, y: number) => void;
}

// Returns a Stage with 4 layers
export function PlaybookCanvas(props: PlaybookCanvasProps) { ... }
```

---

## 4. Coordinate Mapping

The canvas must convert 0–100 grid coordinates to pixel positions based on the active zone.

```typescript
interface ZoneViewport {
  xMin: number;  // grid X start
  xMax: number;  // grid X end
  yMin: number;  // grid Y start
  yMax: number;  // grid Y end
}

const ZONE_VIEWPORTS: Record<FieldZone, ZoneViewport> = {
  full:       { xMin: 0,  xMax: 100, yMin: 0,  yMax: 100 },
  opp_22:     { xMin: 0,  xMax: 100, yMin: 0,  yMax: 30  },
  opp_half:   { xMin: 0,  xMax: 100, yMin: 0,  yMax: 55  },
  own_half:   { xMin: 0,  xMax: 100, yMin: 45, yMax: 100 },
  own_22:     { xMin: 0,  xMax: 100, yMin: 70, yMax: 100 },
  lineout_l:  { xMin: 0,  xMax: 55,  yMin: 0,  yMax: 40  },
  lineout_r:  { xMin: 45, xMax: 100, yMin: 0,  yMax: 40  },
};

// Convert grid coordinate to pixel position
function gridToPixel(
  gridX: number,
  gridY: number,
  zone: FieldZone,
  canvasWidth: number,
  canvasHeight: number
): { px: number; py: number } {
  const vp = ZONE_VIEWPORTS[zone];
  const scaleX = canvasWidth  / (vp.xMax - vp.xMin);
  const scaleY = canvasHeight / (vp.yMax - vp.yMin);
  return {
    px: (gridX - vp.xMin) * scaleX,
    py: (gridY - vp.yMin) * scaleY,
  };
}

// Convert pixel back to grid (needed in editor for drag)
function pixelToGrid(
  px: number,
  py: number,
  zone: FieldZone,
  canvasWidth: number,
  canvasHeight: number
): { gridX: number; gridY: number } {
  const vp = ZONE_VIEWPORTS[zone];
  const scaleX = canvasWidth  / (vp.xMax - vp.xMin);
  const scaleY = canvasHeight / (vp.yMax - vp.yMin);
  return {
    gridX: (px / scaleX) + vp.xMin,
    gridY: (py / scaleY) + vp.yMin,
  };
}
```

---

## 5. Rendering Logic

### Pitch Layer

```tsx
function PitchLayer({ zone, width, height }: PitchLayerProps) {
  const MARKING_Y = [0, 5, 10, 22, 50, 78, 90, 95, 100];
  const MARKING_X = [5, 15, 85, 95];
  
  return (
    <Layer listening={false}>
      {/* Background */}
      <Rect width={width} height={height} fill="#0a0f1a" />
      
      {/* Horizontal pitch markings */}
      {MARKING_Y.map(y => {
        const { py } = gridToPixel(0, y, zone, width, height);
        if (py < 0 || py > height) return null;
        const isMainLine = y === 0 || y === 50 || y === 100;
        return (
          <Line
            key={y}
            points={[0, py, width, py]}
            stroke="white"
            strokeWidth={isMainLine ? 1.5 : 1}
            opacity={isMainLine ? 0.45 : 0.25}
            dash={y === 22 || y === 78 ? [6, 4] : undefined}
            listening={false}
          />
        );
      })}
      
      {/* Vertical channel markings */}
      {MARKING_X.map(x => {
        const { px } = gridToPixel(x, 0, zone, width, height);
        if (px < 0 || px > width) return null;
        return (
          <Line
            key={x}
            points={[px, 0, px, height]}
            stroke="white"
            strokeWidth={1}
            opacity={0.2}
            listening={false}
          />
        );
      })}
    </Layer>
  );
}
```

### Line Layer

Lines are filtered by `activeOptions` prop before rendering.

```tsx
function LineLayer({ step, zone, width, height, activeOptions }: LineLayerProps) {
  const OPTION_COLOURS = { 1: '#F5C518', 2: '#4A90D9', 3: '#FF8C00' };
  
  const visibleLines = step.lines.filter(l => activeOptions.includes(l.option));
  
  return (
    <Layer listening={false}>
      {visibleLines.map(line => {
        const fromPlayer = step.players.find(p => p.id === line.from_player_id);
        if (!fromPlayer) return null;
        
        const from = gridToPixel(fromPlayer.x, fromPlayer.y, zone, width, height);
        const to   = gridToPixel(line.to_x, line.to_y, zone, width, height);
        const colour = OPTION_COLOURS[line.option as 1|2|3];
        
        return (
          <Arrow
            key={line.id}
            points={[from.px, from.py, to.px, to.py]}
            stroke={colour}
            strokeWidth={2.5}
            fill={colour}
            dash={line.line_type === 'pass' ? [8, 5] : undefined}
            pointerLength={8}
            pointerWidth={6}
            lineCap="round"
            listening={false}
          />
        );
      })}
    </Layer>
  );
}
```

### Node Layer

```tsx
function NodeLayer({ step, zone, width, height, isEditor, onNodeClick, onNodeDrag }: NodeLayerProps) {
  const NODE_RADIUS = Math.max(10, width * 0.012); // Scales with canvas
  
  return (
    <Layer>
      {step.players.map(player => {
        const { px, py } = gridToPixel(player.x, player.y, zone, width, height);
        
        if (player.has_ball && player.team === 'attack') {
          // Ball carrier — yellow oval
          return (
            <Group key={player.id} x={px} y={py}
              onClick={() => onNodeClick?.(player.id)}
              draggable={isEditor}
              onDragEnd={e => {
                const g = pixelToGrid(e.target.x(), e.target.y(), zone, width, height);
                onNodeDrag?.(player.id, g.gridX, g.gridY);
              }}
            >
              <Ellipse
                radiusX={NODE_RADIUS * 1.6}
                radiusY={NODE_RADIUS}
                fill="#F5C518"
                stroke="#D97706"
                strokeWidth={2}
              />
              <Text
                text={String(player.number)}
                fontSize={NODE_RADIUS * 0.9}
                fontStyle="bold"
                fill="#1a1a1a"
                align="center"
                verticalAlign="middle"
                offsetX={NODE_RADIUS * 0.8}
                offsetY={NODE_RADIUS * 0.45}
                listening={false}
              />
            </Group>
          );
        }
        
        // Standard attack or defence circle
        const isAttack = player.team === 'attack';
        return (
          <Group key={player.id} x={px} y={py}
            onClick={() => onNodeClick?.(player.id)}
            draggable={isEditor}
            onDragEnd={e => {
              const g = pixelToGrid(e.target.x(), e.target.y(), zone, width, height);
              onNodeDrag?.(player.id, g.gridX, g.gridY);
            }}
          >
            <Circle
              radius={NODE_RADIUS}
              fill={isAttack ? '#6B7280' : '#EF4444'}
              stroke={isAttack ? '#9CA3AF' : '#FCA5A5'}
              strokeWidth={1.5}
              hitStrokeWidth={8} // Larger hit area for mobile
            />
            <Text
              text={String(player.number)}
              fontSize={NODE_RADIUS * 0.85}
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
              offsetX={NODE_RADIUS * 0.42}
              offsetY={NODE_RADIUS * 0.42}
              listening={false}
            />
          </Group>
        );
      })}
    </Layer>
  );
}
```

### Annotation Layer

```tsx
function AnnotationLayer({ step, zone, width, height }: AnnotationLayerProps) {
  return (
    <Layer listening={false}>
      {step.annotations.map(ann => {
        const { px, py } = gridToPixel(ann.x, ann.y, zone, width, height);
        
        if (ann.type === 'text' && ann.text) {
          const textWidth = ann.text.length * 7 + 16;
          return (
            <Group key={ann.id} x={px} y={py}>
              <Rect
                x={-4} y={-4}
                width={textWidth} height={22}
                fill="rgba(0,0,0,0.65)"
                cornerRadius={4}
              />
              <Text text={ann.text} fill="white" fontSize={12} />
            </Group>
          );
        }
        
        if (ann.type === 'arrow' && ann.end_x != null && ann.end_y != null) {
          const end = gridToPixel(ann.end_x, ann.end_y, zone, width, height);
          return (
            <Arrow key={ann.id}
              points={[px, py, end.px, end.py]}
              stroke="white" fill="white"
              strokeWidth={2}
              pointerLength={7} pointerWidth={5}
            />
          );
        }
        
        if (ann.type === 'circle') {
          return <Circle key={ann.id} x={px} y={py} radius={16} stroke="white" strokeWidth={2} fill="transparent" />;
        }
        
        if (ann.type === 'target') {
          return (
            <Group key={ann.id} x={px} y={py}>
              <Circle radius={14} stroke="white" strokeWidth={1.5} fill="transparent" />
              <Line points={[-18, 0, 18, 0]} stroke="white" strokeWidth={1} />
              <Line points={[0, -18, 0, 18]} stroke="white" strokeWidth={1} />
            </Group>
          );
        }
        
        return null;
      })}
    </Layer>
  );
}
```

---

## 6. Full PlaybookCanvas Component

```tsx
export function PlaybookCanvas({
  step, zone, activeOptions, width, height, isEditor = false,
  onNodeClick, onNodeDrag
}: PlaybookCanvasProps) {
  return (
    <Stage width={width} height={height} style={{ borderRadius: '8px', overflow: 'hidden' }}>
      <PitchLayer zone={zone} width={width} height={height} />
      <LineLayer step={step} zone={zone} width={width} height={height} activeOptions={activeOptions} />
      <NodeLayer step={step} zone={zone} width={width} height={height}
        isEditor={isEditor} onNodeClick={onNodeClick} onNodeDrag={onNodeDrag} />
      <AnnotationLayer step={step} zone={zone} width={width} height={height} />
    </Stage>
  );
}
```

---

## 7. Responsive Container

Wrap `PlaybookCanvas` in a responsive container that measures its own width and computes height based on the zone's aspect ratio.

```tsx
// ResponsiveCanvas.tsx
export function ResponsiveCanvas({ zone, ...props }: { zone: FieldZone } & Omit<PlaybookCanvasProps, 'width' | 'height'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 400 });

  const ZONE_ASPECT: Record<FieldZone, number> = {
    full:      0.67,  // height/width ratio
    opp_22:    0.625,
    opp_half:  0.72,
    own_half:  0.72,
    own_22:    0.625,
    lineout_l: 0.71,
    lineout_r: 0.71,
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setDims({ width: w, height: Math.round(w * ZONE_ASPECT[zone]) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [zone]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <PlaybookCanvas {...props} zone={zone} width={dims.width} height={dims.height} />
    </div>
  );
}
```

---

## 8. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Player has `has_ball: true` but is on defence team | Render as standard red circle — ball carrier oval only applies to attack |
| Line references a `from_player_id` not in `step.players` | Skip line silently. Log warning in dev mode. |
| `to_x` or `to_y` out of 0–100 bounds | Clamp to 0–100 before rendering. Lines that exit the zone viewport are still drawn (Konva clips to stage). |
| Two players at the same coordinates | Allowed — no collision resolution in V1. Slight visual overlap is acceptable. |
| Canvas container has zero width | Skip render, return null. Container is still mounted but canvas invisible. |
| Zone changes while step is rendering | Re-render with new coordinate mappings. No animation needed on zone change. |
| More than 3 options in a step's lines | Cap at 3. Ignore lines with `option > 3`. |
| `activeOptions` is empty array | Render no lines. Players and annotations still show. |

---

## 9. Build Notes for AI Agent

**What to build:**
- `PlaybookCanvas` component (4-layer Konva stage)
- `ResponsiveCanvas` wrapper with ResizeObserver
- `gridToPixel` and `pixelToGrid` utility functions
- All rendering sub-components (PitchLayer, LineLayer, NodeLayer, AnnotationLayer)
- TypeScript types for all props and data shapes

**What NOT to build here (belongs in later modules):**
- Animation/tweening (Module 03)
- Editor tool interactions (Module 05)
- Step controls (Module 04)

**Dependencies:**
```bash
npm install konva react-konva
```

**Acceptance criteria:**
- Given a step with 5 attack players, 3 defence players, 2 lines (option 1), and 1 annotation, the canvas renders all of them correctly
- Setting `activeOptions={[2]}` shows only blue lines
- Changing zone to `opp_22` zooms to the correct section of the pitch
- Canvas is responsive — resizes cleanly at 375px (mobile) and 1440px (desktop)
- Ball carrier renders as yellow oval, not grey circle
