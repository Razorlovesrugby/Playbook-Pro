# PLAYBOOK — Module 10: Edge Cases & Error Handling

**Product:** Playbook
**Module:** Edge Cases & Error Handling (Cross-cutting)
**Version:** 1.0
**Dependencies:** All modules
**Agent task:** Implement all cross-cutting error states, loading states, mobile quirks, and performance requirements across the entire app.

---

## 1. Overview

This module documents failure states, edge cases, and defensive patterns that apply across all modules. These are not afterthoughts — they must be implemented inline as each module is built.

---

## 2. Network & Loading States

### Play Viewer — Slow Load

```tsx
// Play viewer must handle slow connections gracefully
function PlayViewerPage({ slug }: { slug: string }) {
  const { play, loading, error } = usePlay(slug);

  if (loading) return <PlayViewerSkeleton />;
  if (error || !play) return <PlayNotFound />;
  return <PlayViewer play={play} />;
}

// Skeleton loader matches the real layout
function PlayViewerSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Matches viewer layout proportions */}
      <div className="h-8 bg-white/5 rounded w-2/3 mb-4" />
      <div className="aspect-video bg-white/5 rounded mb-4" />
      <div className="h-4 bg-white/5 rounded w-full mb-2" />
      <div className="h-4 bg-white/5 rounded w-3/4" />
    </div>
  );
}
```

Performance target: First meaningful paint < 2s on 4G connection. The play JSON is 5–50KB. The page should be interactive within 3s on a mid-range phone with 4G.

### Library Page — Loading

Show a skeleton grid of 6 placeholder cards while plays load.

### Editor — Auto-Save Indicator

```tsx
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function SaveIndicator({ state }: { state: SaveState }) {
  const messages: Record<SaveState, string> = {
    idle:   '',
    dirty:  '● Unsaved',
    saving: 'Saving…',
    saved:  '✓ Saved',
    error:  '⚠ Save failed',
  };
  const colours: Record<SaveState, string> = {
    idle:   'text-transparent',
    dirty:  'text-white/30',
    saving: 'text-white/50',
    saved:  'text-green-400',
    error:  'text-red-400',
  };
  return <span className={`text-xs ${colours[state]}`}>{messages[state]}</span>;
}
```

---

## 3. Play Not Found / Unavailable

```tsx
function PlayNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">🏉</p>
        <h1 className="text-white text-xl font-bold">Play not available</h1>
        <p className="text-white/50 text-sm">
          This play may have been removed or the link is no longer active.
        </p>
        <Link to="/moves" className="inline-block px-4 py-2 bg-white text-[#0a0f1a] rounded text-sm font-semibold">
          Browse plays
        </Link>
      </div>
    </div>
  );
}
```

---

## 4. Team Not Found

```tsx
function TeamNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-white text-xl font-bold">Team not found</h1>
        <p className="text-white/50 text-sm">
          This team's playbook doesn't exist or the link is incorrect.
        </p>
      </div>
    </div>
  );
}
```

---

## 5. Empty States

| Page | Condition | Empty State Message |
|---|---|---|
| My Plays | No saved plays | "You haven't saved any plays yet. Browse the library or create one in the editor." + [Browse Library] + [Open Editor] |
| Team Dashboard | No plays published | "You haven't published any plays to your team yet. Add plays from My Plays." + [+ Add Play] |
| Team Playbook (player) | Coach hasn't published any plays | "Your coach hasn't published any plays yet. Check back later." |
| Library | No plays match filter | "No plays match your filters." + [Clear Filters] |
| Library | Search returns nothing | "No plays found for '{{term}}'." + [Clear Search] |

---

## 6. Unsaved Changes Warning

```typescript
// In editor — warn before leaving with unsaved changes
useBeforeUnload(
  isDirty,
  'You have unsaved changes. Are you sure you want to leave?'
);

// Also intercept React Router navigation
useEffect(() => {
  if (!isDirty) return;
  const unblock = navigate.block('You have unsaved changes. Leave without saving?');
  return unblock;
}, [isDirty]);
```

