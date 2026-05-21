# PLAYBOOK — Module 09: Pricing & Paywall

**Product:** Playbook
**Module:** Pricing & Paywall
**Version:** 1.0
**Dependencies:** Module 07 (Auth), Module 08 (Team Dashboard), Module 01 (Data Schema)
**Agent task:** Build the pricing page, paywall enforcement, and Paddle.com payment integration.

---

## 1. User Story

**As a coach on the free plan**, I hit the 3-play limit and see an upgrade prompt. I click "Try Free for 14 Days", enter my details, and get immediate access to the Team plan.

**As a club admin**, I pay for the Club plan and get multiple team management and multiple coach logins.

---

## 2. Pricing Tiers

| Feature | Free | Team | Club |
|---|---|---|---|
| Price | £0 forever | £119/year | £369/year |
| Season Pass equivalent | — | Pay 8 months | Pay 8 months |
| Off-season months free | — | Yes (4 months) | Yes (4 months) |
| Play library (view) | ✅ | ✅ | ✅ |
| Play editor | ✅ | ✅ | ✅ |
| Save own plays | Max 3 | Unlimited | Unlimited |
| Share plays (link) | ✅ | ✅ | ✅ |
| Team dashboard | ❌ | ✅ | ✅ |
| Publish to team playbook | Max 3 | Unlimited | Unlimited |
| Unlimited players | ✅ | ✅ | ✅ |
| Multiple coach accounts | ❌ | ❌ | ✅ |
| Multiple teams | ❌ | 1 team | Unlimited |
| Priority support | ❌ | ❌ | ✅ |
| 14-day free trial | — | ✅ | ✅ |
| No card for trial | — | ✅ | ✅ |

---

## 3. Season Pass Concept

The Season Pass is a positioning and pricing concept, not a separate Paddle product. It is the yearly subscription framed as "pay for 8 months (the rugby season), keep 12 (off-season free)."

This means:
- Yearly subscription = £119 or £369
- Monthly equivalent shown = £9.92/mo or £30.75/mo
- Messaging: "Pay 8, keep 12. Off-season included free."

In Paddle, this is simply an annual subscription product.

---

## 4. Pricing Page

Route: `/pricing`

```
┌────────────────────────────────────────────────────────────────────────┐
│  PRICING                                                                │
│                                                                         │
│  BUILT FOR TEAMS. PRICED FOR A RUGBY SEASON.                            │
│  Unlimited players, shared playbook, full library.                      │
│                                                                         │
│  [Monthly] [Season Pass — pay 8, keep 12] ← toggle (Season Pass default)│
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  FREE            │  │  TEAM  ★          │  │  CLUB                │ │
│  │  £0/forever      │  │  £119/year        │  │  £369/year           │ │
│  │  No card needed  │  │  £9.92/mo         │  │  £30.75/mo           │ │
│  │                  │  │  Off-season free  │  │  Off-season free     │ │
│  │  • Library view  │  │  • Everything in  │  │  • Everything in     │ │
│  │  • Editor        │  │    Free           │  │    Team              │ │
│  │  • Save 3 plays  │  │  • 1 team         │  │  • Unlimited teams   │ │
│  │  • Share links   │  │  • Unlimited saves│  │  • Multi-coach       │ │
│  │                  │  │  • Team dashboard │  │  • Priority support  │ │
│  │  [Start Free]    │  │  [Try 14 Days Free│  │  [Try 14 Days Free]  │ │
│  │                  │  │   No card needed] │  │                      │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
│                                                                         │
│  Currency: [$ USD][£ GBP][€ EUR][R ZAR][A$ AUD][NZ$ NZD]              │
│                                                                         │
│  No contracts. Cancel anytime. Questions? hello@playbook.app            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Currency Support

Show prices in multiple currencies. This is a display-only feature — Paddle handles actual currency conversion.

```typescript
const CURRENCIES = [
  { code: 'GBP', symbol: '£', teamPrice: 119,  clubPrice: 369  },
  { code: 'USD', symbol: '$', teamPrice: 149,  clubPrice: 459  },
  { code: 'EUR', symbol: '€', teamPrice: 129,  clubPrice: 399  },
  { code: 'ZAR', symbol: 'R', teamPrice: 2999, clubPrice: 8999 },
  { code: 'AUD', symbol: 'A$', teamPrice: 219, clubPrice: 679  },
  { code: 'NZD', symbol: 'NZ$', teamPrice: 239, clubPrice: 749 },
];

