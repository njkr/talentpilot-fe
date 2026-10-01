# TalentPilot frontend — development notes

Working conventions and confirmed API behaviour, recorded sprint by sprint.

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
  everywhere else — DEVELOPMENT-NOTES.md's Sprint 11 polish pass grep-audited the whole repo for non-Heroicons
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
- `stale` (DEVELOPMENT-NOTES.md's top-level rule) is enforced in the download menu itself: a stale document
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
  documented exception to DEVELOPMENT-NOTES.md's usual "switch on code" rule, justified because the backend
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
  following the principle that sometimes the answer isn't a categorical chart.
- The daily-spend chart uses `recharts` (newly added dependency — this app had zero charting
  libraries before) as a single-series area chart. Colors are the real design tokens' hex values
  copied verbatim from `app/globals.css` (`#2563eb` primary, `#e5e7eb` border, `#6b7280`
  ink-secondary) — recharts props take raw color values, not Tailwind classes, so this is the one
  place DEVELOPMENT-NOTES.md's "no raw hex" rule doesn't apply, per the sprint doc's own note.
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

- ⚠️ **SUPERSEDED 2026-07-26 (see "Configurable payments" below):** this bullet originally said
  `GET /plans` DOES NOT EXIST, confirmed three ways at the time (live 404, absent from the API doc,
  absent from Postman). That was true on 2026-07-25. The Sprint 13 configurable-payments backend
  update added it for real — confirmed live the very next day. The billing page STILL does not show
  a multi-plan comparison grid (that part of the original decision stands; nothing consumes the now-
  real endpoint yet), but "the endpoint doesn't exist" is no longer the reason — it's simply an
  unbuilt feature now. If a future change builds a real plan-comparison grid, `GET /plans` is
  confirmed available for it. Lesson: an endpoint's absence is a point-in-time fact about a running
  backend, not a permanent architectural constraint — re-verify rather than trusting an old "doesn't
  exist" note forever once a new backend doc/session arrives.
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
- Polish pass highlights (full pass, not exhaustive — see the polish-pass audit for the rest):
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
brought up mid-sprint specifically to verify every shape live (role:admin account, same as the
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
  nothing calls it, despite DEVELOPMENT-NOTES.md's Sprint 0 rule describing it as the error-handling map.
  Every mutation across every sprint (checkout, portal, switch, cancel, resume, clearPendingChange,
  buyCreditPack, ...) has consistently handled `error.code` locally in its own `onError` instead.
  Followed that established real convention here rather than the doc's suggestion to extend the
  unused global map — noted here so a future change doesn't "fix" this by wiring up dead code
  without first checking whether the codebase actually uses it (it doesn't).
- **Previously disclosed side effect is now resolved**: the shared dev account had been left with
  a genuinely scheduled downgrade (`pendingPlanKey: "pro"`) from the previous round's live
  verification. Before writing any code in this round, that state was found already cleared
  (`pendingPlanKey: null`) — then re-verified the whole cancel/switch/clear-pending flow live
  end-to-end anyway (schedule a downgrade → confirm cancel no longer 500s → resume → schedule again
  → clear-pending-change → confirm clean) and left the account in the same clean state it started
  in. No outstanding side effects from this round.
- `DateLine` (`current-plan-card.tsx`) renders three distinct, mutually exclusive states so the
  label always matches reality: `cancelAtPeriodEnd` → "Access ends [date]"; `pendingPlanKey` (no
  cancel) → "Renews [date] as [plan]"; otherwise → "Renews [date]". A single ambiguous "period ends
  [date]" string was deliberately rejected per the doc's own reasoning.
- Real `GET /plans` prices/descriptions **changed between 2026-07-26 and 2026-07-27** (Pro went
  from `priceMonthlyCents: 1900, description: null` to `999` with real marketing copy; Ultimate
  `4900 → 2000`; `maxResumes`/`maxWorkspaces` on `ultimate` changed from `-1` (unlimited) to
  `1000`) — confirmed by re-curling live mid-sprint after the rendered UI showed different numbers
  than a memory from the day before predicted. Not a bug: plan data is live, admin-editable
  content (via the Plan editor built the day before) and will keep changing — never treat a
  previous round's captured price/description as a fact to assert against current behavior,
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
  those exact fields already being documented in DEVELOPMENT-NOTES.md's own "App shell & dashboard (Sprint 2)"
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
  Doc authors keep re-flagging things earlier rounds already resolved; check DEVELOPMENT-NOTES.md first.
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

## Landing page (marketing, SEO) — 2026-07-28

The old bare `/` placeholder is replaced by a real, server-rendered marketing site: `app/(marketing)/`
(homepage, `/pricing`, and three keyword pages under `(features)/`), plus `app/sitemap.ts`/
`app/robots.ts`/`app/opengraph-image.tsx`. Full detail lives in each file's own comments; key
things a future change needs to know before touching any of this:

- ⚠️ **A real, load-bearing bug found and fixed before the landing page could work at all**:
  `providers/auth-bootstrap.tsx` used to block **the entire app** behind a full-page spinner
  while `auth.status === 'loading'` (confirmed live — curled `/` and saw literal spinner markup
  in the server-rendered HTML, not the landing page content). That's fine for `(app)`/`(auth)`,
  which need it, but fatal for any public route: a crawler with no session cookie would see a
  spinner, not content, every single time. Fixed by moving the loading-splash gate OUT of
  `AuthBootstrap` (which now only fires the `/auth/refresh` call and always renders `children`
  immediately) and INTO `RequireAuth`/`RedirectIfAuthed` themselves — the two guards that
  actually need to know 'loading' vs resolved. `(app)`/`(auth)` behavior is unchanged; routes
  outside both groups (the marketing pages) now render instantly regardless of auth state.
- A third, non-blocking variant exists for the marketing pages specifically:
  `components/auth/marketing-auth-redirect.tsx` (`MarketingAuthRedirect`). Unlike
  `RedirectIfAuthed`, it renders `null` itself (mounted as a sibling of `{children}` in
  `(marketing)/layout.tsx`, never a wrapper) and never blocks — an already-signed-in visitor
  sees a brief flash of the landing page before the client-side redirect to `/dashboard` fires.
  That tradeoff is deliberate: a public page must always paint immediately, full stop.
- ⚠️ **Real, confirmed-live title-doubling bug**: the root layout (`app/layout.tsx`) already
  defines `title.template: "%s · TalentPilot"` for `(app)/(auth)/(admin)`. Without `title.absolute`
  on `(marketing)/layout.tsx`'s own title, the root template wraps the marketing layout's title
  too, producing `"...ATS Checker · TalentPilot"` (doubled, confirmed via curling `/` and reading
  the literal `<title>` tag). Fixed with `title: { absolute: "...", template: "%s | TalentPilot" }`
  — `absolute` opts the homepage out of every ancestor template; the marketing group's OWN
  `template` still applies normally to its child pages (`/pricing` → `"Pricing | TalentPilot"`,
  not double-suffixed either). Confirmed live both ways after the fix.
- ⚠️ **`sitemap.ts` and `robots.ts`/`opengraph-image.tsx` do NOT behave the same way inside a route
  group, confirmed live by actually curling all three**: `app/(marketing)/sitemap.ts` correctly
  resolves to `/sitemap.xml` (route groups are transparent to the URL for this one), but
  `app/(marketing)/robots.ts` and `app/(marketing)/opengraph-image.tsx` both 404'd (the app's real
  `not-found.tsx` rendered, not a 500) until moved to the true `app/` root
  (`app/robots.ts`, `app/opengraph-image.tsx`). Don't assume route-group transparency applies
  uniformly across every special file convention — it doesn't, and the only way to know is to
  actually request the URL, which is exactly how this was caught.
- No `@radix-ui/react-accordion` is installed (the original spec assumed it was) — the FAQ
  (`(marketing)/components/faq.tsx`) uses a native `<details>`/`<summary>` instead, styled with
  Tailwind and a pure-CSS `group-open:rotate-180` chevron. This is strictly better than adding the
  dependency: zero client JS (the whole FAQ section is a Server Component), and the answer text is
  guaranteed to stay in the DOM when collapsed (required for the FAQPage JSON-LD to be valid).
- No `NEXT_PUBLIC_SITE_URL` (or any site-URL env var) existed before this — added it to
  `.env.local`, defaulting to the local dev server (`http://localhost:3001`), NOT a guessed
  production domain. `lib/site-config.ts` (`SITE_URL`, `SITE_NAME`) is the one place every
  canonical URL / OG URL / sitemap / robots entry reads from — update the env var before deploying
  to a real domain, never hardcode one in a page file.
- `/pricing` and the homepage's pricing teaser both fetch the REAL, live plan catalog
  (`(marketing)/lib/get-public-plans.ts`, a plain server-side `fetch` against `GET /plans`) —
  deliberately NOT the app's `features/payments/payment.api.ts` client wrapper, which is coupled
  to the browser-only Zustand auth store and axios interceptors that have no place in a Server
  Component render. Real plan prices have already changed twice in this project's history (see
  "Billing: cancel / switch / packs" above) — this page must never hardcode a price. Degrades to
  a "sign up to see current plans" message (not a crash) if the backend is unreachable at
  request/build time.
- No SocialProof or Testimonials section, and the JSON-LD `SoftwareApplication` schema
  deliberately has NO `aggregateRating` — this is a genuinely new product with no real customer
  logos, usage stats, or reviews yet. Fabricating any of those (a "trusted by X companies" strip,
  invented quotes from made-up people, a made-up star rating) is the same category of deception
  Google's own spam policy targets for `aggregateRating` specifically — treated as a hard no
  across the board, not just for that one schema field. Add real versions once real usage/reviews
  exist, never before. `ScoreDemo`'s illustrative report ("Senior Backend Engineer", generic
  matched/missing keywords) is explicitly labeled "Example report — illustrative" for the same
  reason — a mockup of the UI is fine, implying it's a real customer's data is not.
