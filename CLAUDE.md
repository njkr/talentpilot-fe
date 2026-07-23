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
- The shared upgrade modal (components/billing/upgrade-modal.tsx, state in stores/ui.store.ts) is
  mounted once in AppShell. Any code calls `useUiStore.getState().openUpgradeModal(details)` on
  INSUFFICIENT_CREDITS/PLAN_LIMIT_REACHED — don't build a per-feature upgrade dialog.

## Resumes (Sprint 3)

- Upload is 202→poll: POST returns status 'uploaded', then poll GET /resumes/:id via
  usePollUntil (hooks/use-poll-until.ts) until parsed|failed. usePollUntil now takes an `enabled`
  5th arg — pass false to skip polling a resume already known to be terminal (e.g. from a list).
- A resume stuck at uploaded/extracted 30s+ (measured from the resume's own createdAt, not local
  mount time) = worker likely down. Show a distinct "delayed" message, never an infinite spinner.
- Multipart uploads: never set Content-Type manually. lib/api/client.ts's `api.post` auto-detects
  a FormData body and unsets the default JSON Content-Type so the browser sets the multipart
  boundary itself — a manual `'Content-Type': 'multipart/form-data'` header breaks the upload
  server-side (no boundary param). Reset `input.value = ''` after reading a file so selecting the
  same file twice still fires a change event.