// Auto-detect from browser locale, default GBP
function detectDefaultCurrency(): string {
  const locale = navigator.language ?? 'en-GB';
  if (locale.includes('AU')) return 'AUD';
  if (locale.includes('NZ')) return 'NZD';
  if (locale.includes('ZA')) return 'ZAR';
  if (locale.startsWith('en-US') || locale.includes('US')) return 'USD';
  // Default EU locales
  const euLocales = ['de', 'fr', 'es', 'it', 'nl', 'pl', 'pt'];
  if (euLocales.some(l => locale.startsWith(l))) return 'EUR';
  return 'GBP';
}
```

---

## 6. Paddle Integration

Playbook uses [Paddle.com](https://paddle.com) as Merchant of Record. Paddle handles:
- Payment processing
- VAT / sales tax calculation
- Subscriptions and billing
- Refunds
- Receipts

### Paddle Product Setup (in Paddle dashboard)

Create two products:
1. **Playbook Team** — annual subscription, £119/year
2. **Playbook Club** — annual subscription, £369/year

Each product has a 14-day free trial configured in Paddle.

### Frontend Integration

Use Paddle.js (v2 — Paddle Billing).

```html
<!-- In index.html -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
```

```typescript
// paddle.ts
declare global {
  interface Window {
    Paddle: any;
  }
}

export function initPaddle() {
  window.Paddle.Environment.set(
    import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
  );
  window.Paddle.Initialize({
    token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
  });
}

// Open checkout overlay
export function openCheckout(priceId: string, userEmail?: string) {
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: userEmail ? { email: userEmail } : undefined,
    settings: {
      theme: 'dark',
      successUrl: `${window.location.origin}/team?upgraded=true`,
    },
  });
}
```

### Environment Variables

```
VITE_PADDLE_CLIENT_TOKEN=live_xxx
VITE_PADDLE_ENVIRONMENT=production
VITE_PADDLE_TEAM_PRICE_ID=pri_xxx
VITE_PADDLE_CLUB_PRICE_ID=pri_xxx
```

---

## 7. Post-Purchase: Webhook Handler

Paddle sends webhooks when a subscription is created or cancelled. Set up a Supabase Edge Function to handle these.

```typescript
// supabase/functions/paddle-webhook/index.ts

import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const payload = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify Paddle webhook signature
  // See Paddle docs: https://developer.paddle.com/webhooks/signature-verification

  switch (payload.event_type) {
    case 'subscription.created':
    case 'subscription.activated': {
      const { customer_email, items, current_billing_period } = payload.data;
      const priceId = items[0]?.price?.id;
      const plan = priceId === Deno.env.get('PADDLE_TEAM_PRICE_ID') ? 'team' : 'club';

      // Find team by coach email
      const { data: user } = await supabase.auth.admin.getUserByEmail(customer_email);
      if (!user?.user) break;

      const { data: teamCoach } = await supabase
        .from('team_coaches')
        .select('team_id')
        .eq('user_id', user.user.id)
        .eq('role', 'owner')
        .single();

      if (!teamCoach) break;

      await supabase.from('teams').update({
        plan,
        plan_expires_at: current_billing_period?.ends_at,
        paddle_subscription_id: payload.data.id,
        paddle_customer_id: payload.data.customer_id,
      }).eq('id', teamCoach.team_id);
      break;
    }

    case 'subscription.cancelled': {
      // Downgrade to free
      const { data: subscription } = payload;
      await supabase.from('teams').update({
        plan: 'free',
        plan_expires_at: subscription.scheduled_change?.effective_at ?? null,
      }).eq('paddle_subscription_id', subscription.id);
      break;
    }
  }

  return new Response('OK', { status: 200 });
});
```

---

## 8. Paywall Enforcement

Paywall is enforced at the application layer (NOT database layer).

### Play Save Limit (Free)

See Module 05 (Editor) — checked before save.

### Team Dashboard Access (Paid)

```typescript
// In TeamDashboard component
const plan = team?.plan ?? 'free';
const isUpgraded = plan === 'team' || plan === 'club';

