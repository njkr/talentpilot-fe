## TalentPilot Frontend — non-negotiables

- Backend is DONE. Response shapes are in docs/API-Full-Documentation.txt — render those exact shapes.
  Postman collection: docs/TalentPilot-API.postman_collection.json, docs/TalentPilot-API.postman_environment.json.
  Never invent a field the API doesn't return.
- Errors: switch on error.code (closed enum), NEVER on error.message. `lib/error-actions.ts`'s
  `errorActions`/`actionFor` map exists for this but is actually dead code — grepped the repo
  2026-07-27 and nothing calls it. Every mutation handles `error.code` locally in its own `onError`
  instead; that's the real, established pattern to follow, not the unused map.
- SSE: mint a stream-ticket, then open EventSource with ?ticket=. EventSource CANNOT send headers.
  Always keep the GET /runs/:id poll as fallback. The stream sends `snapshot` first.
- 202→poll: analyze and document generation return queued/runId, not results. Poll or stream to completion.
  `stale` document = treat as "not ready, regenerate".
- Server state → React Query only. Zustand → client/UI state only. Never store API data in Zustand.
- Access token in memory only. Never localStorage. Refresh is an httpOnly cookie the browser carries.
- Design tokens only — no raw hex, no arbitrary spacing. rounded-md/lg/xl, shadow-sm/md only.
- Buttons carry a relevant leading Heroicon (24/outline, matching the icon library already used
  everywhere else — CLAUDE.md's Sprint 11 polish pass grep-audited the whole repo for non-Heroicons
  icons and found none). `components/ui/button.tsx`'s `Button` takes an `icon` prop for this
  (`<Button icon={PlusIcon}>New plan</Button>`) — while `loading` is true the Spinner takes that
  same leading slot instead, so a button never shows both. Works with `asChild` too (the icon
  renders as a sibling to the Slotted child, same mechanism the loading spinner already used).
  Applied 2026-07-27 across every billing/admin surface (Sprint 13/14); the rest of the app's
  ~90 remaining `<Button>` usages (resumes, jobs, workspaces, versions, documents, auth, settings)
  predate this convention and haven't been retrofitted yet — apply it to any of those the next time
  you're genuinely touching that file, rather than treating an untouched screen as broken.
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
- The parsed view is READ-ONLY (unlike resume sections — JDs aren't user-edited), EXCEPT for
  company/position correction via PATCH /job-descriptions/:id (added 2026-07-24 — see
  "Missing fields" below). JobActions itself is still Delete-only; the correction flow lives in
  MissingFieldsBanner, not JobActions.
- Requirements group by importance: required → preferred → nice_to_have. Reuse ImportanceBadge
  (components/ui/importance-badge.tsx, danger/primary/muted) — the same component is meant to
  reappear in the Sprint 6 keyword table.
- JobStatusBadge (analyzing/analyzed/failed) is separate from the shared workspace StatusBadge —
  their status vocabularies don't overlap enough to safely reuse one map.
- Position/company are optional hints; the analyzer extracts them from the text if omitted.
- Paste dedupe is invisible (content-hash) — navigating to the existing JD is correct, not an error.

### Missing fields (added 2026-07-24)

- Every JD-returning endpoint now includes `missingFields: ("company" | "position")[]`, populated
  once `status === 'analyzed'` (ignore it before that). Confirmed live exactly as specced.
- `position` is NEVER actually null — an unresolved position comes back as the literal sentinel
  string `"Untitled position"`. `jd.position ?? fallback` never fires against real data. Always use
  `displayPosition(jd)` (features/jobs/job.types.ts), which checks the sentinel directly — this
  bug predated this feature and was only caught while wiring it in.
- `PATCH /job-descriptions/:id` (`{company?, position?}`) is a direct field correction, NOT a
  re-parse — confirmed live: `parsedData` is untouched, only the top-level fields change. Omit a
  field to leave it alone (empty string is rejected server-side, not treated as "clear it").
- This is a SOFT nudge, not a hard block — the pipeline already handles a missing company/position
  gracefully (skips research_company, avoids fabricating a company in the cover letter, completes
  as 'partial' instead of 'completed'). MissingFieldsBanner (on the JD detail page, via JobHeader)
  lets the user fix it or explicitly skip; JobPicker (workspace creation) shows a lighter warning
  indicator for the same reason, without blocking workspace creation or analysis.

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

## Versions & cover letter (Sprint 7)

- Confirmed live (backend Finding 3, reproduced exactly): GET /resumes/:id/versions returns ONLY
  explicit apply/restore events. A resume with a real applied-suggestion v2 still omitted v1
  entirely from the list. ALWAYS synthesize a "v1 — Original upload" entry from resume.createdAt
  when v1 is absent (useVersions in features/versions/hooks). Empty is NOT an error state.
- Real ResumeVersion shape omits `resumeId`/`workspaceId` that a first guess might include — only
  `{id, version, label, changeSummary, createdBy, suggestionsApplied, createdAt}` come back. There
  is no `resume.currentVersion` field either — the current version is always
  `Math.max(...versions.map(v => v.version))` under the forward-only model.
- Restore is FORWARD-ONLY — confirmed live: restoring v1 while on v2 created v3, not a reversion.
  Real restore response is `{version: number}` (the NEW version number). RestoreConfirm explains
  this before restoring (nothing is deleted) — wire it in as an actual confirmation step, don't
  restore directly on click.
- Diff shape confirmed live exactly as guessed (`{sectionType, changed, changes: [{value, added?,
  removed?, count}]}`). One real consequence of Sprint 6's `newText` quote-wrapping quirk: applying
  that suggestion actually saved literal `"` characters into the resume's stored skills text, and
  the diff view correctly (and appropriately) shows them as part of the real added content — don't
  strip quotes in the diff view the way SuggestionCard does for the pre-apply preview; that would
  hide what's genuinely stored now.
- Cover letter GET returns plain 404 NOT_FOUND when nothing's generated yet (not a distinct "not
  ready" code) — `if (!letter)` already handles this fine via React Query's data staying undefined.
- Real regenerate failure code is `AI_OUTPUT_INVALID` — NOT `INVALID_OUTPUT` or `AI_INVALID_OUTPUT`,
  both plausible-looking guesses that don't exist. Confirmed live 3/3 real attempts in this account
  hit the fabrication guard with this exact code, and confirmed the credit balance was genuinely
  unchanged after — always tell the user they weren't charged on this specific error.
- CoverLetter's success shape is now confirmed live (2026-07-24, a later regenerate attempt on the
  same workspace finally cleared the fabrication guard) — matches the sprint doc's guess exactly.

