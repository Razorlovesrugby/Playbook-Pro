# PLAYBOOK — Module 05: Play Editor

**Product:** Playbook
**Module:** Play Editor
**Version:** 1.0
**Dependencies:** Module 02 (Canvas Core), Module 01 (Data Schema), Module 07 (Auth)
**Agent task:** Build the full play editor page at `/editor` and `/editor/:play-id` — all draw tools, template selector, step management, save, share, and preview.

---

## 1. User Story

**As a coach**, I open the editor, pick a template for my starting formation, draw running lines and pass lines, add a second step, and save the play. I then copy the share link and paste it into my team WhatsApp group.

---

## 2. Page Layout — Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Back   [Untitled Play_____]    [Load] [Preview] [⚡ AI] [Save] [Share]   │  52px
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TOOLBAR (left)     CANVAS (centre)                  STEP SIDEBAR (right)   │
│  ┌──────────┐       ┌──────────────────────────┐     ┌──────────────────┐   │
│  │ Select   │       │                          │     │ STEP DESCRIPTION │   │
│  │ ─────    │       │   PITCH CANVAS           │     │ [text area]      │   │
│  │ Run      │       │   (Konva editor mode)    │     │                  │   │
│  │ Pass     │       │                          │     │ 0 players        │   │
│  │ ─────    │       │                          │     │ 0 lines          │   │
│  │ Arrow    │       │                          │     │                  │   │
│  │ Circle   │       └──────────────────────────┘     └──────────────────┘   │
│  │ Text     │                                                                │
│  │ Target   │       ZONE SELECTOR:                                           │
│  │ ─────    │       [Full Field][Opp 22][Opp Half][Own Half][Own 22][L L][L R]│
│  │ Eraser   │                                                                │
│  │ ─────    │       OPTION SELECTOR:                                         │
│  │ Option:  │       [● 1 Yellow] [● 2 Blue] [● 3 Orange]                    │
│  │ [1][2][3]│                                                                │
│  └──────────┘                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  STEP TABS: [Step 1 ×] [+Step] [+ between steps]                            │  48px
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Layout — Mobile (< 768px)

```
┌───────────────────────────────┐
│  ← [Untitled Play]   [Save]  │
├───────────────────────────────┤
│  CANVAS (full width)          │
├───────────────────────────────┤
│  ZONE: [F][22][OH][HH][O22][LL][LR] │
├───────────────────────────────┤
│  TOOLBAR (horizontal scroll): │
│  [↖][─][⤳][↗][○][T][⊕][✕]  │
├───────────────────────────────┤
│  OPTION: [●1] [●2] [●3]      │
├───────────────────────────────┤
│  STEP TABS: [S1][S2][+]       │
├───────────────────────────────┤
│  STEP DESCRIPTION [text area] │
└───────────────────────────────┘
```

---

## 4. Template Selector

When the editor opens with no existing play, show the template selector modal BEFORE showing the canvas.

```tsx
// Template selector modal — blocks canvas until a selection is made
function TemplateSelector({ onSelect }: { onSelect: (template: Template) => void }) {
  // ...
}
```

**Two stages:**

**Stage 1 — Where on the field?**
```
[ Opp 22 ]  [ Opp Half ]  [ Own Half ]  [ Own 22 ]
```

**Stage 2 — Starting formation:**

| Group | Templates |
|---|---|
| Scrums | Scrum Left, Scrum Centre, Scrum Right |
| Lineouts | Lineout Left (all 15), Lineout Right (all 15) |
| Restarts | Kick Off Left, Kick Off Right, 22m Drop Right, 22m Drop Left |
| Forwards | Lineout Left (forwards only), Lineout Right (forwards only) |
| Blank | Blank Field (no players pre-placed) |

Each template is a preset JSON providing player x,y starting positions for all 15 attack players plus typical defensive positions. These are seeded as constants in the frontend codebase (not fetched from DB).

**Template data structure:**
```typescript
interface Template {
  id: string;
  name: string;
  zone: FieldZone;
  description: string;
  players: Array<{
    id: string;
    team: 'attack' | 'defence';
    number: number;
    x: number;
    y: number;
    has_ball: boolean;
  }>;
}
```

---

## 5. Tools

### Tool Definitions

| Tool | Icon | Shortcut | Description |
|---|---|---|---|
| Select | ↖ | V or Esc | Select and move players. Shows player panel on click. |
| Run | ─ | R | Draw a solid run line from a player to a destination |
| Pass | ⤳ | P | Draw a dashed pass line between two players |
| Arrow | ↗ | A | Draw a free annotation arrow |
| Circle | ○ | C | Draw an annotation circle |
| Text | T | T | Place a text annotation |
| Target | ⊕ | X | Place a target (crosshair) annotation |
| Eraser | ✕ | E | Click any line or annotation to delete it |