---

## 7. Mobile-Specific Issues

### iOS Safari Canvas Touch

Konva handles touch events but iOS Safari has some quirks:

```typescript
// Prevent iOS bounce scroll interfering with canvas drag
// Apply to the canvas container div
const canvasContainerStyle = {
  touchAction: 'none',  // Critical — prevents scroll on canvas touch
  WebkitOverflowScrolling: 'touch',
};
```

### iOS Safari Magic Link Redirect

When a user taps a magic link on iOS, the link opens in the browser. Supabase handles the redirect automatically. Ensure:
- `emailRedirectTo` uses the full production URL (not localhost)
- Test on actual iOS device — the hash fragment handling can differ from desktop

### Mobile Keyboard Pushing Canvas

When the step description textarea is focused in the editor, the mobile keyboard pushes the viewport up. Prevent canvas distortion:

```css
/* In editor layout */
.editor-canvas-wrapper {
  height: calc(100dvh - var(--header-height) - var(--toolbar-height) - var(--step-tabs-height));
  /* dvh = dynamic viewport height — accounts for mobile keyboard */
}
```

### Tap Target Sizes

All interactive elements on mobile must be at least 44×44px. Player nodes on the canvas use a `hitStrokeWidth` of 8px (Module 02) to expand their tap area beyond the visible circle.

---

## 8. Canvas Performance

### Node Count

The canvas renders at most 30 player nodes per step (15 attack + 15 defence). This is not a performance concern for Konva.

### Line Count

Typically 5–20 lines per step. No performance concern.

### Thumbnail Grid

The library page renders multiple mini-canvas thumbnails simultaneously. To avoid performance issues:
- Use `IntersectionObserver` to lazy-render thumbnails (only render when in viewport)
- Consider rendering thumbnails as static SVG instead of live Konva canvases

```tsx
function LazyThumbnail({ play }: { play: PlayRecord }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="aspect-video bg-[#0a0f1a]">
      {isVisible ? <PlayThumbnail play={play} /> : null}
    </div>
  );
}
```

### Animation on Low-End Devices

If frame rate drops during animation (detectable via `requestAnimationFrame` timing):
- Skip tweening for stationary players (where start == end position)
- Reduce tween count to only players with Option 1 lines

---

## 9. Browser Compatibility

| Browser | Support Level |
|---|---|
| Chrome (desktop) | ✅ Full support |
| Safari (macOS) | ✅ Full support |
| Safari (iOS 15+) | ✅ Full support |
| Chrome (Android) | ✅ Full support |
| Firefox | ✅ Full support |
| Samsung Internet | ✅ Full support |
| IE11 | ❌ Not supported |

Test specifically:
- Canvas rendering on Safari iOS (Konva + WebGL)
- Magic link redirect on Safari iOS
- Clipboard API on iOS (Safari uses a different clipboard access pattern)

---

## 10. Clipboard API Fallback

```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  // Modern clipboard API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method
    }
  }

  // Legacy fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textarea);
  return success;
}
```

---

## 11. Error Boundary

Wrap the canvas in a React error boundary to prevent canvas crashes from breaking the entire page.

```tsx
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Canvas error:', error, info);
    // In production: log to error tracking (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="aspect-video bg-[#0a0f1a] rounded flex items-center justify-center">
          <p className="text-white/30 text-sm">Could not render play canvas.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 12. Play JSON Validation

Before saving any play to Supabase, validate the JSON structure:

```typescript
function validatePlayData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['play_data must be an object'] };
  }

  const play = data as Partial<PlayData>;

  if (!Array.isArray(play.steps)) {
    errors.push('steps must be an array');
  } else {
    if (play.steps.length === 0) {
      errors.push('play must have at least one step');
    }
    play.steps.forEach((step, i) => {
      if (!Array.isArray(step.players)) errors.push(`step ${i+1}: players must be an array`);
      if (!Array.isArray(step.lines))   errors.push(`step ${i+1}: lines must be an array`);
      step.lines?.forEach((line, j) => {
        if (![1, 2, 3].includes(line.option)) errors.push(`step ${i+1} line ${j+1}: invalid option ${line.option}`);
        if (!['run', 'pass'].includes(line.line_type)) errors.push(`step ${i+1} line ${j+1}: invalid line_type`);
      });
    });
  }

  return { valid: errors.length === 0, errors };
}
```

---

## 13. Rate Limiting

Supabase applies rate limits on auth operations. Specifically:
- Magic link sends are limited (default: 3 per hour per email in Supabase free tier)
- If user spam-clicks "Send Magic Link," the button should disable for 60 seconds after each send

```typescript
const [sendCooldown, setSendCooldown] = useState(0);

