# PLAYBOOK — Module 08: Team Dashboard

**Product:** Playbook
**Module:** Team Dashboard
**Version:** 1.0
**Dependencies:** Module 01 (Data Schema), Module 07 (Auth), Module 04 (Play Viewer)
**Agent task:** Build the team creation flow, team dashboard for coaches, team playbook page for players, and publish-to-team functionality.

---

## 1. User Story

**As a coach**, I create a team, publish my plays to the team playbook, and share the team link with my squad. Players tap the link and see all the published plays without needing an account.

**As a player**, I tap the team link in WhatsApp, see all the team's plays organised by the coach, and watch any of them.

---

## 2. Team Dashboard — Coach View

Route: `/team` (requires auth, redirects to team setup if no team exists)

```
┌───────────────────────────────────────────────────┐
│  NAVBAR                                           │
├───────────────────────────────────────────────────┤
│  Belsize Park RFC                [Team Link ↗]   │
│  Free Plan · 0/3 plays published                  │
├───────────────────────────────────────────────────┤
│                                                   │
│  TEAM PLAYBOOK                     [+ Add Play]  │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Out The Back Option                        │  │
│  │  [BEGINNER] [Attack Structure]  [Remove] ↑↓ │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │  The Crash Ball                             │  │
│  │  [BEGINNER] [Attack Structure]  [Remove] ↑↓ │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ─────────────────────────────────────────────── │
│  TEAM SETTINGS                                    │
│  Team Name: [Belsize Park RFC___________]  [Save] │
│                                                   │
│  Plan: Free  [Upgrade to Team Plan →]             │
└───────────────────────────────────────────────────┘
```

---

## 3. Team Playbook — Player View

Route: `/team/{team-slug}` (no auth required)

```
┌───────────────────────────────────────────────────┐
│  NAVBAR                                           │
├───────────────────────────────────────────────────┤
│  Belsize Park RFC                                 │
│  Team Playbook                                    │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌───────────────┐  ┌───────────────┐            │
│  │  [THUMBNAIL]  │  │  [THUMBNAIL]  │            │
│  │  Out The Back │  │  Crash Ball   │            │
│  │  [BEG][ATK]   │  │  [BEG][ATK]  │            │
│  └───────────────┘  └───────────────┘            │
│  ┌───────────────┐  ┌───────────────┐            │
│  │  ...          │  │  ...          │            │
│  └───────────────┘  └───────────────┘            │
└───────────────────────────────────────────────────┘
```

Same grid layout as the library page (Module 06). Clicking a play opens the viewer (`/moves/{slug}`).

---

## 4. Team Setup Flow

When a coach visits `/team` for the first time (no team exists), show the setup screen:

```
┌───────────────────────────────────────────────────┐
│  Create your team                                 │
│                                                   │
│  Team name:                                       │
│  [_______________________________________]        │
│                                                   │
│  [Create Team]                                    │
│                                                   │
│  You can add plays and share a link with your    │
│  squad after setup.                               │
└───────────────────────────────────────────────────┘
```

```typescript
async function createTeam(name: string, userId: string): Promise<Team> {
  const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 8);

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, slug, created_by: userId })
    .select()
    .single();

  if (teamError) throw teamError;

  // Add creator as owner
  await supabase.from('team_coaches').insert({
    team_id: team.id,
    user_id: userId,
    role: 'owner',
  });

  return team;
}
```

---

## 5. Publish Play to Team

From the Team Dashboard, clicking **+ Add Play** opens a sheet showing the coach's saved plays (My Plays). Selecting a play adds it to the team's playbook.

```typescript
async function publishPlayToTeam(teamId: string, playId: string, publishedBy: string): Promise<void> {
  // Check team plan limits
  const { data: team } = await supabase
    .from('teams')
    .select('plan')
    .eq('id', teamId)
    .single();

  if (team?.plan === 'free') {
    const { count } = await supabase
      .from('team_plays')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);
    
    if ((count ?? 0) >= 3) {
      throw new Error('PLAN_LIMIT'); // Handled by UI to show upgrade prompt
    }
  }

  // Ensure the play is published (public link must work)
  await supabase.from('plays')
    .update({ published: true })
    .eq('id', playId);

  // Add to team playbook
  const { count: currentCount } = await supabase
    .from('team_plays')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);

  await supabase.from('team_plays').insert({
    team_id: teamId,
    play_id: playId,
    published_by: publishedBy,
    sort_order: currentCount ?? 0,
  });
}
```

---

## 6. Remove Play from Team

```typescript
async function removePlayFromTeam(teamId: string, playId: string): Promise<void> {
  await supabase.from('team_plays')
    .delete()
    .eq('team_id', teamId)
    .eq('play_id', playId);
  // Does NOT unpublish the play — the play's public URL still works
}
```

---

## 7. Reorder Plays

On the coach dashboard, plays can be reordered via drag-and-drop (or up/down arrows on mobile). Update `sort_order` on reorder.

```typescript
async function reorderTeamPlays(
  teamId: string,
  orderedPlayIds: string[]
): Promise<void> {
  const updates = orderedPlayIds.map((playId, index) =>
    supabase.from('team_plays')
      .update({ sort_order: index })
      .eq('team_id', teamId)
      .eq('play_id', playId)
  );
  await Promise.all(updates);
}
```

---

## 8. Team Link

The team link is: `{origin}/team/{team-slug}`