- The dev machine this was built on is memory-constrained (confirmed: 7.4GB total, well under 1GB
  free during a build attempt) — a full `next build`'s static-generation phase OOM'd twice
  (Turbopack's own first failure was a separate, transient Windows "insufficient system resources"
  error). `tsc --noEmit` and `eslint` both pass clean, and every route was verified instead via the
  dev server + curl (title tags, section text, JSON-LD, sitemap/robots/OG all confirmed live) —
  don't treat a future OOM'd `next build` on this machine as a code regression without first
  checking whether `tsc`/lint are actually clean and the dev server renders correctly.
- ⚠️ **Everything in this section was built once, then wiped (files deleted, `.env.local` and the
  three auth-gate files reverted to their pre-fix state) by an action outside the normal workflow, and
  rebuilt a second time from scratch on the same day** — confirmed by re-listing every
  directory before restoring anything, rather than assuming what survived. If something described
  here seems to be missing again later, check the actual filesystem before concluding it was never
  built; this has already happened once.

## Admin: third-party integration usage tracking — 2026-07-28 (built same day)

New backend admin API surfacing historical usage/error counts for OpenAI, Resend, Tavily, Stripe,
and S3. Was left as a doc-only note earlier in the day; built out later the same day. No live
reachability check by design (historical stats only, a deliberate backend scope decision).

- `GET /admin/integrations` — last-24h overview across all 5 providers. Real shape (confirmed live):
  ```json
  {
    "since": "2026-07-27T14:03:28.870Z",
    "providers": [
      { "provider": "openai", "calls": 43, "errors": 0, "costUsd": "0.154648" },
      { "provider": "resend", "calls": 2, "errors": 0 },
      { "provider": "tavily", "calls": 4, "errors": 0 },
      { "provider": "stripe", "calls": 1, "errors": 0 },
      { "provider": "s3", "calls": 2, "errors": 0 }
    ]
  }
  ```
  Only `openai` ever carries `costUsd` — the other four have no per-call cost tracked at all; don't
  render a `$0.00`/blank cost cell for them, omit the column entirely for those rows.
- `GET /admin/integrations/:provider/daily?days=30` — per-provider daily history. `provider` is one
  of `openai | resend | tavily | stripe | s3` (400 `VALIDATION_FAILED` on anything else, with the bad
  value surfaced under `error.fields.Unknown[0]`, not a dedicated field name — an artifact of this
  being a plain `BadRequestException(string)` running through the same class-validator-shaped error
  mapper as everywhere else, confirmed live). Real shape:
  ```json
  {
    "provider": "openai",
    "since": "2026-07-21T13:52:11.166Z",
    "days": [
      { "day": "2026-07-21T00:00:00.000Z", "calls": "4", "errors": "0", "costUsd": "0.001359" }
    ]
  }
  ```
  ⚠️ `calls`/`errors`/`costUsd` here are **strings** (straight off a raw SQL aggregate), but the
  overview endpoint's `calls`/`errors` above are **numbers** — the two endpoints don't type the same
  field name consistently; don't assume one shared type covers both.
- `GET /admin/costs` (existing, already wired to `CostDashboard` via `useAdminCosts`) — `byDay`
  entries now also carry `calls`/`errors` (both strings, same as `byFeature.calls` already is):
  `{ "day": "...", "costUsd": "0.081200", "calls": "39", "errors": "0" }`. `AdminCosts.byDay` in
  `features/admin/admin.types.ts` needs both new fields added.
- Auth: identical `AdminGuard` as every other `/admin/*` route (role `admin` + email allowlist) — no
  new auth/session work needed on this side.
- ⚠️ Re-verified live before building (same day, a few hours after the doc-only note above was
  written): every shape above held exactly, including the one thing the note itself flagged as
  unconfirmed — whether `costUsd` is absent per-day for non-openai providers too (not just at the
  overview level). Confirmed live by actually calling `GET /admin/integrations/resend/daily`: yes,
  absent there too, same as the overview.
