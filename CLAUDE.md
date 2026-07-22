## TalentPilot Frontend — non-negotiables

- Backend is DONE. Response shapes are in docs/API-Full-Documentation.txt — render those exact shapes.
  Postman collection: docs/TalentPilot-API.postman_collection.json, docs/TalentPilot-API.postman_environment.json.
  Never invent a field the API doesn't return.
- Errors: switch on error.code (closed enum), NEVER on error.message. Map lives in lib/error-actions.ts.
- SSE: mint a stream-ticket, then open EventSource with ?ticket=. EventSource CANNOT send headers.
  Always keep the GET /runs/:id poll as fallback. The stream sends `snapshot` first.
- 202→poll: analyze and document generation return queued/runId, not results. Poll or stream to completion.
  `stale` document = treat as "not ready, regenerate".
- Server state → React Query only. Zustand → client/UI state only. Never store API data in Zustand.
- Access token in memory only. Never localStorage. Refresh is an httpOnly cookie the browser carries.
- Design tokens only — no raw hex, no arbitrary spacing. rounded-md/lg/xl, shadow-sm/md only.
- Radix UI primitives (unstyled, accessible) painted with Tailwind tokens for Dialog/Drawer/Menu/
  Popover/Tooltip/Select/Checkbox/Tabs/Toast/Avatar — this is what components/ui is built on. Don't
  hand-roll a Select/Dialog/Tooltip and don't reach for MUI; MUI isn't installed. If a future sprint
  genuinely needs a DatePicker, discuss before adding a dependency for it.

## Sprint 0 outputs are load-bearing — do not bypass them

- All network calls go through lib/api/client.ts (the `api` object). Never call axios/fetch directly
  in a feature.
- All errors are ApiError (lib/api/error.ts). Switch on error.code via lib/error-actions.ts.
- UI primitives live in components/ui, built on Radix + the @theme tokens in app/globals.css
  (Tailwind v4 CSS-first config — there is no tailwind.config.ts).
- SSE → lib/sse.ts (ticket then EventSource). 202→poll → hooks/use-poll-until.ts. Don't reinvent either.
- No src/ directory — the project uses a flat root layout (app/, components/, lib/, stores/, hooks/,
  providers/, features/), matching the existing tsconfig `@/*` → `./*` alias.
- The API base URL lives ONLY in NEXT_PUBLIC_API_URL (.env.local). Nothing else hardcodes the port.
- The dev server is pinned to port 3001 (`npm run dev` → `next dev -p 3001`) so the frontend origin is
  stable. The backend's CORS allowlist must include `http://localhost:3001` — if it doesn't, requests
  with credentials will fail in-browser (blocked by the browser, not a backend error) while still
  succeeding via curl, since curl doesn't enforce CORS. Confirmed 2026-07-22: the backend was allowing
  only `http://localhost:5173` (a Vite default, not this project's port) — that's a backend-side config
  fix, not something to work around from here.

## Auth (Sprint 1)

- The bootstrap (providers/auth-bootstrap.tsx) owns the 'loading' state and shows a splash. Guards
  act ONLY on 'anon'/'authed', never 'loading'. Never redirect on loading — that flashes /login on
  every reload.
- Two guards, one in each direction: components/auth/require-auth.tsx keeps anonymous users off the
  (app) group; components/auth/redirect-if-authed.tsx (wraps the (auth) layout) keeps an already
  authed+verified user off login/register/forgot/reset — bounces them to /dashboard instead. It does
  NOT fire for authed-but-unverified, since verify-email lives in the same (auth) group and is
  reached mid-flow before a session even exists.
- lib/api/client.ts's hard-redirect on TOKEN_INVALID/TOKEN_REUSE_DETECTED only fires when the failing
  request carried a bearer token — the bootstrap's own token-less /auth/refresh call must be able to
  fail silently (anonymous visitor, no cookie) without forcing a redirect loop on the page it's on.
- Login errors: ALWAYS one generic message ("Email or password is incorrect"). The backend makes
  unknown-email and wrong-password identical on purpose. Never write UI copy that distinguishes them.
- Forgot-password ALWAYS shows "check your email", even for unknown emails. Backend always 204.
- Access token: memory only (stores/auth.store.ts). Refresh: httpOnly cookie, handled by the API
  client. Screens never touch tokens.
- Reset password forces a fresh login (old session is dead server-side).
- Auth API calls live in features/auth/auth.api.ts, wrapped by React Query hooks in
  features/auth/auth.hooks.ts. Screens call the hooks, never `api` directly.

## App shell & dashboard (Sprint 2)

- The dashboard is ONE call: GET /dashboard (batched, server-cached 30s). Never fan out into
  separate credits/workspaces/counts requests.
- Real GET /dashboard shape (confirmed live, NOT what an API-doc-only guess would produce): flat —
  `creditBalance`, `plan {key,name,status,monthlyCredits}` (no `plan.limits`), `resumes
  {count,limit}`, `workspaces {total,completed,processing,failed,recent}` (no workspaces limit
  field at all), `unreadNotifications`. See features/dashboard/dashboard.api.ts.
- Real Notification shape: `readAt: string | null`, NOT a `read` boolean. `type` uses the same
  dot-notation as SSE pipeline events (`run.completed`, `run.failed`). There is no `deepLink`
  field — build the link from `data.workspaceId` yourself.
- Nav is defined once in components/layout/nav-items.ts. Add routes there, not inline in the sidebar.
- Active nav = pathname.startsWith(href + '/') so detail pages keep the parent highlighted.
- Notifications: poll the unread COUNT (cheap); fetch the LIST only when the popover opens
  (enabled:false + refetch()).
- Credit balance is React Query key ['credits']; credit-spending mutations invalidate it to update
  the topbar.
- Reuse StatusBadge (components/ui/status-badge.tsx) for every workspace/run status across the app.
- Mobile drawer reuses Radix Dialog (focus-trap/escape/scroll-lock free). No separate drawer lib.
