# PLAYBOOK — Module 07: Auth & Share Links

**Product:** Playbook
**Module:** Auth (Magic Link) & Share Links
**Version:** 1.0
**Dependencies:** Module 01 (Data Schema)
**Agent task:** Set up Supabase magic link auth, build the sign-in flow, session management, and public share link generation.

---

## 1. User Story

**As a player**, I never need to sign in. I tap a link and the play opens immediately.

**As a coach**, I click "Sign In" and enter my email. I get a magic link. I click it, I'm in — no password needed. My session persists. I don't need to sign in again on the same device.

---

## 2. Auth Model

| User Type | Auth Required | Method |
|---|---|---|
| Anonymous viewer | ❌ No | None — public play URLs work without any auth |
| Coach | ✅ Yes | Supabase magic link (email OTP) |

There is no password auth. No Google Sign-In. No OAuth. Magic link only.

---

## 3. Supabase Magic Link Setup

```typescript
// auth.ts — Supabase auth helpers

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Send magic link to email
export async function sendMagicLink(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // After clicking the link, redirect to this URL
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      // Do NOT create user if they don't exist? No — auto-create is fine for coaches.
      shouldCreateUser: true,
    },
  });
  return { error };
}

// Sign out
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current session (reactive)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

---

## 4. Sign-In Page

Route: `/auth`

```
┌─────────────────────────────────┐
│  PLAYBOOK                        │
│                                  │
│  Sign in to save and share plays │
│                                  │
│  [Email address _______________] │
│                                  │
│  [Send Magic Link]               │
│                                  │
│  ─────────────────────────────── │
│  No password needed. We'll send  │
│  a sign-in link to your email.   │
└─────────────────────────────────┘
```

**After submitting email:**
```
┌─────────────────────────────────┐
│  PLAYBOOK                        │
│                                  │
│  Check your email                │
│                                  │
│  We sent a sign-in link to       │
│  coach@example.com               │
│                                  │
│  Click the link in the email     │
│  to continue.                    │
│                                  │
│  [Send again]   [Use a different email]│
└─────────────────────────────────┘
```

```tsx
function AuthPage() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await sendMagicLink(email);

    if (error) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setIsLoading(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <h1 className="text-white text-2xl font-bold">Check your email</h1>
          <p className="text-white/60 text-sm">
            We sent a sign-in link to <strong className="text-white">{email}</strong>
          </p>
          <p className="text-white/40 text-xs">Click the link in the email to continue.</p>
          <button onClick={() => setSubmitted(false)}
            className="text-white/50 text-sm hover:text-white underline">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Playbook</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to save and share plays</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-white/40"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#0a0f1a] font-semibold py-3 rounded hover:bg-white/90 disabled:opacity-50"
          >
            {isLoading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center">
          No password needed. We'll send a one-time sign-in link.
        </p>
      </div>
    </div>
  );
}
```

---

## 5. Auth Callback Handler

Route: `/auth/callback`

Supabase magic links redirect to this URL with a token in the hash fragment. This page handles the exchange and redirects the user to their intended destination.

```typescript
// /auth/callback route
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the token exchange automatically when the page loads
    // because the anon key client detects the hash fragment
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check for a return URL stored before sign-in
        const returnTo = sessionStorage.getItem('auth_return_to') ?? '/my-plays';
        sessionStorage.removeItem('auth_return_to');
        navigate(returnTo, { replace: true });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <p className="text-white/50 text-sm">Signing you in…</p>
    </div>
  );
}
```

---

## 6. Sign-In Modal (Inline, Non-Blocking)

For actions that require auth (save play, access My Plays), show a modal rather than navigating away. Store the intended action in sessionStorage so it can be completed after sign-in.

```tsx
function SignInModal({ isOpen, onClose, returnAction, playId }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  if (!isOpen) return null;

  async function handleSubmit() {
    // Store return intent
    if (returnAction === 'save_play' && playId) {
      sessionStorage.setItem('auth_return_to', `/moves/${playId}?action=save`);
    } else if (returnAction === 'my_plays') {
      sessionStorage.setItem('auth_return_to', '/my-plays');
    } else {
      sessionStorage.setItem('auth_return_to', '/my-plays');
    }

    await sendMagicLink(email);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] rounded-xl p-6 max-w-sm w-full space-y-4 border border-white/10">
        <h2 className="text-white text-lg font-semibold">Sign in to save this play</h2>
        {!sent ? (
          <>
            <p className="text-white/50 text-sm">Enter your email and we'll send a sign-in link.</p>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/30"
            />
            <div className="flex gap-2">
              <button onClick={handleSubmit}
                className="flex-1 bg-white text-[#0a0f1a] font-semibold py-2 rounded text-sm hover:bg-white/90">
                Send Link
              </button>
              <button onClick={onClose}
                className="px-4 py-2 border border-white/20 text-white/50 rounded text-sm hover:text-white">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-white/70 text-sm">Link sent to <strong className="text-white">{email}</strong></p>
            <p className="text-white/40 text-xs">Check your email and click the link to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Session Persistence

Supabase handles session persistence via localStorage automatically. The session survives browser restarts. No extra configuration needed.

The `useAuth` hook in Section 3 provides reactive session state across the entire app.

---

## 8. Protected Routes

Some routes require auth. Use a `ProtectedRoute` wrapper.

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    // Store intended destination
    sessionStorage.setItem('auth_return_to', location.pathname);
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Usage in router:
<Route path="/my-plays" element={<ProtectedRoute><MyPlaysPage /></ProtectedRoute>} />
<Route path="/team"     element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
```

---

## 9. Navbar Auth State

```tsx
function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center px-4 py-3 border-b border-white/10">
      <Link to="/" className="mr-8">
        <span className="text-white font-bold">Playbook</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-6 text-sm">
        <Link to="/moves"  className="text-white/60 hover:text-white">Moves</Link>
        <Link to="/editor" className="text-white/60 hover:text-white">Editor</Link>
        {user && <Link to="/my-plays" className="text-white/60 hover:text-white">My Plays</Link>}
        {user && <Link to="/team"     className="text-white/60 hover:text-white">Team</Link>}
        <Link to="/pricing"  className="text-white/60 hover:text-white">Pricing</Link>
        <Link to="/tutorial" className="text-white/60 hover:text-white">How to Use</Link>
      </div>

      <div className="ml-auto flex gap-2">
        {user ? (
          <>
            <Link to="/editor"
              className="hidden md:block px-3 py-1.5 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90">
              Create Play
            </Link>
            <button onClick={signOut}
              className="text-white/40 text-sm hover:text-white">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/auth"
              className="text-white/60 text-sm hover:text-white">
              Sign in
            </Link>
            <Link to="/editor"
              className="px-3 py-1.5 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90">
              Create Play
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

---

## 10. Share Link Generation

Public play URLs follow this format:

```
https://playbook.app/moves/{slug}
```

The slug is generated at save time (Module 01 `generate_play_slug` function). It is human-readable + random suffix:

```
out-the-back-option-2847361902
```

**Anonymous access:** The RLS policy in Module 01 allows SELECT on plays WHERE `published = true OR is_library_play = true`. No auth token is needed to fetch a published play by slug.

**Unpublishing:** Setting `published = false` makes the link return nothing (RLS blocks the read). The viewer page shows "This play is no longer available."

---

## 11. Email Configuration in Supabase

In Supabase dashboard → Authentication → Email Templates, customise the magic link email:

**Subject:** Sign in to Playbook

**Body:**
```
Hi,

Click the link below to sign in to Playbook.

{{.ConfirmationURL}}

This link expires in 1 hour.

If you didn't request this, you can ignore this email.

— Playbook
```

Disable email confirmations (not needed for magic link flow). Set link expiry to 1 hour.

---

## 12. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Email doesn't exist in system | Supabase creates a new user automatically (`shouldCreateUser: true`) |
| Magic link has expired | Supabase returns error. Show: "This link has expired. Request a new one." with link to `/auth` |
| Magic link already used | Supabase returns error. Show same message as expired link. |
| User opens magic link on different device | Supabase creates session on the new device. This is fine. |
| User signs in and has `auth_return_to` for a private play | Return them to the play after sign-in |
| Supabase auth service is down | Show: "Sign-in is temporarily unavailable. Try again in a moment." |
| Coach tries to access `/my-plays` without auth | Redirect to `/auth`, store return URL |
| User closes the sign-in modal before clicking the link | No problem — their link is still valid in email for 1 hour |

---

## 13. Build Notes for AI Agent

**What to build:**
- Supabase client setup (`src/lib/supabase.ts`)
- `useAuth` hook
- `sendMagicLink` and `signOut` helpers
- `/auth` page (sign-in form + sent confirmation)
- `/auth/callback` route (token exchange + redirect)
- `SignInModal` component (inline, non-blocking)
- `ProtectedRoute` wrapper
- `Navbar` component with auth state
- `sessionStorage` return-URL pattern

**Supabase config required:**
- Enable Email OTP / magic link in Supabase Authentication settings
- Set Site URL to the production URL
- Set Redirect URLs to include `{origin}/auth/callback`
- Disable email confirmations

**Acceptance criteria:**
- Unauthenticated user can browse library and view any published play
- Unauthenticated user visiting `/my-plays` is redirected to `/auth`
- Coach enters email, receives magic link, clicks it, is redirected to intended destination
- Session persists after browser restart
- `useAuth` returns `null` for anonymous users, `User` object for signed-in coaches
- Sign out clears session, navbar updates immediately