- Built as `features/admin/components/integrations-dashboard.tsx` (new) at `/admin/integrations`,
  extending `admin.types.ts`/`admin.api.ts`/`hooks/use-admin.ts` in place per the established
  one-module-per-domain convention (no new feature module). Nav entry added to
  `admin-nav-items.ts` with `PuzzlePieceIcon`. Overview is a `divide-y` row list (same convention
  as `topUsers`/audit log — no Table component exists or was added). Per-provider daily drill-down
  reuses `prompt-management.tsx`'s `<Select>` + hardcoded-key-array + fetch-detail pattern, not a
  dynamic route (that pattern is reserved in this codebase for deep-linkable resources like run
  details, not admin-initiated exploratory drill-downs). Which metric is primary (cost vs. calls)
  is decided from the data itself (`days.some(d => d.costUsd !== undefined)`), not a hardcoded
  `provider === "openai"` check, so it stays correct if the backend ever tracks cost for another
  provider.
- The daily-spend chart (`cost-dashboard.tsx`'s original `DailySpendChart`) was extracted into a
  new shared `features/admin/components/daily-metrics-chart.tsx` (`DailyMetricsChart`) so both the
  existing costs page and the new per-provider drill-down render off one component instead of two
  copies of the same recharts config. `calls`/`errors` are surfaced as extra lines in a custom
  Tooltip `content` render-prop (needed since they have no chart series of their own — only
  reachable via `payload[0].payload`), not a second overlaid series/axis — dollars and raw counts
  don't share a scale, and this matches the established "restraint over decorative complexity"
  taste from the dashboard-insights sprint (the score-trend sparkline has no axes at all). Verified
  by actually hovering the chart and screenshotting the tooltip, not just checking for console
  errors — the `contentStyle`→custom-`content` prop swap was flagged in planning as the
  highest-risk change (a missed recharts internal prop can silently render nothing).
- Updated Postman collection/environment (`docs/TalentPilot-API.postman_collection.json` /
  `docs/TalentPilot-API.postman_environment.json`) copied over from the backend repo, replacing the
  stale pair — new `"Admin — Integrations"` folder (Overview + Daily History requests) plus the
  refreshed `"Cost Breakdown"` response example.

## Admin: user management API — 2026-07-28 (built same day)

Backend admin API for browsing every signed-up user and revoking/granting their access. Built and
live-verified end-to-end (curl + Playwright) the same day this doc-only note was originally written.

- `GET /admin/users?cursor=&limit=&search=&status=&days=` — cursor-paginated (same
  `{data, hasMore, nextCursor}` shape as `/admin/integrations`), `search` is an email substring
  match, `status` filters to `active|suspended|deleted`, `days` (default 30) controls the windowed
  spend figure. Real shape per row:
  ```json
  {
    "id": "8f14e45f-ceea-467e-bd97-37e33f8a2e9c",
    "email": "jane.doe@example.com",
    "role": "user",
    "status": "active",
    "isVerified": true,
    "createdAt": "2026-07-20T10:15:00.000Z",
    "lastLoginAt": "2026-07-28T09:30:00.000Z",
    "planKey": "pro",
    "planName": "Pro",
    "totalSpendUsd": "2.348900",
    "spendLastNDaysUsd": "0.512300",
    "resumeCount": 3,
    "coverLetterCount": 5,
    "referrals": { "invited": 2, "qualified": 1 }
  }
  ```
  ⚠️ Mixed types worth getting right in the frontend model: `totalSpendUsd`/`spendLastNDaysUsd` are
  **strings** (raw SQL aggregate, same reason `AdminCosts.byFeature.costUsd` already is one), but
  `resumeCount`/`coverLetterCount`/`referrals.invited`/`referrals.qualified` are real **numbers**.
  `planKey`/`planName` default to `"free"`/`"Free"` for any user with no `subscriptions` row (the
  common case — see the payments sprint notes above for why).
- `POST /admin/users/:id/suspend` and `POST /admin/users/:id/activate` — `{ status: "suspended" }` /
  `{ status: "active" }` on success. `suspend` 400s with a brand-new error code,
  **`SELF_ACTION_FORBIDDEN`** (`"You cannot revoke your own admin access."`), if the admin targets
  their own account — the UI should disable/hide the suspend action on the signed-in admin's own row
  rather than let the request round-trip and fail. Both 404 with the standard `NOT_FOUND` shape for
  an unknown id.
- ⚠️ Suspension is not instantaneous: it blocks the next login/refresh, but an already-issued access
  token stays valid until its ~10-minute TTL naturally expires. Don't word the confirm dialog or a
  success toast as "user logged out immediately" — say "access revoked" instead.
- Auth: same `AdminGuard` as every other `/admin/*` route — nothing new needed.
- Built as `/admin/users` (`features/admin/components/user-management.tsx`) extending the same
  `features/admin/{admin.api.ts, admin.types.ts, hooks/use-admin.ts}` module (`listUsers`,
  `suspendUser`, `activateUser`, `AdminUserRow`/`AdminUserStatus`), plus a nav entry in
  `admin-nav-items.ts` — same one-module-per-domain convention as Integrations. A plain `<table>`
  (email, status badge, plan, lifetime spend, resumes, cover letters, referrals `invited/qualified`,
  actions), following `run-inspector.tsx`'s exact existing table markup — no new shared
  `components/ui/table.tsx` was justified for a second use case.
- Debounced email search (new, first-ever debounce util in this codebase —
  `hooks/use-debounced-value.ts`, root-level since any future search box can reuse it) + an
  immediate-refetch `ChipGroup` status filter (all/active/suspended/deleted) — status is discrete
  clicks, not keystrokes, so no debounce there.
- Self-guard: the signed-in admin's own row **hides** (not disables) the Suspend button
  (`row.id === currentUserId`, `stores/auth.store.ts`, read once per page render, not per row) —
  confirmed live the backend's `SELF_ACTION_FORBIDDEN` guard is real and independent of this UI
  nicety (curled it directly against the admin's own id).
- Suspend goes through a `Modal` confirm (matching `credit-pack-management.tsx`'s archive-confirm
  precedent) whose copy says "revoke access," names the ~10-minute token-TTL caveat explicitly, and
  never says "logged out immediately," per this doc's own wording rule above. Activate has no
  confirm step and reuses the mutation's own (not per-row) `isPending` for its loading state — same
  accepted precedent `credit-pack-management.tsx`'s Activate button already established.
- Full live verification performed (throwaway account `referral-test-sprint13@example.com`, never
  a real user): `lastLoginAt` confirmed to come back as a genuine JSON `null` (not an absent key)
  for a never-logged-in account — the drafted `string | null` type needed no fix. Empty search and
  `status=deleted` both confirmed 200 with `{data: [], hasMore: false}`, not an error. Suspend →
  activate round-trip confirmed exactly `{status:"suspended"}` → `{status:"active"}`, account
  restored to its original clean state after. A syntactically-valid-but-nonexistent UUID confirmed
  plain `NOT_FOUND`. Self-suspend against the admin's own real id confirmed
  `SELF_ACTION_FORBIDDEN` exactly as documented. Playwright pass confirmed all 8 real UI states:
  own-row Suspend hidden, debounced search, confirm-modal copy, full suspend→toast→badge-flip→
  activate→toast→badge-flip round-trip, and the status `ChipGroup` filtering correctly.
- **Not verified**: "Load more" cursor pagination — this dev environment only has 4 total users, so
  no second page is reachable to click through. Flagged as an untested gap rather than a fabricated
  pass; the `hasMore`/`nextCursor` wiring itself matches the already-proven `useAuditLog`/
  `useAdminReferrals` `useInfiniteQuery` pattern exactly, so risk is low, but it hasn't been clicked.
- Updated Postman collection/environment (same two `docs/` files) — new `"Admin — Users"` folder
  (List/Suspend/Activate requests) with real response shapes and the `SELF_ACTION_FORBIDDEN` 400
  example.

## Learning roadmap: admin-configurable affiliate links — 2026-08-03

New backend feature: `GET /workspaces/:id/learning-roadmap` items now carry an `affiliateUrl` field,
sourced from an admin-managed set of link templates — not yet built in this frontend, doc-only note
for whoever picks this up next.

- **Why a template, not an exact link per resource**: roadmap item titles are AI-generated
  (`build_learning_path`) and often invented rather than drawn from a real catalog — there's no
  stable "product id" a specific affiliate link could attach to. So admin configures URL *templates*
  per `resourceType` (`documentation | course | book | project | other`) containing a literal
  `{query}` placeholder; the backend substitutes the item's own title (URL-encoded) at read time.
  Admin can also add keyword overrides (e.g. `"aws"` → a specific curated course link) that outrank
  the generic template when the keyword appears in the title (case-insensitive substring).
- **`affiliateUrl` is separate from `url`, never overwrites it.** `url` is still the AI's own guess
  (frequently `null`) — on the rare case the model did produce a real, specific link, silently
  replacing it with a generic affiliate search page would be a downgrade. Render both: `url` as
  "view resource" (when non-null) and `affiliateUrl` (when non-null) as a distinct, clearly-labeled
  affiliate link — don't merge them into one link with two possible hrefs.
- Confirmed live against a real, completed roadmap (6 real items: `book`/`course`/`documentation`/
  `project` types): items of a type with no admin template configured get `affiliateUrl: null`
  (documentation and project, in that test) — never a broken or empty-string link. Real example
  response shape:
  ```json
  {
    "title": "Kubernetes Basics by Google Cloud",
    "resourceType": "course",
    "url": null,
    "affiliateUrl": "https://www.udemy.com/courses/search/?q=Kubernetes%20Basics%20by%20Google%20Cloud&ranMID=test",
    "estHours": 15,
    "priority": "preferred"
  }
  ```
- Admin CRUD — `GET/POST/PATCH/DELETE /admin/affiliate-links` (same `AdminGuard` as every other
  `/admin/*` route). `POST` body: `{ resourceType, keyword?, urlTemplate, label, active?, priority? }`
  — omit `keyword` to create the *default* template for that `resourceType`. Confirmed live:
  - A second default for the same `resourceType` (another row with `keyword` omitted) 409s as
    `ALREADY_EXISTS` — a DB-level partial unique index, not just an app-side check, so a race between
    two admin tabs can't create two defaults either.
  - `urlTemplate` without the literal `{query}` substring 400s as `VALIDATION_FAILED` before it ever
    reaches the DB — the UI should validate this client-side too rather than relying on the round
    trip.
  - `PATCH` is a partial update (only sent fields change) — the natural way to toggle `active` off
    without deleting a row.
  - `DELETE` is a real hard delete (unlike `Plan`/`CreditPack`, nothing else references these rows by
    id, so there's no "existing subscriber" reason to soft-archive instead).
- Not built yet (doc-only this round) — when picked up: a new admin page/table for managing these
  templates and overrides (resourceType, keyword, urlTemplate, label, active toggle, priority — a
  flat CRUD table, same shape as the existing Plans/Credit Packs admin tables), plus updating
  wherever the learning roadmap is rendered to show `affiliateUrl` as a distinct link when present.
  Given the low row count expected (one default per resourceType plus a handful of keyword
  overrides), a simple unpaginated table is the right fit — no infinite-scroll needed here, unlike
  the Users/Integrations admin views.
- Updated Postman collection/environment (same two `docs/` files) — new `"Admin — Affiliate Links"`
  folder (List/Create/Update/Delete, including the `{query}`-validation 400 and duplicate-default 409
  examples) plus the refreshed "Get Learning Roadmap" response example showing `affiliateUrl`.

## Workspace suggestions: more suggestions, real before/after score, needs_info — 2026-08-04

New backend work only, not built in this frontend yet — doc-only note for whoever picks this up
next. Live-verified end-to-end via curl against a real workspace (analyze → apply → rescore), so
every shape below is confirmed real, not just read from source.

- **More suggestions**: the AI's own cap went from "at most 12" to "at most 20" (prompt-only
  change, `resume_optimization` v2, no schema `.max()` ever existed) — nothing for the frontend to
  change, but don't assume a hardcoded 12-item list anywhere if one exists.
- **`needs_info`**: a suggestion the fabrication guard would previously have silently dropped is now
  saved and returned instead. `GET /workspaces/:id/suggestions` rows gained two nullable fields:
  ```json
  {
    "id": "...",
    "sectionType": "experience",
    "oldText": "Led a small team on the checkout redesign.",
    "newText": "Led a team of 6 engineers on the checkout redesign, cutting cart abandonment by 18%.",
    "status": "needs_info",
    "missingFact": "a specific metric or number",
    "exampleValue": "18%"
  }
  ```
  ⚠️ **Both `newText` and `exampleValue` are illustrative-only on a `needs_info` row** — the AI
  invented "6 engineers" / "18%" because the resume never says either. Render `newText` the same way
  you'd render `exampleValue`: clearly labeled "e.g. ..." / "AI suggestion — not from your resume,
  edit before using," never as an apply-able diff. This is the one place in the whole suggestions UI
  where `newText` is NOT safe to show as "the proposed change" — every other status (`pending` etc.)
  still works exactly as today.
  - Not observed in the live run (this particular resume/JD pair didn't trigger one — the
    model doesn't always invent a fact, that's the point), but the path is exercised by 91 passing
    backend unit tests with crafted fabrication scenarios (numbers, years, orgs, credentials), so the
    shape above is trustworthy even without a live screenshot of it.
  - New endpoint: `POST /workspaces/:id/suggestions/:suggestionId/provide-detail`, body
    `{ "newText": "your real replacement text" }`. Re-runs the same fabrication check against the
    user's own submitted text (not just the AI's) — if it's still unverifiable, the suggestion stays
    `needs_info` with a refreshed `missingFact`/`exampleValue`; if it passes, it flips to `pending`
    and flows through the existing apply path unchanged. 404s with `"No needs_info suggestion with
    that id."` if called on anything not currently `needs_info` (e.g. already `pending`) — use this
    to decide when the provide-detail form should even be reachable.
  - UI precedent to reuse: `features/jobs/components/missing-fields-banner.tsx` is the existing
    "ask the user for a missing detail, they may skip" pattern — model the `needs_info` card variant
    on it (labeled input for the real detail + Save, plus the existing Reject action as "skip").
- **Real before/after score** — `GET /workspaces/:id/report`'s response gained one new field:
  ```json
  {
    "id": "...", "resumeVersion": 4, "overallScore": 70,
    "original": {
      "id": "...", "resumeVersion": 1, "overallScore": 69,
      "keywords": []
    }
  }
  ```
  `original` is the very first report ever generated for this workspace (the true "before" score,
  regardless of how many rescores have happened since) — `null` until at least one rescore has run
  (i.e. while the current report IS the original). `original.keywords` is always `[]` by design —
  the frontend only needs `original`'s scores for the diff, not its full keyword list, so don't treat
  an empty array there as a bug or try to render a keyword table for it.
  - ⚠️ The score is genuinely recalculated, not synthetic — confirmed live it can move by a small,
    real amount (69 → 70 in the test, from two low-impact skills-section suggestions) or
    presumably not move at all for cosmetic-only edits. **Never hardcode or imply a target range
    ("your score will jump to 90+")** — the honest number is the whole point of this feature; the
    backend will never fabricate one to make the "after" look better.
- **`POST /workspaces/:id/rescore`** — genuinely new paid AI work (fresh embedding + AI grading),
  charged separately from the original analysis. Returns `{ "queued": true }` immediately (debits
  credits synchronously, but the new report lands asynchronously via the worker — same poll-`GET
  :id/report` pattern as everywhere else in this app, no new SSE channel). Confirmed live: exactly 5
  credits (`PaymentConfig.rescoreCost`, admin-editable via the existing `/admin/payment-config`
  PATCH — same pattern as `analyzeCost`/`coverLetterRegenCost`) debited the instant the call
  succeeds, before the worker has even started.
  - `409 NO_CHANGES_TO_RESCORE` (`"No changes since your last score — apply some suggestions
    first."`) if the resume hasn't changed since the last report — confirmed live this fires with NO
    credit side-effect (balance unchanged), so it's safe to let the user retry immediately after
    fixing the real problem (nothing to rescore yet). Disable/hide the "Recalculate score" action
    when the workspace's `analyzedResumeVersion` (or the report's own `resumeVersion`) already
    matches the resume's current version, rather than relying on the 409 as the primary UX signal.
  - `402 INSUFFICIENT_CREDITS` and `409 REPORT_NOT_READY` (no analysis has ever completed) are the
    other two documented failure modes — same shape/handling as the existing `analyze` endpoint's
    credit/readiness errors.
