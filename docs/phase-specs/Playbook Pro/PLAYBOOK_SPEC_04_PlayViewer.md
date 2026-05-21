# PLAYBOOK — Module 04: Play Viewer

**Product:** Playbook
**Module:** Play Viewer
**Version:** 1.0
**Dependencies:** Module 02 (Canvas Core), Module 03 (Animation Engine), Module 07 (Auth — for "Save" action)
**Agent task:** Build the full play viewer page at `/moves/{slug}` — both Overview and Step by Step modes, all controls, info panels, and action buttons.

---

## 1. User Story

**As a player**, I tap a link shared by my coach and immediately see the play animate in my browser — no login, no download. I can switch to Step by Step to study each moment and read the coaching notes.

**As a coach**, I browse the play library, find a play I want to use, watch it, and tap "Use this play" to copy it to My Plays for editing.

---

## 2. Page Layout — Desktop (≥768px)

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Moves | Editor | My Plays | Team | Sign in  │
├─────────────────────────────────────────────────────────────┤
│  Breadcrumb: Moves / Out The Back Option                    │
├───────────────────────────────┬─────────────────────────────┤
│                               │                             │
│   MODE TABS:                  │   PLAY TITLE                │
│   [Overview] [Step by Step]   │   Out The Back Option       │
│                               │   [BEGINNER] [Attack Struct]│
│                               │                             │
│   ┌───────────────────────┐   │   [Use this play]   [Share] │
│   │                       │   │                             │
│   │   ANIMATED CANVAS     │   │   ─────────────────────     │
│   │   (ResponsiveCanvas)  │   │                             │
│   │                       │   │   WHAT IS IT?               │
│   └───────────────────────┘   │   [expandable section]      │
│                               │                             │
│   STEP CONTROLS:              │   WHEN TO USE               │
│   [◀] [1][2][3][4][5] [▶]    │   [expandable section]      │
│                               │                             │
│   [■ Reset] [0.5x][1x][2x]   │   WHY IT WORKS              │
│                               │   [expandable section]      │
│   Step 1 / 5                  │                             │
│                               │   KEY POSITIONS             │
│   [OPTION CARDS: 1 2 3]      │   [expandable section]      │
│   (Step by Step only)         │                             │
│                               │   OPTIONS & ALTERNATIVES    │
│   [STEP DESCRIPTION]          │   [expandable section]      │
│   (Step by Step only)         │                             │
│                               │   COMMON MISTAKES           │
│                               │   [expandable section]      │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 3. Page Layout — Mobile (< 768px)

```
┌───────────────────────────────┐
│  NAVBAR: Logo          [Menu] │
├───────────────────────────────┤
│  ← Moves                      │
├───────────────────────────────┤
│  Out The Back Option          │
│  [BEGINNER] [Attack Structure]│
├───────────────────────────────┤
│  MODE TABS:                   │
│  [Overview]  [Step by Step]   │
├───────────────────────────────┤
│                               │
│   ANIMATED CANVAS             │
│   (full width, responsive)    │
│                               │
├───────────────────────────────┤
│  [◀] [1][2][3][4][5] [▶] [■] │
│  [0.5x][1x][2x]   Step 1 / 5 │
├───────────────────────────────┤
│  [Option 1] [Option 2] [Op 3] │
│  (Step by Step only)          │
├───────────────────────────────┤
│  Step description text        │
│  (Step by Step only)          │
├───────────────────────────────┤
│  [Use this play]   [Share ↗]  │
├───────────────────────────────┤
│  ─── WHAT IS IT? ─────────── │
│  Accordion content...         │
│  ─── WHEN TO USE ──────────── │
│  ...                          │
│  (all 6 info sections)        │
└───────────────────────────────┘
```

---

## 4. Component: Mode Tabs

Two tabs that switch between Overview and Step by Step. The active tab has a white underline. Default: Overview.