if (!isUpgraded && !isCreatingTeam) {
  // Show locked team features with upgrade CTAs
}
```

### Upgrade Prompt Component

Used across the app whenever a paywall is hit:

```tsx
function UpgradePrompt({ feature }: { feature: 'save_plays' | 'team_playbook' | 'multiple_teams' }) {
  const messages = {
    save_plays:      "You've saved 3 plays (free limit). Upgrade to Team for unlimited saves.",
    team_playbook:   "You've published 3 plays to your team (free limit). Upgrade for unlimited.",
    multiple_teams:  "Create multiple teams with the Club plan.",
  };

  return (
    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 space-y-3">
      <p className="text-yellow-300 text-sm">{messages[feature]}</p>
      <Link to="/pricing"
        className="inline-block px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded hover:bg-yellow-400">
        View Plans
      </Link>
    </div>
  );
}
```

---

## 9. Post-Upgrade Redirect

After successful Paddle checkout, the user is redirected to `/team?upgraded=true`.

```typescript
// In TeamDashboard
const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('upgraded') === 'true') {
    setShowUpgradeSuccess(true);
    // Remove the query param
    navigate('/team', { replace: true });
  }
}, []);
```

Show a success banner: "Welcome to the Team plan! You now have unlimited plays and your team playbook."

---

## 10. 14-Day Free Trial

The trial is handled by Paddle (configured in the product). The checkout CTA says "Try 14 Days Free — No card required."

During the trial, the team's `plan` is set to the trial plan (same as activated plan). After trial ends without payment, Paddle sends a `subscription.cancelled` event and the team reverts to `free`.

---

## 11. Pricing Page Component

```tsx
function PricingPage() {
  const [currency, setCurrency] = useState(detectDefaultCurrency);
  const currencyData = CURRENCIES.find(c => c.code === currency)!;
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">PRICING</p>
          <h1 className="text-4xl font-bold mb-3">Built for Teams. Priced for a Rugby Season.</h1>
          <p className="text-white/50 text-lg">
            Unlimited players, shared playbook, full library.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <FreePlanCard user={user} />
          <TeamPlanCard currency={currencyData} user={user} />
          <ClubPlanCard currency={currencyData} user={user} />
        </div>

        {/* Currency selector */}
        <div className="flex justify-center gap-2 flex-wrap">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`px-3 py-1 rounded text-sm
                ${currency === c.code ? 'text-white border border-white/30' : 'text-white/30 hover:text-white'}`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          No contracts. Cancel anytime.{' '}
          <a href="mailto:hello@playbook.app" className="hover:text-white underline">
            Questions?
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 12. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Paddle checkout fails | User stays on pricing page. No plan change. Paddle shows its own error in overlay. |
| Webhook arrives but user has no team | Create the plan record anyway — team will pick it up on creation |
| Plan expires and user had team plays > 3 | Do NOT remove plays. Only block new additions. Show "plan expired" banner. |
| Coach cancels mid-trial | Paddle handles cancellation. Webhook downgrades to free at period end. |
| User upgrades but team plan hasn't refreshed | Poll team plan on `/team?upgraded=true` every 5s for 30s, then show "Your plan is being activated — check back shortly." |
| Multiple tabs open | Session-based plan cache needs to be refreshed on focus |
| Paddle sandbox in dev | Set `VITE_PADDLE_ENVIRONMENT=sandbox` and use sandbox price IDs |

---

## 13. Build Notes for AI Agent

**What to build:**
- `/pricing` route and `PricingPage` component
- Plan card components (Free, Team, Club)
- Currency selector
- `initPaddle` and `openCheckout` Paddle.js helpers
- Supabase Edge Function for Paddle webhooks (`paddle-webhook`)
- `UpgradePrompt` component (used across editor, team dashboard)
- Post-upgrade success banner
- Plan enforcement logic in Team Dashboard (Module 08)

**Environment setup:**
```
VITE_PADDLE_CLIENT_TOKEN=...
VITE_PADDLE_ENVIRONMENT=sandbox  (dev) / production (live)
VITE_PADDLE_TEAM_PRICE_ID=...
VITE_PADDLE_CLUB_PRICE_ID=...
```

**Paddle account setup (manual, not automated):**
1. Create Paddle account at paddle.com
2. Create two products (Team annual, Club annual) with 14-day trial
3. Configure webhook URL: `{supabase-project-url}/functions/v1/paddle-webhook`
4. Copy price IDs to env vars

**Acceptance criteria:**
- Pricing page renders at `/pricing` without auth
- Team plan CTA opens Paddle checkout overlay
- After successful test purchase (sandbox), webhook updates `teams.plan`
- Free user sees upgrade prompt when saving 4th play
- Upgrade prompt links to `/pricing`
- Post-purchase redirect shows success banner