async function handleSendLink() {
  await sendMagicLink(email);
  setSendCooldown(60);
  const timer = setInterval(() => {
    setSendCooldown(prev => {
      if (prev <= 1) { clearInterval(timer); return 0; }
      return prev - 1;
    });
  }, 1000);
}

// In the button:
<button disabled={sendCooldown > 0} onClick={handleSendLink}>
  {sendCooldown > 0 ? `Resend in ${sendCooldown}s` : 'Send Magic Link'}
</button>
```

---

## 14. Responsive Breakpoints

| Breakpoint | Class | Canvas behaviour |
|---|---|---|
| < 768px | mobile | Canvas full width, controls stack vertically |
| 768px–1024px | tablet | Canvas 60% width, info panel beside |
| > 1024px | desktop | Full two-column editor layout |

---

## 15. Toast Notifications

Use a consistent toast library (e.g., `react-hot-toast` or `sonner`) across all modules.

```typescript
// Consistent toast calls
toast.success('Play saved!');
toast.success('Copied to clipboard!');
toast.error('Could not save. Try again.');
toast.error('Sign in to save plays.');
toast('Play published. Anyone with the link can view it.');
```

Configuration:
- Position: bottom-center on mobile, bottom-right on desktop
- Duration: 3000ms for success, 5000ms for error
- Max 3 toasts visible simultaneously

---

## 16. Page Titles and Meta Tags

Each page must have a meaningful `<title>` for SEO and browser tab legibility:

| Route | Title |
|---|---|
| `/` | Playbook — Animated Rugby Plays |
| `/moves` | Moves — Playbook |
| `/moves/:slug` | `{play.title}` — Playbook |
| `/editor` | Editor — Playbook |
| `/my-plays` | My Plays — Playbook |
| `/team` | Team Dashboard — Playbook |
| `/team/:slug` | `{team.name}` Playbook |
| `/pricing` | Pricing — Playbook |

For `/moves/:slug`, also set Open Graph tags for share previews:
```html
<meta property="og:title" content="{play.title} — Playbook" />
<meta property="og:description" content="Watch this animated rugby play on Playbook." />
<meta property="og:url" content="https://playbook.app/moves/{slug}" />
```

---

## 17. Build Notes for AI Agent

**This module is cross-cutting.** As you build each feature module, reference this document and implement:

- Skeleton loaders in every data-fetching component
- Error boundaries around every canvas
- `useBeforeUnload` in the editor
- `touchAction: 'none'` on canvas containers
- `LazyThumbnail` on library card grid
- `CanvasErrorBoundary` in viewer and editor
- Clipboard fallback in all copy-to-clipboard actions
- Play JSON validation before any Supabase insert
- Rate limit cooldown on magic link send
- Consistent toast library configured once at app root
- Correct page titles on all routes
- Empty states on all list/grid pages
- "Play not found" and "Team not found" pages

**Acceptance criteria:**
- Viewing a deleted play URL shows the "Play not available" page (not a blank screen or error)
- Library renders skeleton grid while loading
- Editor shows unsaved changes warning on browser back
- Canvas touch events don't trigger page scroll on mobile
- Save failure shows error toast and retains in-memory state
- Rate limit cooldown fires correctly on magic link form