- Auth: standard JWT guard, no new roles — same as every other `/workspaces/:id/*` route.
- Built the same day, see "Report diff, Recalculate score, needs_info suggestions" below — the
  bullet that used to say "not built yet" here is now stale, kept only for the endpoint-shape
  documentation above.
- Updated Postman collection/environment (same two `docs/` files) — new "Recalculate Score" request
  under the existing Workspaces folder (with the `NO_CHANGES_TO_RESCORE`/`INSUFFICIENT_CREDITS`
  examples) and a new "Provide Suggestion Detail" request under Suggestions, plus the refreshed "Get
  Report" response example showing `original`.

## Report diff, Recalculate score, needs_info suggestions — 2026-08-04 (built same day)

Built the three frontend pieces the section above left as doc-only: a before/after score diff on
the report tab, a "Recalculate score" action, and a `needs_info` suggestion card. Live-verified
end-to-end via Playwright against the real dev backend (not just curl) — one full paid rescore
round-trip was actually run (not just the error paths), see below.

- `AtsReport` (`features/report/report.types.ts`) gained `resumeVersion: number` and
  `original: AtsReport | null`. Confirmed by directly reading the Postman "Get ATS Report" saved
  response body (not just its description text, which mentions `original` but — worth remembering
  for next time — a description mentioning a field is NOT proof the saved example was actually
  refreshed to include it; had to check the raw body string directly): `original` is a full nested
  `AtsReport`, not a thin stub, confirming DEVELOPMENT-NOTES.md's own claim above.