## Career prep tabs (Sprint 8)

- These four tabs render HONEST UNCERTAINTY. Do not treat any of it as an error:
  - company `confidence: 'low'` = little public footprint → show the honest banner, keep the sources
  - learning `url: null` = the model wouldn't vouch for a link → render the title as searchable text
  - salary `isEstimate` is ALWAYS true → always label it an estimate, never a quote
- ⚠️ Confirmed live: a real learning-roadmap item had `url` as the LITERAL STRING `"null"` (four
  characters), not a JSON null. `Boolean("null")` is `true`, so a naive `item.url ? <a> : ...` truthy
  check renders a broken `href="null"` link — exactly the failure mode this field exists to
  prevent. Always go through `hasRealUrl()` (features/learning/learning.types.ts), never a bare
  truthy check on `url`.
- `research_company` and `estimate_salary` are OPTIONAL pipeline steps. Their absence means a
  partial run, not a broken app → "unavailable, retry the run", never a crash. Both hooks set
  `retry: false` since a missing insight/estimate isn't a transient failure worth retrying.
- Interview: model answer hidden until revealed (reading it first defeats practice). Submit
  disabled under 20 chars so nobody burns a credit on a non-answer. Score is an inline coach meter,
  not pass/fail. The answer-submission response shape (`InterviewQuestion` with feedback populated)
  is UNCONFIRMED — every real attempt hit INSUFFICIENT_CREDITS (balance exhausted by earlier
  sprints' live testing) before a successful submission could be observed.
- Salary currency: always `Intl.NumberFormat` with the row's own `currency` code. Never hardcode $.
- `FilterChip` (components/ui/filter-chip.tsx) is shared — extracted here after the same pattern
  was independently built twice (Sprint 6's keyword table, this sprint's interview type filter).
  Reuse it rather than building a third local copy.
- Same lazy tab pattern as Sprint 6: `enabled: active`.

## Documents & downloads (Sprint 9)

- Real `type` enum (confirmed live via `VALIDATION_FAILED.fields.type` on a bad value): `resume_pdf
  | resume_docx | cover_letter_pdf | cover_letter_docx | full_report_pdf` — NOT `report_pdf`, which
  the sprint doc's prose implied but never actually spelled out as a literal string.
  DOCUMENT_LABELS/DOCUMENT_TYPES live in features/documents/document.types.ts.
- Real GeneratedDocument shape confirmed live + matches Postman exactly: `{id, workspaceId, type,
  filename, status, fileSize, error, createdAt, updatedAt}`. `status` is `queued | generating |
  ready | stale | failed`.
- Generation completes in ~1-4s in this dev environment (Puppeteer/docx rendering is fast at this
  scale) — polling at 1.5s intervals (features/documents/hooks/use-documents.ts) feels near-instant
  in practice; don't assume production latency will match.
- `stale` (CLAUDE.md's top-level rule) is enforced in the download menu itself: a stale document
  never offers a direct "Download" action, only "Regenerate" — see download-menu.tsx's `Row`.
- Download endpoint returns a short-lived signed URL (`{url, filename}`) — confirmed live it works
  against MinIO in dev exactly like the doc's S3 description. Triggered via a programmatic `<a
  download>` click (features/documents/hooks/use-documents.ts's `triggerBrowserDownload`), not
  `window.open`, so the browser's own save-file UX applies.
- The list endpoint (`GET .../documents`) is fetched eagerly whenever DownloadMenu mounts, NOT
  gated behind `enabled: active` the way the heavier Sprint 6/8 workspace tabs are — it's one cheap
  row per document ever generated, not a per-tab heavy artifact fetch, so the lazy-tab pattern's
  rationale doesn't apply here.
- DownloadMenu only tracks ONE in-flight generation at a time (a single `inFlight` slot, not one
  poller per type) — deliberate scope decision, since a user only ever clicks one button at once
  from this UI.
- `DOCUMENT_NOT_READY` (409, details `{status}`) is the real error code for calling download before
  `ready` — already known from the backend's ErrorCode enum before this sprint even started.

## Admin panel (separate surface)

- Lives in `app/(admin)/admin/...` (route group `(admin)` + a literal `admin/` segment, so URLs
  are `/admin`, `/admin/costs`, etc.) with its own `AdminGuard`, `AdminSidebar`, `AdminTopbar` —
  deliberately plainer/denser than the user app, per the sprint doc's intent. `features/admin/`
  holds all the feature code.
- DOUBLE GATE, confirmed live exactly as documented: `role: 'admin'` alone still 403s — the
  account's email must ALSO be on the backend's `ADMIN_ALLOWED_EMAILS` allowlist. Confirmed live
  by watching the same account go from `role:user` (403) → `role:admin` but not yet allowlisted
  (still 403, identical response) → allowlisted (200). `AdminGuard` is the first gate only (role
  check, client-side, UX). `AdminQueryBoundary` handles the second gate on every admin query.
- ⚠️ The 403 for the email-allowlist gate reuses the generic `INTERNAL_ERROR` code (confirmed live)
  — NOT a distinct code, and NOT `FORBIDDEN` as the Postman collection's saved example claims
  (live wins over Postman again, same as Sprint 11's notification-preferences conflict).
  `AdminQueryBoundary` therefore keys off `error.status === 403`, not `error.code` — a deliberate,
  documented exception to CLAUDE.md's usual "switch on code" rule, justified because the backend
  doesn't expose a distinct code for this case.
- Step-level and run-level status use `RunStatus`/`StepStatus` (features/workspaces/workspace.types.ts),
  NOT `WorkspaceStatus` — confirmed live a real run had `skipped` steps (attempt: 0). The shared
  `StatusBadge` component's map doesn't cover `running`/`pending`/`skipped`, so the admin run
  inspector uses its own local `RunStatusPill` instead, same reasoning as the existing
  `JobStatusBadge`/`ResumeStatusBadge` split.
- Real `AdminStep` shape has NO `durationMs` field — duration is computed client-side from
  `startedAt`/`finishedAt`, same pattern as the run-level duration. Real `outputRef` field
  (added Sprint 7) IS present and is shown under each step name — it's what lets an operator jump
  from a step to what it produced (e.g. `cover_letters:7a5aadfd-…`).
- ⚠️ `PromptVersion` real shape is RICHER than a Postman-only guess suggested: `model`, `createdAt`,
  AND the full `systemTemplate` text are all real and confirmed live — an earlier pass wrongly
  concluded `systemTemplate` didn't exist because Postman's saved example was a more abbreviated
  illustrative snippet than the real response. Lesson: an example NOT showing a field is much
  weaker evidence of absence than an example showing a DIFFERENT field name in its place — don't
  treat the two the same way. The real, full prompt text is shown collapsed by default (`<details>`,
  same pattern as the dead-letter queue's job-data disclosure) since some are 10+ lines.
- All 9 of the sprint doc's guessed prompt keys are real (`resume_parsing, jd_analysis,
  ats_grading, resume_optimization, cover_letter, interview, learning_path, company_synthesis,
  salary`) — confirmed live, though `resume_parsing`/`interview`/`learning_path` currently have
  zero versions in this environment (200 with an empty array, not an error). `cover_letter` has 4
  real versions with genuinely detailed changeNotes documenting real prompt-engineering bug fixes
  (e.g. the model signing cover letters with a literal "[Your Name]" despite instructions not to).
- Activating a prompt version was tested live end-to-end (activated v3, confirmed the response and
  the version list flipped, then re-activated v4 to restore the original live version before
  finishing) — the real activate body is `{version: number}`; the sprint doc's own mutation
  snippet sent an empty body, a real bug in the doc's own code independent of any shape confusion.
- `AdminCosts` real shape confirmed live exactly matching Postman: `{since, byFeature: [{feature,
  costUsd, calls}], byDay: [{day, costUsd}], topUsers: [{userId, costUsd}]}` — all `costUsd`/`calls`
  values are STRINGS, converted once in the chart/list components, not at the API layer. There is
  NO "failure rate by feature" data anywhere in the real response — the sprint doc's panel for it
  isn't built; `byFeature` is shown instead (real data) as a simple single-hue magnitude bar list,
  per the dataviz skill's "sometimes the answer isn't a categorical chart" guidance.
- The daily-spend chart uses `recharts` (newly added dependency — this app had zero charting
  libraries before) as a single-series area chart. Colors are the real design tokens' hex values
  copied verbatim from `app/globals.css` (`#2563eb` primary, `#e5e7eb` border, `#6b7280`
  ink-secondary) — recharts props take raw color values, not Tailwind classes, so this is the one
  place CLAUDE.md's "no raw hex" rule doesn't apply, per the sprint doc's own note.
- `DeadLetterJob` real shape is the raw BullMQ job object (`attemptsMade`, `failedReason`,
  `timestamp` as raw Unix ms) — confirmed live exactly matching Postman, NOT the sprint doc's
  guessed `attempts`/`failedAt`/`reason` field names. The 4 real queue names (confirmed via the
  API doc's own architecture prose, cross-referencing two separate sections) are `pipeline,
  resumes, emails, documents` — matches the sprint doc's own guess.
- `AuditEntry` real shape confirmed live: `{id, userId, actorType, action, resourceType,
  resourceId, ip, userAgent, metadata, createdAt}` — `resourceId` and `ip` are both real (not just
  documented-but-unverified). Cursor-paginated (`nextCursor`/`hasMore`), same pattern as Sprint 10's
  credit history.
- A `role: 'admin'` user gets an "Admin" link in the avatar menu (components/layout/avatar-menu.tsx)
  as a discoverability affordance only — AdminGuard/AdminQueryBoundary are the real checks, so
  showing the link to a role-admin-but-not-yet-allowlisted user is fine.


## Billing & credits (Sprint 10)

- ⚠️ `GET /plans` DOES NOT EXIST — confirmed three independent ways: live 404, absent from the
  44-endpoint API reference in docs/API-Full-Documentation.txt, absent from the Postman collection.
  There is no catalog endpoint for prices/features of plans other than the caller's own current
  one. The billing page therefore does NOT show a multi-plan comparison grid — CLAUDE.md's "never
  invent a field the API doesn't return" extends to never inventing this endpoint's data either.
  Upgrade buttons (features/payments/components/upgrade-plans.tsx) call checkout directly by plan
  key with zero fabricated pricing/feature copy; Stripe's own Checkout page is the only real source
  shown for what a plan costs, immediately after clicking "Upgrade to Pro/Ultimate".
- Real `PlanKey` set, confirmed via the checkout endpoint's own Postman description ("`planKey` is
  `pro` or `ultimate`, never `free`"): `free | pro | ultimate`. Checkout body is JUST `{planKey}` —
  NO `interval` field (no monthly/yearly choice exists in this backend at all; a sprint doc
  assuming a billing-interval toggle would be building a control for something that isn't there).
- Real `POST /payments/checkout` behavior: 201 `{url}` on success; 404 `NOT_FOUND` ("Plan \"pro\" is
  not available for checkout.") if that plan has no Stripe price configured in this environment;
  400 `IDEMPOTENCY_KEY_REQUIRED` if the header is missing. Idempotency-Key: one fresh
  `crypto.randomUUID()` per logical upgrade click, generated at click time — same rule as analyze
  (Sprint 5).
- Real `GET /payments/subscription` shape (confirmed live + Postman, richer than a bare Stripe
  mirror): `{planKey, planName, monthlyCredits, maxResumes, maxWorkspaces, status,
  currentPeriodEnd, cancelAtPeriodEnd}`. It's already merged with the plan's own limits — no
  separate plan-lookup call needed for the CURRENT plan. `currentPeriodEnd` is confirmed live to be
  `null` on the free plan — the billing page's checkout-confirming flow uses "it's no longer null"
  as the real, grounded signal a webhook-activated paid subscription now exists (see below).
- Checkout redirect vs webhook: the redirect back from Stripe is NOT trustworthy for granting
  access (doc: activation happens via webhook, which can lag the redirect by a few seconds). The
  billing page (app/(app)/billing/page.tsx) handles `?checkout=success` by polling
  `useSubscription(true)` (refetchInterval every 2s) until `currentPeriodEnd` is non-null, capped
  at a 40s one-shot bail-out timer — never trust the redirect URL alone, never poll forever.
- `POST /payments/portal` confirmed: 201 `{url}` on success; 404 `NOT_FOUND` ("No billing account
  on file — you are on the free plan.") for a free-plan user. CurrentPlanCard hides the "Manage
  billing" button entirely for `planKey === 'free'` rather than inviting a click that can only
  fail — this is a known, deterministic case, not a rare error.
- Real `GET /credits/history` shape (confirmed live + Postman, exactly): `{id, amount, reason,
  referenceId, referenceType, createdAt}` — there is NO `balanceAfter` field. A sprint doc's
  running-balance ledger UI design is not buildable from real data; don't compute one client-side
  either (this account's live history has out-of-order refund rows from repeated retries, so
  summing deltas backwards would not reconstruct a trustworthy historical balance).
- Real `reason` values observed: `analyze`, `cover_letter_regenerate`, `refund`, `retry_reversal`,
  `admin_adjust` (all live), `signup_bonus` (Postman example), plus `monthly_refill`/`purchase`
  (named in the API doc's prose, not yet observed live in this account). `reason` is typed as
  `string`, not a strict union (features/credits/credits.types.ts) — this list has already grown
  past every guess once; `humanizeReason()` falls back to a generic title-case for anything not in
  its label map rather than assuming the map is exhaustive.
- `GET /credits/history` is cursor-paginated (`meta.nextCursor`/`meta.hasMore`, both confirmed
  live) — the first cursor-paginated list in this codebase, via `api.list()` +
  `useInfiniteQuery` (features/credits/credits.hooks.ts's `useCreditHistory`).

## Settings & polish (Sprint 11)

- `GET /profiles/me` confirmed live to never 404 (all-null shell, `completeness: 0`). `PUT` is a
  real upsert (omitted fields untouched) — confirmed live the backend validates linkedin/github as
  well-formed URLs but does NOT validate against their real hosts (a plain
  `https://notlinkedin.com/x` was accepted and saved as-is) — the sprint doc's own form claimed
  host mirroring that isn't actually enforced server-side; the client only mirrors what's real
  (URL format + yearsExperience 0-60 range, both confirmed live via VALIDATION_FAILED messages).
- `GET /auth/sessions` is confirmed live to be an UNBOUNDED array, not paginated — this dev account
  alone had 50+ entries from repeated test logins. SecuritySettings renders it in a bounded
  `max-h-96 overflow-y-auto` list rather than assuming it's always short. No field distinguishes
  the CURRENT device — don't try to guess/highlight one.
- ⚠️ Real notification `type` values (dot-notation, confirmed live): `run.completed`, `run.failed`,
  `gdpr.export_ready`. The sprint doc's guessed preference toggle set (`analysis_complete`,
  `analysis_failed`, `credits_low`, `payment`) matches NONE of these — `PUT
  /notifications/preferences` accepts arbitrary strings with no server-side enum validation, so
  shipping the doc's guessed strings would have produced toggles that silently did nothing (never
  matching any real notification's `type`). `NOTIFICATION_TYPES` in
  features/notifications/notifications.api.ts lists only the 3 confirmed-real values.
- ⚠️ `GET`/`PUT /notifications/preferences` response shape conflicts between live and the Postman
  collection's saved example (bare array + `data: null` in Postman vs. confirmed-live
  `{emailDisabled: string[]}` for both, PUT echoing the full updated object) — live wins, since a
  running instance is more authoritative than a possibly-stale saved example.