### Active Tool State

```typescript
type EditorTool = 'select' | 'run' | 'pass' | 'arrow' | 'circle' | 'text' | 'target' | 'eraser';
const [activeTool, setActiveTool] = useState<EditorTool>('select');
```

---

## 6. Tool Interactions

### Select Tool

- **Click player** → select it. Show player panel (see Section 7).
- **Drag player** → move player. Updates x,y in current step's player array.
- **Click empty canvas** → deselect.
- **Click line/annotation** → select it (show delete option).

### Run Tool

- **Click player** → sets run start.
- **Drag from player to destination** → on drag end, create a line:
  ```
  { from_player_id: playerId, to_x: endX, to_y: endY, to_player_id: null, line_type: 'run', option: activeOption }
  ```
- Lines are straight. No curves in V1.
- After drawing, tool stays in Run mode.

### Pass Tool

- **Click first player** → sets passer.
- **Click second player** → creates pass line between them:
  ```
  { from_player_id: passer.id, to_player_id: receiver.id, to_x: receiver.x, to_y: receiver.y, line_type: 'pass', option: activeOption }
  ```
- **Ball auto-transfers:** The receiver's `has_ball` is set to `true` and the passer's `has_ball` is set to `false` for the NEXT step (not the current one — the pass animates during the current step).
- If user clicks empty canvas as second click, cancel pass without creating a line.
- Visual feedback: after clicking the passer, show a dashed preview line following the cursor until the receiver is clicked.

### Arrow Tool

- **Drag on canvas** → creates annotation arrow from drag start to drag end.

### Circle Tool

- **Click on canvas** → places a circle annotation at that position with a default radius (10 grid units).

### Text Tool

- **Click on canvas** → places a text input at that position. User types, hits Enter or clicks away to commit.

### Target Tool

- **Click on canvas** → places a target (crosshair) annotation.

### Eraser Tool

- **Click any line** → delete that line from the step.
- **Click any annotation** → delete that annotation.
- **Click player** → show confirmation: "Remove this player from this step?" [Remove] [Cancel]

---

## 7. Player Panel (Select Mode)

When a player is selected in Select mode, show a small panel near the player (or in the right sidebar on desktop).

```
┌─────────────────────────┐
│  #10 — Attack           │
│                         │
│  [Ball] Toggle          │
│  (makes this player     │
│   the ball carrier)     │
│                         │
│  [Clear Lines]          │
│  (removes all lines     │
│   from this player      │
│   in this step)         │
│                         │
│  [Remove Player]        │
└─────────────────────────┘
```

**Ball toggle logic:**
- Turning ball ON: sets this player's `has_ball = true`, sets all other players' `has_ball = false`
- Turning ball OFF: sets `has_ball = false` (no ball carrier in this step — valid state)

---

## 8. Option Selector

Three buttons to switch which option new lines are drawn for.

```tsx
const OPTION_STYLES = [
  { num: 1, colour: '#F5C518', label: 'Option 1' },
  { num: 2, colour: '#4A90D9', label: 'Option 2' },
  { num: 3, colour: '#FF8C00', label: 'Option 3' },
];

function OptionSelector({ active, onChange }: { active: 1|2|3; onChange: (n: 1|2|3) => void }) {
  return (
    <div className="flex gap-2">
      {OPTION_STYLES.map(opt => (
        <button
          key={opt.num}
          onClick={() => onChange(opt.num as 1|2|3)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all
            ${active === opt.num ? 'border-opacity-100' : 'border-white/10 text-white/40'}`}
          style={{
            borderColor: active === opt.num ? opt.colour : undefined,
            color:        active === opt.num ? opt.colour : undefined,
            backgroundColor: active === opt.num ? `${opt.colour}1A` : undefined,
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.colour }} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

Default active option: 1.

---

## 9. Step Management

### Step Tabs

A tab bar at the bottom of the editor showing one tab per step.

```tsx
function StepTabs({ steps, activeStep, onSelect, onAdd, onInsert, onDelete }: StepTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-t border-white/10 overflow-x-auto">
      {steps.map((step, i) => (
        <React.Fragment key={step.step_id}>
          {/* Insert-between button */}
          {i > 0 && (
            <button
              onClick={() => onInsert(i)}
              className="w-5 h-5 rounded text-white/20 hover:text-white hover:bg-white/10 text-xs flex items-center justify-center"
              title="Insert step here"
            >
              +
            </button>
          )}
          <div className="relative group">
            <button
              onClick={() => onSelect(i)}
              className={`px-3 py-1.5 rounded text-sm font-mono whitespace-nowrap
                ${i === activeStep
                  ? 'bg-white text-[#0a0f1a] font-bold'
                  : 'text-white/50 border border-white/20 hover:border-white/50'
                }`}
            >
              Step {i + 1}
            </button>
            {steps.length > 1 && (
              <button
                onClick={() => onDelete(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-xs hidden group-hover:flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </React.Fragment>
      ))}

      {/* Add step button */}
      <button
        onClick={onAdd}
        className="px-3 py-1.5 border border-dashed border-white/20 rounded text-white/40 hover:text-white text-sm"
      >
        + Step
      </button>
    </div>
  );
}
```