- `ScoreCard` (`features/report/components/score-card.tsx`) renders a delta pill (`+N`/`-N`/`±0`,
  success/danger/neutral tone) plus a "Was {score}" caption whenever `report.original` is present,
  and gained an optional `actions` slot (used for the Recalculate button) — unchanged when
  `original` is `null`. `ScoreBreakdown` also gained an optional `originalBreakdown` prop that
  renders a per-component `(+N)`/`(-N)` next to each score when the matching component exists in
  both arrays — the stretch goal from the original ask, confirmed live rendering correctly
  alongside the overall delta (screenshot: semantic/experience/project/grammar components all
  showed correct deltas after a real rescore).
- `RecalculateScoreButton` (new, `features/report/components/recalculate-score-button.tsx`):
  hardcodes `RESCORE_COST = 5` (same precedent as `AnalyzeButton`'s `ANALYZE_COST = 21` — the real
  `PaymentConfig.rescoreCost` is admin-only and not reachable from a regular user's report tab).
  Gates on `report.resumeVersion` vs. the resume's real current version via the already-built
  `useVersions(resumeId)` hook (`Math.max(...versions.map(v => v.version))`, falling back to
  `report.resumeVersion` itself when the resume has zero recorded version-events) — disables the
  button and shows "No changes since your last score" client-side, confirmed live on both an
  up-to-date workspace (disabled) and a workspace whose resume had changed via a sibling
  workspace's suggestion-apply flow, since resume versions are per-resume, not per-workspace
  (enabled). Confirm `Modal` shows the real cost before mutating. `useRescore`/`useRescorePoll`
  (new hooks, `features/report/hooks/`) mirror `use-analyze.ts`'s idempotency-key pattern and
  `use-resume-status.ts`'s `usePollUntil` pattern respectively — the poll reuses the exact same
  query key as `useReport` (`["workspaces", workspaceId, "report"]`) so a landed new report is
  picked up by the report tab's own query automatically, no separate invalidate needed.
  ⚠️ Two `react-hooks/set-state-in-effect` ESLint errors surfaced while building this (this
  project's lint config flags synchronous `setState` calls in a bare effect body) — fixed by
  deriving `polling`/`stuck` booleans from existing query state instead of resetting a separate
  boolean via an effect (e.g. `polling = previousReportId !== null && !poll.done` rather than an
  effect that calls `setPreviousReportId(null)` when done). Worth remembering as the idiomatic fix
  next time this lint rule fires on a poll-driven component in this codebase.
  Confirmed live end-to-end (one real paid round trip, deliberately not repeated): clicked
  Recalculate on a stale workspace, confirm modal showed "5 credits", credits topbar went
  2102 → 2097 immediately on confirm, "Recalculating…" caption showed while polling, the new
  report landed within a few seconds with a correct `original` (the very first report for that
  workspace) and correct per-component deltas, and the button correctly re-disabled afterward.
  ⚠️ **Open question for the backend team, not yet resolved**: `/rescore`'s Postman entry has
  `"header": []` (no `Idempotency-Key`) and none of its three documented responses mention
  `IDEMPOTENCY_KEY_REQUIRED` — unlike `/analyze`, `/payments/checkout`, and
  `/credit-packs/:id/checkout`, which all explicitly require the header and document that 400.
  This suggests `/rescore` has no server-side dedup at all. The frontend still generates and sends
  a fresh key per click (harmless either way, matches the established pattern), but a double-click
  or network-retry may not actually be protected against a double charge/double rescore the way
  every sibling paid action is — client-side, the button disabling itself while pending is the
  only guard right now. Flag to backend: confirm whether `/rescore` reads `Idempotency-Key`, and
  if not, whether it should for consistency.
- `AiSuggestion` (`features/suggestions/suggestion.types.ts`) gained `status: "needs_info"` plus
  nullable `missingFact`/`exampleValue`. `suggestionApi.listPending` (renamed `list`) no longer
  hardcodes `{ status: "pending" }` as a query param — that filter previously meant a `needs_info`
  row could never be fetched at all, silently hiding the entire feature. Added
  `suggestionApi.provideDetail` → `POST .../suggestions/:id/provide-detail`.
  `NeedsInfoCard` (new, `features/suggestions/components/needs-info-card.tsx`) is modeled on
  `missing-fields-banner.tsx`'s controlled-input/disabled-until-non-empty/mutation-loading
  structure, but diverges where the doc requires it: Skip calls the real (previously wired-nowhere)
  `useRejectSuggestions` hook instead of a purely local dismiss, and a resubmission that's still
  unverifiable shows an inline "Still couldn't verify that" retry message rather than a toast,
  since staying `needs_info` is a real expected outcome, not an error. `newText`/`exampleValue` are
  rendered only inside a clearly labeled "e.g. ... — not from your resume, edit before using" box,
  never as the green "Suggested" diff box a `pending` row gets. `SuggestionsTab` now computes
  `selectable = suggestions.filter(s => s.status !== "needs_info")` for "Select all"/the bulk Apply
  button/the summary line, so needs_info rows can't be bulk-applied.
  ⚠️ **Not live-verified** — this dev environment's 6 existing workspaces (spot-checked via the API
  before building, to pick real before/after and stale/up-to-date test cases for the other two
  features) had zero `needs_info` rows at check time, and reproducing one wasn't attempted live
  (would require an extra ~21-credit analyze run against a sparse resume/JD pairing with no
  guarantee of triggering the fabrication guard on any given attempt — the same caveat this
  section's doc-only note already flagged before any code was written). Confirmed instead via
  `tsc --noEmit`/`eslint`/`next build` all passing clean, and via a live regression check that the
  suggestions list still renders correctly with real `pending`-only data after removing the
  hardcoded status filter (4 real suggestions on a real workspace, unaffected). The actual
  `NeedsInfoCard` visual/interaction states remain unverified against a real API response — flag
  this to whoever next has a workspace that produces one.

## Fabrication guard fix, match band, pre-analysis coverage — 2026-08-05

Found and fixed a real, live integrity bug: `FabricationGuardService` had exactly 4 checks (numbers,
years, multi-word capitalised org phrases, credential language) and **none of them could catch a
bare single-word skill/technology token** — the org check specifically requires two-or-more
capitalised words in sequence, so "Git", "Unity", "Cypress", "C#" sailed through untouched. A
cross-workspace audit of this dev database found 44 real suggestions claiming a keyword absent from
the resume, 12 of them already `status: "accepted"` — i.e. already live on real resume versions
(Cypress, Redux, Zustand, MQTT, Unity, C#, Git). This is now fixed server-side; see below for what
changed in the API surface, and — important — a gap in the frontend `NeedsInfoCard` built in the
section above that this fix newly exposes.

- **`AiSuggestion`/`SuggestionResponse` gained `needsDirectEdit: boolean`.** This is the one field
  the previous `NeedsInfoCard` build didn't know to look for, and it changes the correct UI behavior
  for a subset of `needs_info` rows. When `true`, the violation is an unsupported skill/technology
  claim (e.g. the model tried to add "Unity" or "Cypress" with zero evidence in the resume) — **the
  existing `provide-detail` text-box flow can never resolve this case**, because it's checked against
  `resume.rawText`, which is frozen at initial upload and can never contain a skill added later, no
  matter what the user retypes. Confirmed live: resubmitting text that still mentions the unsupported
  skill returns the exact same `needs_info` state every time — retrying is not a dead end due to a
  bug, it's structurally impossible via that path.
  - ⚠️ **Action needed in `NeedsInfoCard`**: branch on `needsDirectEdit`. When `true`, hide (or
    de-emphasize) the text-box/Save flow and instead show a link to the resume's direct
    section-edit page (wherever `PATCH /resumes/:resumeId/sections/:sectionType` is already wired up
    in this app) with copy like "This skill isn't on your resume — add it directly if it's true, then
    re-run suggestions," alongside the existing Skip button. When `false`, every existing behavior
    from the section above is unchanged (missing number/year/org/credential — `provide-detail` is
    still the right next step there).
  - Real example response, `missingFact` for this case specifically calls out the skill by name and
    explains why retyping won't work — safe to render directly, no need to compose your own copy:
    ```json
    {
      "status": "needs_info",
      "needsDirectEdit": true,
      "missingFact": "Unity isn't evidenced anywhere in your resume — add it to your Skills section directly if it's genuinely true, then re-run suggestions. Retyping text here can't fix this.",
      "exampleValue": null
    }
    ```
    `exampleValue` is always `null` on a `needsDirectEdit: true` row (there's no "illustrative
    example" to show — the model's invented text WAS the violation, not a fact it needs supplementing).
- **`AtsReport`/report response gained `matchBand`**: `{ band: "low" | "fair" | "strong",
  requiredMet: number, requiredTotal: number }`, computed from the same `keywords` array the report
  already returns (no new fetch). `band` is `"low"` below 35% of required keywords matched, `"fair"`
  35-70%, `"strong"` 70%+ (or trivially `"strong"` when the JD has zero required keywords — nothing
  to fail). `null` only on the nested `original` report (which intentionally carries no keyword list,
  per the section above). **Use this to reframe the score header**: "You meet 2 of 6 required
  skills" lands very differently than "27/100" for the same underlying data — a low score is a
  fit signal for THIS job, not a grade on the resume. Confirmed live on the Unity-mismatch workspace:
  `matchBand: { band: "low", requiredMet: 0, requiredTotal: 4 }`.
- **The existing `/resumes/:resumeId/match/:jdId` endpoint gained a `coverage` field**: `{
  requiredTotal, requiredMatched, requiredMissing, preferredTotal, preferredMatched,
  missingRequiredKeywords: string[] }`. This endpoint already exists, is NOT credit-gated, and this
  app doesn't appear to call it anywhere yet — worth surfacing before the "Analyze" button (or
  before workspace creation) as a **pre-analysis warning** for a badly-matched JD, so a user sees "4
  required skills missing: Unity, C#, Git, Firebase" before spending real analysis credits on a
  match that can't legitimately score well no matter what optimization runs afterward. Confirmed
  live on the same workspace: `coverage: { requiredTotal: 4, requiredMatched: 0, requiredMissing: 4,
  preferredTotal: 8, preferredMatched: 0, missingRequiredKeywords: ["Unity","C#","Git","Firebase"] }`.
  ⚠️ Known tradeoff, not fixed in this round: this endpoint's AI keyword-equivalence pass isn't
  cached per-call, so surfacing it more prominently will genuinely increase call volume — small cost
  today, worth revisiting if this becomes a high-traffic pre-analysis gate.
- Auth: standard JWT guard on all of the above, no new roles.
- Backend-side: a read-only audit script found and reported (not auto-reverted) 12 already-accepted
  suggestions with unevidenced skill claims across this dev database — those specific resume
  versions may still contain a claim like "Cypress" or "Redux" that predates this fix. Not a frontend
  concern, flagged here only so nobody's confused if an old accepted suggestion still shows a skill
  the guard would now block.
- Built the same day, see "NeedsInfoCard needsDirectEdit, match-band badge, pre-analyze warning"
  below — the bullet that used to say "not built yet" here is now stale, kept only for the
  endpoint-shape documentation above.

## NeedsInfoCard needsDirectEdit, match-band badge, pre-analyze warning — 2026-08-05 (built same day)

Built the three frontend pieces the section above left as doc-only. Live-verified end-to-end via
Playwright against the real dev backend — including one real paid `analyze` round trip through the
new warning modal's "Analyze anyway" path, deliberately not repeated.

- `AiSuggestion` gained `needsDirectEdit: boolean` (real, always-present field). `NeedsInfoCard`
  (`features/suggestions/components/needs-info-card.tsx`) now branches on it: `true` renders
  `missingFact` verbatim (it's already a complete sentence — do NOT wrap it in the existing "We
  couldn't verify {missingFact} from your resume" template, which would double up) plus an "Edit
  resume" button (`Button asChild` + `Link` to `/resumes/{resumeId}`, same proven pattern as
  `app/not-found.tsx`) alongside the existing Skip button — no textarea, no Save, no "e.g." example
  box (`exampleValue` is always `null` here). `false`/absent is byte-for-byte the original
  textarea-and-Save flow, untouched.
- Threading `resumeId` down to `NeedsInfoCard` required a small prop chain:
  `workspace-view.tsx` → `suggestions-tab.tsx` → `suggestion-card.tsx` → `needs-info-card.tsx`,
  mirroring the exact pattern `resumeId` already took one line above for `ReportTab` in
  `workspace-view.tsx`. Confirmed live via a regression check on a real workspace's suggestions
  list (4 real pending suggestions rendered correctly, summary line intact) after this change.
- ⚠️ **Not live-verified**: no workspace in this dev database currently has a live
  `needs_info`/`needsDirectEdit: true` row (checked every workspace's `GET .../suggestions` before
  building). Consistent with the base `needs_info` build's own accepted gap, didn't force one via a
  speculative ~21-credit analyze run with no guarantee of triggering the fabrication guard on a
  skill claim specifically. Confirmed instead via clean `tsc`/`eslint`/`next build` and the live
  regression check above. The `needsDirectEdit: true` visual/interaction states remain unverified
  against a real API response — flag to whoever next has a workspace that produces one.
- `AtsReport` gained `matchBand: { band: "low"|"fair"|"strong", requiredMet, requiredTotal } |
  null`. `ScoreCard` (`features/report/components/score-card.tsx`) renders a tone-coded
  `MatchBandBadge` (danger/warning/success for low/fair/strong, a local file-scoped helper — same
  precedent as the existing `ScoreDelta`, not promoted to a shared `components/ui/` component since
  it's single-use) next to the "ATS compatibility" heading, plus a "You meet {requiredMet} of
  {requiredTotal} required skills" line underneath — deliberately not softened for a low band, per
  the feature's own intent. Confirmed live across all three real band values found in this dev
  database: low (`0 of 4`, an actual Unity-mismatch workspace), fair (`2 of 3`), strong (`2 of 2`).
- New (from scratch — confirmed via repo-wide grep before building that nothing referenced this
  endpoint at all yet, no dead scaffolding): `features/workspaces/match.types.ts`
  (`MatchResult`/`MatchCoverage`, typed to the full real Postman-confirmed response even though
  only `coverage` is consumed), `features/workspaces/match.api.ts` (`matchApi.check`, no request
  body, no Idempotency-Key, confirmed live 201 Created), `features/workspaces/hooks/use-check-match.ts`
  (a plain `useMutation`, deliberately not a `useQuery` — must only fire on an actual Analyze click,
  never just because the "Ready to analyze" card mounted, per the endpoint's own doc-flagged call-
  volume cost even though it isn't credit-gated).
- `AnalyzeButton` (`features/workspaces/components/analyze-button.tsx`) now sequences: credit
  pre-check (unchanged, fires first — no reason to call `/match` if the user can't afford analysis
  regardless) → `/match` check → if `requiredMatched / requiredTotal < 0.35` (a **deliberate reuse
  of the backend's own `matchBand` "low" cutoff**, for consistency between the two features rather
  than an arbitrary new number), open a `useState<MatchCoverage | null>`-backed confirm modal
  (object state, not boolean, unlike `recalculate-score-button.tsx`'s static-copy confirm — this
  modal must render the actual mismatch) showing the real missing keywords and counts, Cancel vs.
  "Analyze anyway"; otherwise (including ANY `/match` error — a deliberate silent fallback, since
  this is a soft advisory check that must never block the one action that actually matters)
  proceeds straight into the same `analyze.mutate(...)` flow as before, unchanged latency for the
  common well-matched case. `resumeId`/`jobDescriptionId` threaded into `AnalyzeButton` from
  `app/(app)/workspaces/[id]/page.tsx`, where the full `workspace` object was already in scope.
  Confirmed live, full round trip: a real badly-matched workspace (Unity JD against a non-Unity
  resume) correctly opened the modal with real copy ("This role needs Unity, C#, Git, Firebase...
  You meet 0 of 4 required skills"), Cancel left credits untouched, "Analyze anyway" debited
  exactly 21 credits and navigated to the real run-progress URL. A real well-matched workspace
  correctly skipped the modal entirely and went straight to analyze. Three throwaway test
  workspaces created for this verification were deleted afterward, dev account left clean.
- The documented `409 JD_NOT_ANALYZED` silent-fallback path is practically unreachable live (a
  workspace's `jobDescriptionId` always already points to an analyzed JD, since
  `CreateWorkspaceDialog` only allows picking `status === "analyzed"` jobs) — verified by code
  review only, the one accepted verification gap for this feature.

## "New analysis" modal redesign — 2026-08-05

A user-supplied design doc addressed real problems with the resume/JD picker (`features/workspaces/
components/create-workspace-dialog.tsx`): duplicate-looking resume/JD rows with no differentiating
metadata, a pale ambiguous-looking submit button with no cost shown, no pre-analysis fit signal.
The doc was written without access to this codebase — it invented `src/features/analysis/...` paths,
`useDashboard()`/`useResumes()`/`useJobs()` hooks, and field names (`jdId`, `job.title`,
`resume.headline`, a flat `band` on the match-check response) that don't exist here. Translated to
real code and live-verified end-to-end via Playwright, including one real free workspace-creation
round trip through the new post-create navigation.

- ⚠️ **`resume.headline` doesn't exist and isn't cheaply obtainable** — `GET /resumes` returns only
  bare metadata (`id, title, status, pageCount, wordCount, fileSize, language, parseError,
  createdAt`), no summary/headline text. Fetching each resume's summary section separately just to
  render a picker row would be a real N+1 cost. Dropped entirely — rows are differentiated by title
  + relative upload date + page count + status instead, which turned out to already solve the
  screenshot's real complaint: the three "JENKINS RAJ…" resumes in this dev DB have genuinely
  different (if similarly-prefixed) titles — "JENKINS RAJ RESUME FT" / "JENKINS RAJ ATS 2025" /
  "JENKINS RAJ  RESUME" — that were simply getting visually truncated in the old bare-title-only
  row; the redesign didn't need a "most recent" tag to fire in this data to fix the actual bug.
- ⚠️ **The real `/resumes/:id/match/:jdId` response has no `band` field** (`coverage:
  {requiredTotal, requiredMatched, requiredMissing, preferredTotal, preferredMatched,
  missingRequiredKeywords}` only, confirmed live and already known from the pre-analyze-warning
  work earlier this round) — the doc's assumed flat `{requiredMet, requiredTotal, band}` shape
  doesn't exist. Classification is client-side via a new shared `classifyMatchCoverage()`
  (`features/workspaces/match.utils.ts`), using the exact same 0.35/0.70 thresholds as
  `AtsReport.matchBand`'s real server-side definition — `AnalyzeButton`'s own pre-existing inline
  threshold check was refactored to use this same function, so the pre-analysis modal preview, the
  pre-Analyze-click warning, and the post-analysis report badge can never silently disagree.
- `MatchBandBadge` (previously file-local/unexported inside `score-card.tsx`) is now a shared
  `components/ui/match-band-badge.tsx`, exporting the canonical `MatchBandTier = "low"|"fair"|
  "strong"` type too — `AtsReport.matchBand.band` now references this type rather than an
  independently-declared identical union that could drift from it. `components/ui/` importing
  nothing from `features/*` (and `features/report/`, `features/workspaces/` importing FROM
  `components/ui/`) keeps the dependency arrow pointing the one correct direction.
- Both `ResumePicker`/`JobPicker` (`features/workspaces/components/`) keep their existing native
  `<input type="radio" className="sr-only" name="...">` + `<label>` pattern rather than switching
  to the doc's hand-rolled `<button role="radio" aria-checked>` — native radios already get grouped
  arrow-key nav and automatic disabled-row-skipping for free; confirmed live via Playwright
  (`ArrowDown` on a focused resume radio correctly moved the checked state to the next row).
  `emptyHint: string` was dropped from both pickers' props (real `EmptyState` component used
  internally instead) and both now receive the FULL unfiltered resume/job list instead of a
  pre-filtered "ready only" list, so they can render disabled-with-reason rows (mapping the real
  6-value `ResumeStatus`/3-value `JobStatus` unions) instead of hiding not-yet-ready items.
- Job description duplicate detection (grouping by normalized position+company, confirmed live on
  this dev DB's real duplicate pair — two identical "Full Stack Developer — Avanza Solutions" JDs
  created ~2 minutes apart) labels each "1 of 2"/"2 of 2" rather than a single "most recent" tag —
  deliberately richer than the resume side, since a user may want an *older* duplicate (e.g. one an
  earlier workspace already ran against), not always the newest.
- New `features/workspaces/hooks/use-match-preview.ts` (`useMatchPreview`, a `useQuery`) is
  additive alongside the existing `useCheckMatch` mutation (built earlier this round for
  `AnalyzeButton`'s own imperative on-click check) — not a replacement. The preview needs reactive
  refetch-on-selection-change; `AnalyzeButton` needs a one-shot imperative check; same underlying
  `matchApi.check` call, two different hook shapes for two different call patterns.
- **Real, intentional behavior change, not just a visual redesign**: `CreateWorkspaceDialog` now
  navigates to `/workspaces/{new-id}` after creating a workspace (`router.push`, mirroring how
  `use-analyze.ts` already does post-mutation navigation elsewhere in this feature) instead of just
  closing the dialog and leaving the user on the `/workspaces` list. Confirmed live: creating a
  workspace is genuinely free (credit balance unchanged, `1897 → 1897`) and the browser lands
  directly on the new workspace's "Ready to analyze" screen.
- Footer cost line and the low-balance `/billing` link are purely informational — `ANALYZE_COST`
  (now exported from `analyze-button.tsx` instead of a private module constant, so both files share
  the one real value) is what *Analyze* costs later, not what creating the workspace costs (which
  is free); confirmed live the "Create workspace" button stays enabled regardless of credit balance
  — gating a free action on a later paid action's cost would itself be a dead end.
- Confirmed live: search boxes correctly appear only when a list exceeds 4 items (3 resumes → no
  search box; 6 jobs → search box shown) and correctly filter in place (searching "Unity" against
  the 6 real jobs left only the one real Unity Developer JD visible).
- Confirmed live at a 375×667 mobile viewport: the modal's sticky footer (cost line + Create button
  + disabled-reason caption) stays within the viewport without needing to scroll past it, while the
  resume/job lists scroll independently above it — achieved purely via `Modal`'s existing
  `className` override (`max-w-lg max-h-[90vh] overflow-y-auto`) plus the dialog's own internal
  `sticky bottom-0` footer div; `components/ui/modal.tsx` itself (shared by many unrelated
  consumers app-wide) was not touched.