```tsx
type ViewMode = 'overview' | 'step_by_step';

function ModeTabs({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex border-b border-white/10 mb-4">
      {(['overview', 'step_by_step'] as ViewMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-2 text-sm font-medium transition-colors
            ${mode === m
              ? 'text-white border-b-2 border-white'
              : 'text-white/50 hover:text-white/80'
            }`}
        >
          {m === 'overview' ? '▶  Overview' : '☰  Step by Step'}
        </button>
      ))}
    </div>
  );
}
```

---

## 5. Component: Step Controls

Shown in both modes. In Overview mode, the numbered step buttons also act as chapter markers (clicking jumps to that step and plays from there).

```tsx
function StepControls({
  currentStep, totalSteps, isPlaying,
  onPrev, onNext, onGoTo, onPlayPause, onReset, speed, onSpeedChange
}: StepControlsProps) {
  return (
    <div className="space-y-2 mt-3">
      {/* Step navigation row */}
      <div className="flex items-center gap-2">
        <button onClick={onPrev} disabled={currentStep === 0}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30">
          ◀
        </button>

        {/* Step number buttons */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`w-8 h-8 rounded text-sm font-mono
                ${i === currentStep
                  ? 'bg-white text-[#0a0f1a] font-bold'
                  : 'text-white/50 border border-white/20 hover:border-white/60'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button onClick={onNext} disabled={currentStep === totalSteps - 1}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30">
          ▶
        </button>
      </div>

      {/* Playback controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onPlayPause}
            className="px-4 py-1.5 bg-white text-[#0a0f1a] rounded font-medium text-sm hover:bg-white/90">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={onReset}
            className="px-3 py-1.5 border border-white/20 text-white/60 rounded text-sm hover:text-white">
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <SpeedControl value={speed} onChange={onSpeedChange} />
          <span className="text-white/40 text-xs font-mono ml-2">
            Step {currentStep + 1} / {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Component: Option Cards (Step by Step only)

Option cards appear below the controls in Step by Step mode. Only show cards for options that actually exist in the current step's lines.

```tsx
function OptionCards({
  currentStep, activeOptions, onOptionToggle
}: OptionCardsProps) {
  const OPTION_CONFIG = [
    { num: 1, colour: '#F5C518', label: 'Option 1' },
    { num: 2, colour: '#4A90D9', label: 'Option 2' },
    { num: 3, colour: '#FF8C00', label: 'Option 3' },
  ];

  // Only show options that have lines in this step
  const presentOptions = OPTION_CONFIG.filter(opt =>
    currentStep.lines.some(l => l.option === opt.num)
  );

  if (presentOptions.length <= 1) return null; // No card if only 1 option

  return (
    <div className="flex gap-2 mt-3">
      {presentOptions.map(opt => {
        const isActive = activeOptions.includes(opt.num);
        return (
          <button
            key={opt.num}
            onClick={() => onOptionToggle(opt.num)}
            className={`flex items-center gap-2 px-3 py-2 rounded border transition-all text-sm
              ${isActive
                ? 'border-opacity-100 bg-opacity-20'
                : 'border-white/10 text-white/30'
              }`}
            style={{
              borderColor: isActive ? opt.colour : undefined,
              backgroundColor: isActive ? `${opt.colour}22` : undefined,
              color: isActive ? opt.colour : undefined,
            }}
          >
            <span className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: opt.colour }} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

**Option toggle logic:**
- Tapping a highlighted option card dims it (removes from `activeOptions`)
- Tapping a dimmed option card highlights it (adds to `activeOptions`)
- At least one option must always be active — prevent all-off state
- When entering Step by Step mode, reset to `activeOptions = [1, 2, 3]` (show all)

---

## 7. Component: Step Description

In Step by Step mode, show the current step's description text below the option cards.

```tsx
function StepDescription({ step }: { step: StepData }) {
  if (!step.description) return null;
  return (
    <p className="mt-3 text-white/70 text-sm leading-relaxed">
      {step.description}
    </p>
  );
}
```

---

## 8. Component: Info Panels

The 6 info sections below the canvas are expandable accordions. Default: all collapsed on mobile, all expanded on desktop.

```tsx
const INFO_SECTIONS = [
  { key: 'what_is_it',          label: 'What Is It?' },
  { key: 'when_to_use',         label: 'When to Use' },
  { key: 'why_it_works',        label: 'Why It Works' },
  { key: 'key_positions',       label: 'Key Positions' },
  { key: 'options_alternatives', label: 'Options & Alternatives' },
  { key: 'common_mistakes',     label: 'Common Mistakes' },
];

function InfoPanels({ info }: { info: PlayInfo }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(isMobile ? [] : INFO_SECTIONS.map(s => s.key))
  );

  return (
    <div className="mt-6 space-y-1">
      {INFO_SECTIONS.map(section => {
        const content = info[section.key as keyof PlayInfo];
        if (!content) return null;
        const isOpen = expanded.has(section.key);

        return (
          <div key={section.key} className="border border-white/10 rounded">
            <button
              onClick={() => setExpanded(prev => {
                const next = new Set(prev);
                isOpen ? next.delete(section.key) : next.add(section.key);
                return next;
              })}
              className="w-full flex justify-between items-center p-4 text-left text-white/80 hover:text-white text-sm font-medium uppercase tracking-wide"
            >
              {section.label}
              <span className="text-white/40">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed">
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 9. "Use This Play" Button

Copies the play to the authenticated user's My Plays.

**If user is not signed in:**
→ Show modal: "Sign in to save this play to your collection"
→ [Sign In with Magic Link] button
→ After sign-in, proceed with the save

**If user is signed in:**
→ Check free tier limit (Module 01 — `get_user_plan`)
→ If free tier at limit: show upgrade prompt
→ If allowed: duplicate the play record with `created_by = auth.uid()`, `is_library_play = false`
→ Toast: "Play saved to My Plays" → navigate to `/my-plays`

```tsx
async function handleUseThisPlay(play: PlayRecord) {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    openSignInModal({ returnAction: 'save_play', playId: play.id });
    return;
  }

  // Check play count
  const { count } = await supabase
    .from('plays')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.data.user.id);

  const plan = await getUserPlan(user.data.user.id);
  if (plan === 'free' && (count ?? 0) >= 3) {
    openUpgradeModal();
    return;
  }

  // Duplicate the play
  const { error } = await supabase.from('plays').insert({
    title: play.title,
    slug: await generateSlug(play.title),
    difficulty: play.difficulty,
    category: play.category,
    is_library_play: false,
    created_by: user.data.user.id,
    play_data: play.play_data,
    published: false,
  });

  if (error) {
    toast.error('Could not save play. Try again.');
    return;
  }

  toast.success('Saved to My Plays!');
  navigate('/my-plays');
}
```

---

## 10. Share Button

Copies the current page URL to clipboard. Shows a confirmation toast.

```tsx
function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/moves/${slug}`;

  async function handleShare() {
    if (navigator.share) {
      // Use native share sheet on mobile
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded text-white/70 hover:text-white text-sm">
      {copied ? '✓ Copied!' : '↗ Share'}
    </button>
  );
}
```

---

## 11. Data Fetching

```typescript
// Route: /moves/:slug
// Fetch: plays WHERE slug = :slug AND (is_library_play = true OR published = true)

async function loadPlay(slug: string): Promise<PlayRecord | null> {
  const { data, error } = await supabase
    .from('plays')
    .select('*')
    .eq('slug', slug)
    .or('is_library_play.eq.true,published.eq.true')
    .single();

  if (error || !data) return null;
  return data;
}
```

---

## 12. Difficulty and Category Badges

```tsx
const DIFFICULTY_STYLES = {
  beginner:     'bg-green-900/40 text-green-400 border-green-700',
  intermediate: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  advanced:     'bg-red-900/40 text-red-400 border-red-700',
};

function Badges({ difficulty, category }: { difficulty: string; category: string }) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {difficulty && (
        <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium border ${DIFFICULTY_STYLES[difficulty] ?? ''}`}>
          {difficulty}
        </span>
      )}
      {category && (
        <span className="px-2 py-0.5 rounded text-xs uppercase font-medium border border-white/10 text-white/50">
          {category}
        </span>
      )}
    </div>
  );
}
```

---

## 13. Overview Mode Behaviour

In Overview mode:
- The Play button is prominently displayed on the canvas as a centred overlay if the animation has not started yet
- Once Play is tapped, the canvas animates and the Play button becomes a Pause button in the controls bar
- After the final step, the animation stops and shows "Replay" instead of "Play"
- The step number indicator tracks progress

---

## 14. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Slug not found | 404 page: "This play is not available." with link back to Moves library |
| Play has no info sections | Skip info panels entirely |
| Play has only 1 step | In Step by Step: hide Prev/Next, show "Step 1 / 1". In Overview: show static canvas. |
| User on mobile taps Overview but animation is slow | Animation uses Konva tweens (hardware accelerated). Ensure node count is reasonable. |
| All option cards deselected | Prevent — if user deselects the last active option, keep it active (ignore the tap) |
| "Use this play" on a play the user already has | Check for duplicate title in their plays. Toast: "You already have this play in My Plays." |
| Share API not available (desktop) | Fall back to clipboard copy |
| play_data.info is null or empty | InfoPanels renders nothing — no empty sections shown |

---

## 15. Build Notes for AI Agent

**What to build:**
- `/moves/:slug` page route
- `PlayViewerPage` component (full layout for desktop and mobile)
- `ModeTabs` component
- `StepControls` component
- `OptionCards` component
- `InfoPanels` accordion component
- `Badges` component (difficulty + category)
- "Use this play" handler with auth check and upgrade modal
- `ShareButton` component
- Data fetching via Supabase

**What NOT to build here:**
- The animated canvas (Module 03)
- The library listing page (Module 06)

**Acceptance criteria:**
- Play viewer loads at `/moves/out-the-back-option-1000000001` without auth
- Overview mode auto-plays all steps and stops
- Step by Step mode shows step 1, user can advance/go back
- Option cards appear only when step has multiple options
- Tapping an option card dims/highlights lines correctly
- "Use this play" triggers sign-in modal if user is not authenticated
- Share button copies URL or opens native share sheet
- All 6 info sections expand/collapse correctly
- Mobile layout is clean and usable on a 375px viewport