- `POST /gdpr/export` confirmed live: `{success:true, data:null}`, delivered almost instantly in
  dev via a `gdpr.export_ready` notification whose `message` field embeds the real signed download
  URL as plain text (not a separate structured field) — there's nothing to poll or track by id,
  just fire the request and point the user at their notifications.
- Delete account (`DELETE /users/me`) was NOT live-tested this sprint (deliberately — it would have
  destroyed the shared dev test account used across every prior sprint's verification). Trusted the
  API doc's own confirmed claim instead (token comes back TOKEN_INVALID on the very next call).
  Type-to-confirm dialog + redirect to `/login?accountDeleted=1` (a real inline banner on the login
  page, not a param the old bare `/` landing page could ever have rendered).
- Added `@radix-ui/react-switch` (components/ui/switch.tsx) — the first opt-out toggle in the app;
  Checkbox's tri-state/form semantics don't fit an immediate on/off preference.
- Polish pass highlights (full pass, not exhaustive — see the session's own audit for the rest):
  contrast fix applied to the 2 real `text-sm`-scale `text-ink-muted` body-text violations found
  (resume-picker/job-picker empty hints) — Caption's own `text-xs` scale was treated as the
  documented exception, not a bug, so it was left alone. Tab bar (components/ui/tabs.tsx) gained
  `overflow-x-auto` + `shrink-0 whitespace-nowrap` triggers — confirmed a real gap, since
  WorkspaceView alone has 7 tabs that would overflow a 375px viewport. `Button` gained
  `aria-busy` when loading. Avatar menu trigger gained `aria-label="Account menu"` (initials alone
  aren't an adequate accessible name). Added root + (app)-segment `error.tsx` and a real
  `not-found.tsx` (none existed before). Added a per-route `metadata.title` via a `layout.tsx`
  next to every page (client pages can't export metadata directly), using a `"%s · TalentPilot"`
  template on the root layout. Grep audit for raw hex/heavy shadows/banned radii/non-Heroicons
  icons/spring-motion all came back clean — the codebase was already disciplined going into this
  pass. NOT done: retrofitting every `Button` size to a 44px touch target (`sm`/`md`/`lg` are
  32/36/40px) — flagged rather than silently changed, since it's a foundational, already-shipped
  design-system dimension change with broad blast radius, not a scoped bug fix.

## Configurable payments (admin + user) — Sprint 13, 2026-07-26

A new backend feature area entirely: admin plan/credit-pack/payment-config editors + referral
oversight, plus user-facing buy-credits and invite-and-earn screens. This whole area was absent
from `docs/API-Full-Documentation.txt` and the Postman collection had request shapes only (create/
update bodies) with **zero saved response examples** — the first sprint in this project where
neither a live backend nor a doc/Postman response example was available at the start. Backend was
brought up mid-session specifically to verify every shape live (role:admin account, same as the
admin panel build) before writing any UI — see `features/admin/admin.types.ts`'s own header comment
for the full rationale.

- Real `AdminPlan` (`GET /admin/plans`) matches the sprint doc's guess almost exactly: `limits`
  IS nested (`{maxResumes, maxWorkspaces, regenPerDay}`), `stripePriceIds.yearly` can be the
  **literal empty string `""`**, not just absent, on a plan whose yearly price was never
  configured — treat `""` the same as undefined, don't render it as a real price id.
- Real `AdminCreditPack` (`GET /admin/credit-packs`) has `stripePriceId` **singular** (one
  `mode: payment` price) — NOT the plan's `monthly`/`yearly` pair, since packs are one-time
  purchases. Confirmed live: reactivating an archived pack (PATCH `{active: true}`, no price
  change) creates a **brand-new** Stripe price — the "prices are immutable" rule applies to
  reactivation too, not just an actual price edit.
- Confirmed live: `POST /admin/plans` and `POST /admin/credit-packs` both default new records to
  `active: true`. (The two credit packs seeded in this dev environment happened to be archived —
  that was someone's deliberate prior action, not the create default; verified by creating and
  immediately archiving a real throwaway pack/plan.)
- `PaymentConfig` (`GET/PATCH /admin/payment-config`) matches the sprint doc's guessed field list
  exactly (`analyzeCost, coverLetterRegenCost, interviewFeedbackCost, signupCreditGrant,
  referrerReward, refereeReward, referralQualifyingEvent, maxReferralRewardsPerUser,
  referralsEnabled, creditPacksEnabled`), plus `id`/`updatedAt`/`updatedBy` the doc's type omitted.
  Real default `referralQualifyingEvent` in this env is `"first_analysis"`, matching the doc's own
  "(recommended)" framing.
- `FEATURE_DISABLED` (403, `details: {feature: "credit_packs"}`) is a REAL error code, confirmed
  live by actually toggling `creditPacksEnabled` off and hitting checkout — it is NOT in the
  standing [[backend_error_catalogue]] memory (that catalogue predates this sprint's backend
  changes; add it there too). `useBuyCreditPack` handles it with a plain toast.
- Public `GET /plans` and `GET /credit-packs` return deliberately thinner shapes than their admin
  counterparts — no `active`/`stripeProductId`/`stripePriceId(s)`/`createdAt`/`updatedAt`, and
  public plans are FLAT (`maxResumes`/`maxWorkspaces` top-level, no `limits.regenPerDay` at all) —
  do not reuse `AdminPlan`/`AdminCreditPack` for anything rendered to a regular user.
- ⚠️ Real `AdminReferralRow.status` (confirmed live by actually registering a throwaway account
  with a real `?ref=` code and reading it back via `GET /admin/referrals`): the value is
  **`"signed_up"`** — NOT the doc's guessed `invited`/`qualified`/`rewarded` vocabulary (those are
  the STATS bucket names from `GET /referrals/me`, a different endpoint, not the row's own enum).
  The status after a referee completes the qualifying event was never observed live (email
  verification blocked driving the test account further) — `humanizeReferralStatus()`
  (`features/admin/admin.types.ts`) falls back to a generic title-case for any value not in its
  small known-map, same pattern as `humanizeReason()` for credit history (Sprint 10).
- `POST /auth/register` accepts an optional `referralCode` field not in the original Sprint 1
  type (`features/auth/auth.api.ts`) — confirmed live it associates the referral immediately
  (visible in `GET /admin/referrals` right after register, before the referee even verifies their
  email). Register page reads `?ref=` via `useSearchParams()` and passes it straight through,
  never as a visible form field; wrapped in `<Suspense>` per the existing `useSearchParams()`
  convention (see billing page).
- Credit-pack purchase confirmation (`?purchase=success` on `/billing`) can't use the
  subscription flow's `currentPeriodEnd`-goes-non-null trick (credits have no equivalent field) —
  instead the pre-purchase balance is stashed in `sessionStorage` right before the Stripe redirect
  (`CreditPacks`'s `PRE_PURCHASE_BALANCE_KEY`) and polled against via `useCredits(pollUntilAbove)`
  until exceeded, same 40s bail-out timer as the subscription flow.
- ⚠️ **Real, load-bearing bug found and fixed via live browser smoke-testing (Playwright), not
  just curl**: `PaymentConfigForm`'s Radix `Select`/`Switch` are CONTROLLED components (bound via
  react-hook-form's `Controller`), unlike the rest of the codebase's `register()`'d plain inputs.
  Mounting the form with placeholder `defaultValues` and calling `reset()` in a `useEffect` once
  the config query resolved — the exact working pattern `profile-settings.tsx` uses for plain
  inputs — left the Select's displayed value visibly stuck blank (every option showing
  `aria-selected="false"` in the real DOM) even though `reset()` was provably called with the
  correct data (confirmed via a temporary debug render). Plain `register()`'d fields update fine
  post-mount; Controller-bound fields did not, in this react-hook-form 7.82 setup. Fixed by
  splitting into a data-fetching wrapper + an inner `PaymentConfigFields` component that only
  mounts once `config` is already loaded, so `useForm`'s `defaultValues` are correct from the
  very first render — no async `reset()` needed for the initial sync at all, matching how
  `PromptManagement` (Sprint "Admin panel") and the Plan/Pack editor dialogs already avoid this
  by only ever mounting with data already in hand. **Lesson for any future form with a
  Controller-bound Select/Switch fed by an async query: don't reset() into it after mount — gate
  the whole form behind the data being loaded instead.** This was caught only because the smoke
  test actually took a screenshot and inspected the real DOM (`aria-selected`, `data-placeholder`)
  rather than just checking for console errors and a passing build — the build and lint were both
  clean the entire time this bug was present.

## Billing: cancel / switch / packs (2026-07-27)

Cancel-with-end-date, resume, plan switching (upgrade immediate / downgrade deferred), and a real
`GET /plans`-fed plan grid replacing Sprint 10's placeholder "Upgrade to X" buttons — plus credit
packs (already built the day before, Sprint 13) now sit below the plan grid. Full detail in
`features/payments/payment.api.ts`'s own header comments; key confirmed-live facts:

- ⚠️ Real `interval` enum is **`'month' | 'year'`** (Stripe's own convention) — NOT the doc's
  guessed `'monthly' | 'yearly'`, confirmed by a live `VALIDATION_FAILED` probe on both
  `POST /payments/subscription/switch` (where it's required) and `POST /payments/checkout` (where
  it's now validated if present — a real change since Sprint 10's "no interval field exists"
  finding, superseded here the same way `GET /plans` was superseded the day before).
- `Subscription.pendingPlanKey: string | null` is real and confirmed live. Downgrading (switching
  to a lower-ranked plan) does NOT change `planKey` immediately — it sets `pendingPlanKey` to the
  target and applies at `currentPeriodEnd`. Upgrading applies immediately and `pendingPlanKey`
  stays null. Reproduced exactly as the doc described.
- ⚠️ **The switch-vs-checkout branch is real and load-bearing, and the backend now has its own
  backstop for it**: confirmed live that `POST /payments/checkout` for an already-subscribed user
  returns a distinct 409 `ALREADY_SUBSCRIBED` ("...use the switch-plan endpoint..."), not a normal
  checkout session. `PlanCards` (`features/payments/components/plan-cards.tsx`) still does the
  right thing itself (`hasActiveSub` routes to `switchPlan.mutate(...)`, never `checkout.mutate`)
  — the backend guard is a backstop, not a substitute for getting the frontend branch right, per
  the doc's own caution. This dangerous path (checkout while genuinely subscribed) was
  deliberately NOT tested live end-to-end beyond the guard-check probe above, same restraint as
  Sprint 11's `DELETE /users/me` — the risk of creating a real duplicate Stripe subscription on the
  shared dev account outweighed the value of proving what the doc already documents clearly.
- ⚠️ Switching to the plan you're **already effectively on** (matching `planKey`, not
  `pendingPlanKey`) is rejected: `VALIDATION_FAILED` with an odd shape,
  `fields: {"You": ["You are already on the \"ultimate\" plan."]}` — the useful message is INSIDE
  `fields`, not the generic top-level `message` ("Validation failed."). `useSwitchPlan`'s `onError`
  unpacks `Object.values(err.fields)[0]?.[0]` specifically for this, since the field key itself
  ("You") is not a real form field to map onto.
- ⚠️ **FIXED 2026-07-27, same day, follow-up backend patch**: `POST /payments/subscription/cancel`
  used to 500 (`INTERNAL_ERROR`) while a plan switch was pending — reproduced twice, flagged to the
  backend team, and confirmed fixed the same day via a fresh live probe before touching any code.
  Cancel now succeeds in every state, and cancelling while a downgrade was pending clears the
  pending change too (`pendingPlanKey → null`, `cancelAtPeriodEnd → true`). The client-side
  workaround (disabling "Cancel subscription" while `pendingPlanKey` was set) has been REMOVED —
  don't leave a dead guard in place after the underlying bug is actually fixed; that just makes a
  working action look broken.
- A real, working undo for a pending downgrade now exists: `POST
  /payments/subscription/clear-pending-change` (confirmed live, returns the updated `Subscription`
  with `pendingPlanKey: null`). `CurrentPlanCard`'s pending-downgrade banner and the current plan's
  own card in `PlanCards` both offer a "Keep [plan]" button wired to this. ⚠️ The doc guessed a
  distinct `NO_PENDING_CHANGE` error code for calling this with nothing pending — that code does
  NOT exist; the backend reuses `NO_SUBSCRIPTION_TO_RESUME` for this case too (confirmed live),
  distinguished only by message text. Don't switch on that text; the shared code is enough since
  this path shouldn't be reachable from the UI anyway (the button only renders when a change is
  genuinely pending).
- Separately, switching to your CURRENT plan while a downgrade is pending (previously always
  rejected — see above) now also succeeds and clears the pending change, confirmed live the same
  day. `PlanCards` still routes this specific case through `clearPendingChange` rather than
  `switchPlan`, since the intent reads more clearly in the code even though the backend accepts
  both now.
- `lib/error-actions.ts`'s `errorActions`/`actionFor` map is dead code — grepped the whole repo and
  nothing calls it, despite CLAUDE.md's Sprint 0 rule describing it as the error-handling map.
  Every mutation across every sprint (checkout, portal, switch, cancel, resume, clearPendingChange,
  buyCreditPack, ...) has consistently handled `error.code` locally in its own `onError` instead.
  Followed that established real convention here rather than the doc's suggestion to extend the
  unused global map — noted here so a future session doesn't "fix" this by wiring up dead code
  without first checking whether the codebase actually uses it (it doesn't).
- **Previously disclosed side effect is now resolved**: the shared dev account had been left with
  a genuinely scheduled downgrade (`pendingPlanKey: "pro"`) from the previous session's live
  verification. Before writing any code this session, that state was found already cleared
  (`pendingPlanKey: null`) — then re-verified the whole cancel/switch/clear-pending flow live
  end-to-end anyway (schedule a downgrade → confirm cancel no longer 500s → resume → schedule again
  → clear-pending-change → confirm clean) and left the account in the same clean state it started
  in. No outstanding side effects from this session.
- `DateLine` (`current-plan-card.tsx`) renders three distinct, mutually exclusive states so the
  label always matches reality: `cancelAtPeriodEnd` → "Access ends [date]"; `pendingPlanKey` (no
  cancel) → "Renews [date] as [plan]"; otherwise → "Renews [date]". A single ambiguous "period ends
  [date]" string was deliberately rejected per the doc's own reasoning.
- Real `GET /plans` prices/descriptions **changed between 2026-07-26 and 2026-07-27** (Pro went
  from `priceMonthlyCents: 1900, description: null` to `999` with real marketing copy; Ultimate
  `4900 → 2000`; `maxResumes`/`maxWorkspaces` on `ultimate` changed from `-1` (unlimited) to
  `1000`) — confirmed by re-curling live mid-session after the rendered UI showed different numbers
  than a memory from the day before predicted. Not a bug: plan data is live, admin-editable
  content (via the Plan editor built the day before) and will keep changing — never treat a
  previous session's captured price/description as a fact to assert against current behavior,
  only as a point-in-time example. `formatDate()` (new, `lib/utils.ts`) renders an absolute date
  ("Aug 25, 2026") for renewal/access-end/pending-switch dates — `timeAgo()`'s relative style
  ("in 29 days") was judged worse for a date the user needs to plan around.
- The Yearly interval toggle only renders if at least one real plan has `priceYearlyCents > 0`
  (currently none do in this environment — all three are 0) — showing a fabricated "$0/yr" or
  forcing every yearly click into a guaranteed `NOT_FOUND` was rejected in favor of just not
  offering the choice until it's real, adapting automatically once an admin configures one.


## Dashboard insights (expanded) — 2026-07-27

Action items strip, score trend, credit burn, recurring skill gaps, and a 14-day activity strip
added to `/dashboard` — still ONE `GET /dashboard` call, every card reads from the same batched
response. Full detail in `features/dashboard/dashboard.api.ts`'s own header comment.

- ⚠️ **The sprint doc re-guessed the PRE-EXISTING (Sprint 2) fields and got them wrong**, despite
  those exact fields already being documented in CLAUDE.md's own "App shell & dashboard (Sprint 2)"
  section above: it invented `credits` (real: `creditBalance`), `plan.limits.{maxResumes,
  maxWorkspaces}` (doesn't exist — `plan` is still just `{key,name,status,monthlyCredits}`), and a
  flat `counts`/`recentWorkspaces` (real: still nested `resumes{count,limit}` /
  `workspaces.recent`). This is the exact failure mode Sprint 11 already named: a new doc's claim
  about a system an earlier sprint already characterized needs checking against that earlier,
  harder-won ground truth, not re-trusted fresh. Only the genuinely NEW fields — `scoreInsight`,
  `creditInsight`, `topGaps`, `activity`, `attention`, `actionItems` — are real additions, and all
  six matched the doc's guessed shape exactly once verified live.
- `resumes.limit: 1000` is NOT a backend bug, despite the doc's own closing note flagging it as
  one — it's real seeded `ultimate`-plan config, already documented the day before in this file's
  "Billing: cancel / switch / packs" section (maxResumes/maxWorkspaces changed from -1 to 1000).
  Doc authors keep re-flagging things earlier sessions already resolved; check CLAUDE.md first.
- `scoreInsight.trend` is one point PER RUN, not per day — two runs on the same date produce two
  entries with the same `date` (confirmed live). Not confirmed pre-sorted either. `ScoreTrendCard`
  sorts client-side before charting rather than trusting response order.
- The action items strip's `?filter=failed` link (its whole "guide, not just report" value
  proposition) assumed `/workspaces` already supported a status filter — confirmed live it didn't,
  neither client-side (the page had no filter logic at all) nor server-side (`GET
  /workspaces?status=failed` 400s: `"property status should not exist"`). Added real client-side
  `?filter=` support to `app/(app)/workspaces/page.tsx` (filters the already-fetched list, since
  there's no server-side query param to use) rather than shipping a link that silently did nothing.
- ⚠️ **Real bug caught only by an actual screenshot, not lint/build**: the Activity bar strip's
  bars all rendered at the same flat fallback height regardless of real run count. Cause: the
  percentage `height` was set on a `<div>` nested one level inside the flex item, not on the flex
  item itself — a percentage height only resolves against a parent with a *definite* height, and a
  flex item sized by `items-end` doesn't give its own children one, so the calc silently collapsed
  to nothing every time. Fixed by moving the height (and the `flex-1`) onto the actual flex item
  directly. Same lesson as the Payment Config Select bug two days earlier: build/lint/typecheck
  cannot catch a CSS layout bug that produces a technically-valid, technically-rendering result —
  only looking at the real screenshot did.
- `EmptyState`'s `action` prop only accepts a single `{label, href|onClick}`, not arbitrary JSX —
  the sprint doc's own `FirstRunEmptyState` passed it a `<div>` of two buttons, a real type
  mismatch against the actual shared component (confirmed in `components/ui/empty-state.tsx`).
  Built as `EmptyState` (no action) plus a manually-rendered two-button row below it instead.