### Add Step Logic

When the user taps **+ Step**:
1. Copy all players from the current step to the new step (carrying positions forward)
2. Apply Option 1 line destinations as new starting positions (players "carry forward" to where Option 1 took them)
3. Clear all lines and annotations in the new step
4. Set `has_ball` based on last known receiver (auto-detect from Option 1 pass lines)
5. Append new step and switch to it

```typescript
function addStep(steps: StepData[], currentStepIndex: number): StepData[] {
  const currentStep = steps[currentStepIndex];

  // Compute carry-forward positions from Option 1 lines
  const newPlayerPositions = currentStep.players.map(player => {
    const option1Line = currentStep.lines.find(
      l => l.from_player_id === player.id && l.option === 1
    );
    if (option1Line) {
      return { ...player, x: option1Line.to_x, y: option1Line.to_y, has_ball: false };
    }
    return { ...player, has_ball: false };
  });

  // Auto-assign ball to receiver of last Option 1 pass
  const lastPass = currentStep.lines
    .filter(l => l.line_type === 'pass' && l.option === 1 && l.to_player_id)
    .pop();
  if (lastPass?.to_player_id) {
    const receiverIdx = newPlayerPositions.findIndex(p => p.id === lastPass.to_player_id);
    if (receiverIdx >= 0) newPlayerPositions[receiverIdx].has_ball = true;
  }

  const newStep: StepData = {
    step_id: `step_${Date.now()}`,
    step_number: steps.length + 1,
    description: '',
    players: newPlayerPositions,
    lines: [],
    annotations: [],
  };

  return [...steps, newStep];
}
```

### Insert Step

Insert between two steps: use the same carry-forward logic from the step before the insertion point. Re-number all steps after insert.

### Delete Step

```typescript
function deleteStep(steps: StepData[], indexToDelete: number): StepData[] {
  if (steps.length <= 1) return steps; // Always keep at least 1 step
  const newSteps = steps.filter((_, i) => i !== indexToDelete);
  // Re-number
  return newSteps.map((s, i) => ({ ...s, step_number: i + 1 }));
}
```

Confirm deletion with a short toast prompt if the step has content (players > 0 or lines > 0).

---

## 10. Zone Selector

```tsx
const ZONES: { id: FieldZone; label: string }[] = [
  { id: 'full',      label: 'Full Field' },
  { id: 'opp_22',   label: 'Opp. 22' },
  { id: 'opp_half', label: 'Opp. Half' },
  { id: 'own_half', label: 'Own Half' },
  { id: 'own_22',   label: 'Own 22' },
  { id: 'lineout_l', label: 'Lineout L' },
  { id: 'lineout_r', label: 'Lineout R' },
];
```

Zone selector is stored per-play (in `play_data.field_zone`). Changing zone does not move players — it only changes the viewport.

---

## 11. Header Bar

```tsx
function EditorHeader({ title, onTitleChange, onLoad, onPreview, onSave, onShare, isSaving }: EditorHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
      <button onClick={() => navigate(-1)} className="text-white/50 hover:text-white">← Back</button>

      <input
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="Untitled Play"
        className="flex-1 bg-transparent text-white text-lg font-medium outline-none border-b border-white/10 focus:border-white/40 pb-0.5 min-w-0"
      />

      <div className="flex gap-2 ml-auto">
        <button onClick={onLoad}    className="px-3 py-1.5 text-sm text-white/60 hover:text-white border border-white/10 rounded">Load</button>
        <button onClick={onPreview} className="px-3 py-1.5 text-sm text-white/60 hover:text-white border border-white/10 rounded">Preview</button>
        <button onClick={onSave}    className="px-4 py-1.5 text-sm bg-white text-[#0a0f1a] font-semibold rounded hover:bg-white/90"
          disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onShare}   className="px-3 py-1.5 text-sm border border-white/20 text-white/70 hover:text-white rounded">Share ↗</button>
      </div>
    </header>
  );
}
```

---

## 12. Save Logic

