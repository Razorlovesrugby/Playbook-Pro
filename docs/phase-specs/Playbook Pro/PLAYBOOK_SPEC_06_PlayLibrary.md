# PLAYBOOK — Module 06: Play Library

**Product:** Playbook
**Module:** Play Library
**Version:** 1.0
**Dependencies:** Module 01 (Data Schema), Module 04 (Play Viewer)
**Agent task:** Build the `/moves` library page — play card grid, filter bar, search, and empty states.

---

## 1. User Story

**As a coach or player**, I browse the public play library to find plays that match my team's level and tactical situation. I filter by difficulty and category, click a play, and watch it.

---

## 2. Page Layout — Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MOVES                                                           │
│  Browse animated rugby plays. Filter by level and type.         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FILTER BAR:                                                     │
│  Difficulty: [All][Beginner][Intermediate][Advanced]            │
│  Category:   [All][Attack Structure][Set Piece][Defence][...]   │
│  [Search: _________________________]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  [THUMBNAIL]│  │  [THUMBNAIL]│  │  [THUMBNAIL]│             │
│  │  Play Title │  │  Play Title │  │  Play Title │             │
│  │  [BEG][ATK] │  │  [INT][SET] │  │  [BEG][DEF] │             │
│  │  4 steps    │  │  3 steps    │  │  5 steps    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  ...        │  │  ...        │  │  ...        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Desktop: 3-column grid.

---

## 3. Page Layout — Mobile

```
┌───────────────────────────────┐
│  NAVBAR                       │
├───────────────────────────────┤
│  MOVES                        │
│  Browse animated rugby plays  │
├───────────────────────────────┤
│  [Search: ___________________]│
│  Difficulty: [All][Beg][Int][Adv] │
│  Category:   [All][Atk][Set][Def]... │
├───────────────────────────────┤
│  ┌───────────┐ ┌───────────┐  │
│  │ THUMB     │ │ THUMB     │  │
│  │ Title     │ │ Title     │  │
│  │ [BEG][ATK]│ │ [INT][SET]│  │
│  │ 4 steps   │ │ 3 steps   │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ...       │ │ ...       │  │
│  └───────────┘ └───────────┘  │
└───────────────────────────────┘
```

Mobile: 2-column grid.

---

## 4. Play Card Component

```tsx
interface PlayCardProps {
  play: PlayRecord;
  onClick: () => void;
}

function PlayCard({ play, onClick }: PlayCardProps) {
  const stepCount = play.play_data?.steps?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-all bg-white/5 hover:bg-white/8"
    >
      {/* Thumbnail — static canvas preview */}
      <div className="aspect-video bg-[#0a0f1a] relative overflow-hidden">
        <PlayThumbnail play={play} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium text-sm">▶ Watch</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight mb-2">
          {play.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badges difficulty={play.difficulty} category={play.category} />
        </div>
        {stepCount > 0 && (
          <p className="text-white/30 text-xs mt-2">{stepCount} steps</p>
        )}
      </div>
    </button>
  );
}
```

### PlayThumbnail

A static (non-animated) render of the play's first step on a mini canvas.

```tsx
function PlayThumbnail({ play }: { play: PlayRecord }) {
  const step = play.play_data?.steps?.[0];
  if (!step) return <div className="w-full h-full bg-[#0a0f1a]" />;

  return (
    <div className="w-full h-full">
      <ResponsiveCanvas
        step={step}
        zone={play.play_data.field_zone ?? 'full'}
        activeOptions={[1, 2, 3]}
      />
    </div>
  );
}
```

---

## 5. Filter Bar

```tsx
const CATEGORIES = [
  'All',
  'Attack Structure',
  'Set Piece',
  'Defence',
  'Kick Game',
  'Restarts',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function FilterBar({ onFilter }: FilterBarProps) {
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory]    = useState('All');
  const [search, setSearch]        = useState('');

  // Debounce search
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onFilter({ difficulty, category, search: debouncedSearch });
  }, [difficulty, category, debouncedSearch]);

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search plays…"
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/30 text-sm outline-none focus:border-white/30"
      />

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-white/30 text-xs self-center">Level:</span>
        {DIFFICULTIES.map(d => (
          <FilterChip key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-white/30 text-xs self-center">Type:</span>
        {CATEGORIES.map(c => (
          <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all
        ${active
          ? 'bg-white text-[#0a0f1a]'
          : 'border border-white/20 text-white/50 hover:text-white hover:border-white/40'
        }`}
    >
      {label}
    </button>
  );
}
```

---

## 6. Data Fetching

```typescript
async function fetchLibraryPlays(filters: LibraryFilters): Promise<PlayRecord[]> {
  let query = supabase
    .from('plays')
    .select('id, title, slug, difficulty, category, play_data, created_at')
    .eq('is_library_play', true)
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (filters.difficulty && filters.difficulty !== 'All') {
    query = query.eq('difficulty', filters.difficulty.toLowerCase());
  }
  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
```

---

## 7. Empty States

**No results from filter:**
```
No plays match your filters.
Try adjusting the difficulty or category.
[Clear filters]
```

**Library has no plays (edge case — seed data issue):**
```
The play library is empty.
Check back soon — we're adding plays regularly.
```

**Search returns nothing:**
```
No plays found for "{{searchTerm}}"
Try different keywords or browse all plays.
[Clear search]
```

---

## 8. Page Header

```tsx
function LibraryHeader() {
  return (
    <div className="mb-8">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-2">MOVES</p>
      <h1 className="text-white text-3xl font-bold mb-2">Animated Rugby Plays</h1>
      <p className="text-white/50 text-sm">
        Browse the play library. Watch plays animate, then save to your collection.
      </p>
    </div>
  );
}
```

---

## 9. Navigation

Clicking a play card navigates to `/moves/{slug}`.

On the viewer page (`/moves/:slug`), the breadcrumb shows:
```
Moves / Out The Back Option
```
with "Moves" linking back to `/moves`.

---

## 10. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Supabase fetch fails | Show error state: "Could not load plays. Check your connection." with Retry button |
| play_data is null for a library play | Skip that card — don't crash the grid |
| Thumbnail canvas errors | Catch render error, show grey placeholder div instead |
| Library has 1 play | Grid shows 1 card. No pagination needed in V1. |
| Very long play title in card | Clamp to 2 lines with `line-clamp-2`. No overflow. |
| Category filter produces 0 results | Show empty state for that category with clear filter button |
| Search is very slow | Debounce 300ms. Show loading spinner on card grid while debounce resolves. |

---

## 11. Build Notes for AI Agent

**What to build:**
- `/moves` route and `LibraryPage` component
- `PlayCard` component with hover overlay
- `PlayThumbnail` (static canvas render)
- `FilterBar` with difficulty + category chips + search input
- Data fetching with filter query logic
- Empty state components
- Responsive 2-col (mobile) / 3-col (desktop) grid
- Breadcrumb in page header

**Acceptance criteria:**
- Library page loads at `/moves` with no auth and shows seeded plays
- Filter by "Beginner" shows only beginner plays
- Filter by "Attack Structure" shows only Attack Structure plays
- Filters combine (e.g., Beginner + Attack Structure)
- Search "crash" returns plays with "crash" in the title
- Clicking a play card navigates to the viewer
- Grid is responsive: 2 columns at 375px, 3 columns at 1024px
- Thumbnail renders the first step of each play as a static mini canvas