- Section `content` is polymorphic per sectionType. Confirmed real shapes (live + Postman, not
  guessed) live in features/resumes/resume.types.ts: experience→highlights, personal_info→links[],
  skills→string[], education→{degree,institution,field,startDate,endDate} (NOT `year`),
  certifications→{name,issuer,date}. `projects`/`languages` have never been observed populated —
  they render through a generic key/value fallback (SectionView's GenericContent) rather than a
  guessed shape; update resume.types.ts with the real shape the first time one is actually seen.
- Editing a section PATCHes and sets editedByUser:true (protects it from re-parse overwrite). Only
  `summary` has an inline editor — don't add an Edit affordance to a structured section without
  also building real field editing, or "Save" silently marks it edited with nothing changed.
- Delete-in-use returns 409 RESUME_IN_USE with blocking workspaces in details.workspaces — surface
  them (ResumeCardActions does this via a Modal, not a toast).
- Real upload error codes (from the backend's ErrorCode enum, not guessed): FILE_TOO_LARGE
  (details.maxMb), FILE_TYPE_UNSUPPORTED, FILE_UNREADABLE, FILE_CORRUPT, PLAN_LIMIT_REACHED.
  There is no INVALID_FILE_TYPE code.
- The drag-drop file input is generic: components/ui/file-dropzone.tsx. Both resume and JD upload
  compose it with their own mutation/error mapping — don't rebuild the drag/drop interaction per feature.

## Job descriptions (Sprint 4)

- Paste is INLINE — the POST response already carries status:'analyzed' + parsedData. NO polling
  for paste. Only the upload path may need usePollUntil (unconfirmed live — never actually
  observed non-'analyzed' — kept as a defensive fallback since upload shares the resume pipeline).
- There is NO "not a real job posting" error (no JD_ANALYSIS_FAILED code — that was a sprint-doc
  guess, doesn't exist). Confirmed live: pasting non-job text just returns status:'analyzed' with a
  gracefully degraded parse — position "Untitled position", empty requirements/skills/keywords/
  responsibilities arrays, seniority/remoteType literally "unknown" (a string, not null). Every
  card component must handle empty arrays and the literal "unknown" string, not just null/undefined.
  The only real paste-time error is JD_TOO_SHORT.
- Real JobDescription shape has several fields the sprint doc's guess omitted entirely at the top
  level (not just nested in parsedData): employmentType, location, salaryMin, salaryMax,
  salaryCurrency. See features/jobs/job.types.ts.
- The parsed view is READ-ONLY (unlike resume sections — JDs aren't user-edited). There's also no
  rename endpoint for job descriptions — JobActions is Delete-only, unlike ResumeCardActions.
- Requirements group by importance: required → preferred → nice_to_have. Reuse ImportanceBadge
  (components/ui/importance-badge.tsx, danger/primary/muted) — the same component is meant to
  reappear in the Sprint 6 keyword table.
- JobStatusBadge (analyzing/analyzed/failed) is separate from the shared workspace StatusBadge —
  their status vocabularies don't overlap enough to safely reuse one map.
- Position/company are optional hints; the analyzer extracts them from the text if omitted.
- Paste dedupe is invisible (content-hash) — navigating to the existing JD is correct, not an error.

## Workspace + the live pipeline (Sprint 5) — the most important screen

- SSE uses NAMED events (`event: snapshot`, `event: step.started`, ...) — `EventSource.onmessage`
  NEVER fires for any of them, only `addEventListener(name, ...)` per type. Confirmed live; this
  is fixed once in lib/sse.ts's `openRunStream`, which forwards `{type, data}` pairs for every
  known event name. Don't reinvent this per feature — features/workspaces/hooks/use-run-progress.ts
  is the only consumer and it should stay that way.
- The SSE `snapshot` event is a SUBSET of the full RunState (no workspaceId/currentStep/
  creditsCharged/creditsRefunded, and steps have no `error`). `GET /workspaces/runs/:runId` (the
  poll endpoint AND the retry response) returns the FULL shape. useRunProgress's reducer MERGES
  snapshots field-by-field (mergeSnapshot in use-run-progress.ts) rather than replacing state
  wholesale, specifically so an SSE-sourced snapshot can never wipe out richer data the priming
  poll fetch already established.
- The steps array is NOT pre-populated with all 12 as "pending" — the backend grows it as each
  step actually starts (confirmed live: a fresh run's first snapshot had 3-5 entries, not 12).
  PipelineTimeline renders against the fixed STEP_ORDER list (step-meta.ts) and falls back to
  'pending' for any name not yet in run.steps — never map over run.steps directly, or rows
  appear/reorder as the run progresses instead of staying in a stable layout.
- `step.started` carries a real, human-written `label` the poll endpoint doesn't have — stored on
  the step in reducer state and preferred over step-meta.ts's static default when present.
- `step.failed` has NO error message (just `step`, `willRetry`, `attempt`) — the actual per-step
  error text only comes from GET /workspaces/runs/:runId. RunFailed reads it from there, not from
  a live event.
- `run.failed`'s real shape is `{type, runId, status, failedSteps, refundedCredits}` — confirmed
  live, matches what the sprint doc guessed exactly. `run.completed`'s shape was never observed
  live (every real test run here hit the cover-letter fabrication guard) — handled defensively.
- `creditsRefunded` accumulates across repeated failed retries on the same run (observed 4 -> 7
  after a second failed cover-letter attempt) — always just render the current value, don't assume
  it only ever goes from 0 to some final number once.
- Idempotency-Key: ONE fresh id per logical Analyze click (`crypto.randomUUID()` — no `uuid`
  package dependency needed), generated at click time and passed INTO the mutation. Never generate
  it inside the mutationFn (that makes a new one on retry -> double charge). Retry does NOT need an
  Idempotency-Key (confirmed live) — it re-queues the same run by runId.
- Pre-check credits (21) before calling analyze -> upgrade modal, not a failed request.
- A step failing (e.g. research_company) doesn't necessarily fail the whole run — confirmed live,
  the pipeline kept going after a non-required step failed. Don't assume one failed step means the
  run stops; read `run.status` for that.

## ATS report & suggestions (Sprint 6)

- The report is available as soon as its underlying steps (score_ats, match_keywords, ...)
  complete, EVEN IF the overall run later fails on a different step (confirmed live: fetched a
  full real report from a run whose status was 'failed' because generate_cover_letter tripped the
  fabrication guard). Don't gate report access on `workspace.status === 'completed'` — this was a
  real bug caught in Sprint 6's own smoke test: app/(app)/workspaces/[id]/page.tsx originally only
  rendered WorkspaceView for status completed/partial, hiding a genuinely available, real report
  behind an "analyze again" prompt for every 'failed' workspace. Fixed to gate on
  `workspace.lastRunId` existing instead (any run ever attempted, regardless of outcome) — each
  tab's own query handles "not ready" individually via its own error code.
- If no analysis has produced a report yet at all, GET .../report returns 409 REPORT_NOT_READY
  (details: `{status}`) — ReportTab handles this specific code, not just "no data".
- Render `report.scoreBreakdown` AS AN ARRAY. Never hardcode component rows — confirmed live: a
  real report had exactly 6 components (no `education`), and explains why in a Caption rather than
  showing a silent gap. The flat `*Score` fields exist on AtsReport but the array is authoritative.
- Real AiSuggestion shape matches the sprint doc's guess exactly, EXCEPT: `newText` (never
  `oldText`) consistently arrives with literal wrapping quote characters baked into the string
  content itself — a backend generation artifact. SuggestionCard strips one layer of matching
  leading/trailing quotes before display (stripWrappingQuotes) rather than rendering it as-is.
- Suggestions are already fabrication-filtered server-side. Render them; don't re-validate.
  Surface that guarantee in the UI (the ShieldCheckIcon banner) — it's why users trust applying them.
- Apply is a BATCH -> ONE new resume version — confirmed live (`{version, applied, skipped}`,
  applying 1 of 7 pending suggestions correctly produced resume version 2). Reject's real response
  is `{rejected: number}`, not void, though nothing currently needs to read it.
- Workspace tabs fetch lazily via `enabled: active` on each tab's own query — there's no aggregate
  endpoint, so eager fetching would fire a request for every tab on mount regardless of which one
  is open.
