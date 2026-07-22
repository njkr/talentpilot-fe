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