```typescript
async function savePlay() {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    openSignInModal({ returnAction: 'save_play' });
    return;
  }

  // Check free tier limit for new plays
  if (!playId) {
    const plan = await getUserPlan(user.data.user.id);
    if (plan === 'free') {
      const { count } = await supabase
        .from('plays')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.data.user.id);
      if ((count ?? 0) >= 3) {
        openUpgradeModal();
        return;
      }
    }
  }

  setIsSaving(true);

  const playData = {
    version: 1,
    field_zone: activeZone,
    info: playInfo,
    steps: editorSteps,
  };

  if (playId) {
    // Update existing
    await supabase.from('plays')
      .update({ title: playTitle, play_data: playData, updated_at: new Date().toISOString() })
      .eq('id', playId)
      .eq('created_by', user.data.user.id);
  } else {
    // Create new
    const slug = await generatePlaySlug(playTitle);
    const { data } = await supabase.from('plays').insert({
      title: playTitle,
      slug,
      difficulty: playDifficulty,
      category: playCategory,
      is_library_play: false,
      created_by: user.data.user.id,
      play_data: playData,
      published: false,
    }).select().single();

    // Update URL to /editor/:id without page reload
    navigate(`/editor/${data.id}`, { replace: true });
  }

  setIsSaving(false);
  toast.success('Play saved!');
}
```

**Auto-save:** Save automatically every 30 seconds when the play has unsaved changes (`isDirty` flag). Show "Saving…" briefly.

---

## 13. Preview Mode

Clicking Preview opens the Play Viewer in a modal overlay (not a new page), showing the play in Overview mode as a player would see it. This uses the in-memory `editorSteps` data — it does not require a save first.

---

## 14. Load Play

Clicking Load opens a sheet showing the user's My Plays list. Selecting a play loads it into the editor. Warns if current play has unsaved changes.

---

## 15. Share from Editor

Only available if the play has been saved (has a `playId`). Copies `{origin}/moves/{slug}` to clipboard. If not yet saved, shows "Save your play first to get a share link."

The play must also be `published = true` for the link to work. If not published, prompt: "Publish your play to make the link work? [Publish & Share]"

Publishing sets `published = true` on the database record.

---

## 16. Play Info Editor

A secondary panel (accessible via a "Details" tab in the right sidebar) where the coach fills in the 6 info sections (what_is_it, when_to_use, etc.) and sets difficulty + category.

```tsx
const CATEGORIES = [
  'Attack Structure', 'Set Piece', 'Defence', 'Kick Game', 'Restarts', 'Other'
];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
```

---

## 17. Keyboard Shortcuts

| Key | Action |
|---|---|
| V or Esc | Switch to Select tool |
| R | Switch to Run tool |
| P | Switch to Pass tool |
| E | Switch to Eraser tool |
| T | Switch to Text tool |
| 1, 2, 3 | Switch active option |
| Backspace / Delete | Delete selected line or player |
| Cmd+S / Ctrl+S | Save play |
| Cmd+Z / Ctrl+Z | Undo (optional in V1 — use history array) |

---

## 18. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| User draws Run but misses all players | No line created. Only start drag on a player circle. |
| User draws Pass but second click misses all players | Cancel pass line. No line created. |
| User tries to delete last remaining step | Block deletion. Toast: "A play must have at least one step." |
| Save fails (network error) | Toast error. Keep play in memory. Retry on next save. |
| Title is empty on save | Use "Untitled Play" as default title |
| Two lines overlap exactly | Allowed. No deduplication. |
| Browser back during edit with unsaved changes | `useBeforeUnload` hook: "You have unsaved changes. Leave?" |
| Play has 0 players when saved | Allow. Warning toast: "Your play has no players." |
| Same player appears twice in a step | Prevent — player IDs must be unique per step |

---

## 19. Build Notes for AI Agent

**What to build:**
- `/editor` and `/editor/:playId` routes
- `EditorPage` component (full layout)
- `EditorHeader` component
- `ToolBar` component with all 8 tools
- `OptionSelector` component
- `ZoneSelector` component
- `StepTabs` component
- `PlayerPanel` (select mode panel)
- `TemplateSelector` modal
- `PlayInfoEditor` panel
- All tool interaction handlers (run draw, pass draw, annotations)
- Add/insert/delete step logic with carry-forward
- Save, auto-save, share, preview logic
- Keyboard shortcut bindings

**Dependencies:**
- Module 02 (`PlaybookCanvas` in editor mode — `isEditor={true}`)
- Module 01 (Supabase save)
- Module 07 (Auth check before save)

**Acceptance criteria:**
- Coach can open editor, pick Lineout Left template, see 15 players placed
- Coach draws a Run line from player 10 to a destination — yellow solid line appears
- Coach draws a Pass from player 9 to player 10 — dashed yellow line appears, ball oval transfers to 10
- Option 2 switch draws blue lines
- + Step creates a new step with players carried forward
- Save creates a new play record in Supabase
- Auto-save fires every 30 seconds on dirty state
- Preview modal shows the play animated correctly