Copy to clipboard button:
```tsx
function TeamLinkButton({ teamSlug }: { teamSlug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/team/${teamSlug}`;

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded text-sm text-white/60 hover:text-white"
    >
      {copied ? '✓ Copied!' : 'Team Link ↗'}
    </button>
  );
}
```

---

## 9. Plan Limits in Team Dashboard

Show the coach's current plan status prominently:

| Plan | Max team plays | Multiple coach accounts |
|---|---|---|
| Free | 3 | 1 (owner only) |
| Team | Unlimited | 1 |
| Club | Unlimited | Unlimited |

```tsx
function PlanStatus({ plan, publishedCount }: PlanStatusProps) {
  const isFree = plan === 'free';
  const limit = isFree ? 3 : null;

  return (
    <div className={`text-xs rounded px-3 py-1.5 inline-flex items-center gap-2
      ${isFree ? 'bg-white/5 text-white/40' : 'bg-green-900/30 text-green-400'}`}>
      <span>{plan === 'free' ? 'Free Plan' : plan === 'team' ? 'Team Plan' : 'Club Plan'}</span>
      {limit && (
        <span className={publishedCount >= limit ? 'text-yellow-400' : ''}>
          {publishedCount}/{limit} plays
        </span>
      )}
    </div>
  );
}
```

When the free tier limit is hit (3 plays published):
- The "+ Add Play" button is disabled
- A banner appears: "You've reached the free plan limit. Upgrade to Team to publish unlimited plays."
- [Upgrade to Team] CTA links to `/pricing`

---

## 10. Add Coach (Club Plan Only)

On Club plan, team owners can invite additional coaches:

```
┌───────────────────────────────────────────┐
│  COACHES (Club Plan)                      │
│                                           │
│  Ray McKenzie (Owner)                     │
│  sean@example.com (Coach)   [Remove]      │
│                                           │
│  [+ Invite Coach: email@example.com]      │
│  [Send Invite]                            │
└───────────────────────────────────────────┘
```

Inviting a coach sends them a magic link (same flow as normal sign-in). After signing in they are automatically added to `team_coaches` via a pending invite record (use a `team_invites` table for this).

**This feature is gated to Club plan.** On Team plan, the section shows: "Add multiple coaches with the Club plan."

---

## 11. Team Invites Schema (Club Plan Add)

```sql
CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

When an invited coach signs in for the first time, check for a pending invite with their email and auto-join the team.

---

## 12. Data Fetching

```typescript
// Load coach's team and published plays
async function loadTeamDashboard(userId: string) {
  // Get user's team
  const { data: membership } = await supabase
    .from('team_coaches')
    .select('team_id, role, teams(*)')
    .eq('user_id', userId)
    .single();

  if (!membership) return null;

  const team = membership.teams as Team;

  // Get published plays (ordered)
  const { data: teamPlays } = await supabase
    .from('team_plays')
    .select('play_id, sort_order, plays(*)')
    .eq('team_id', team.id)
    .order('sort_order');

  return { team, teamPlays: teamPlays ?? [], role: membership.role };
}

// Load team playbook (public, no auth)
async function loadTeamPlaybook(teamSlug: string) {
  const { data: team } = await supabase
    .from('teams')
    .select('id, name')
    .eq('slug', teamSlug)
    .single();

  if (!team) return null;

  const { data: teamPlays } = await supabase
    .from('team_plays')
    .select('sort_order, plays(id, title, slug, difficulty, category, play_data)')
    .eq('team_id', team.id)
    .order('sort_order');

  return { team, plays: (teamPlays ?? []).map(tp => tp.plays).filter(Boolean) };
}
```

---

## 13. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Coach has no team on `/team` | Show team setup screen |
| Team slug collision | Add extra random chars until unique |
| Coach tries to publish a play they don't own | RLS blocks it. Show: "You can only publish your own plays." |
| Team link visited but team doesn't exist | 404: "This team's playbook doesn't exist." |
| Player visits team page but no plays published | Empty state: "Your coach hasn't published any plays yet." |
| Reorder fails mid-drag | Show error toast. Revert to previous order. |
| Coach removes a play from team that players have bookmarked | Play is still accessible at its direct `/moves/{slug}` URL — only removed from team page listing |
| Free tier coach tries to add 4th play | Disable button, show upgrade banner |
| Multiple coaches on Club plan edit team simultaneously | Last write wins for sort_order. Acceptable for V1. |

---

## 14. Build Notes for AI Agent

**What to build:**
- `/team` route — coach dashboard with auth gate
- `/team/:teamSlug` route — player-facing team playbook (no auth)
- Team creation flow (new team modal/page)
- `TeamDashboard` component (plays list, add play, remove play, reorder)
- `TeamPlaybook` component (player view — grid of play cards)
- `TeamLinkButton` component
- `PlanStatus` component
- `publishPlayToTeam`, `removePlayFromTeam`, `reorderTeamPlays` functions
- "+ Add Play" sheet (shows My Plays for selection)
- Plan limit enforcement
- `team_invites` table + invite flow (can stub for V1 — just build the schema)

**Acceptance criteria:**
- New coach can create a team with a name and get a team slug
- Coach can add a play from My Plays to the team playbook
- Team playbook appears at `/team/{slug}` without auth
- Free plan limits to 3 published plays (4th is blocked)
- Upgrade prompt appears when limit is hit
- Team link copies to clipboard
- Player can click any play card on team page and go to the viewer
