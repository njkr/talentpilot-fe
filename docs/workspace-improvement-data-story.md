# Data story: workspace suggestions, before/after score & needs_info

Companion to the CLAUDE.md section "Workspace suggestions: more suggestions, real before/after
score, needs_info — 2026-08-04" and the handoff prompt already given. That section is the technical
contract; this document is the **narrative** — every field the backend now returns, mapped to the
question it answers for the user, so nothing gets left on the floor when the UI is built. All
example values below are real, captured live against actual workspaces in this dev environment —
nothing here is invented for illustration (the one exception, `needs_info`'s own `exampleValue`
field, is explicitly the AI's invention and is labeled as such everywhere it appears).

## The arc

A user lands on a workspace after analysis and should be able to answer, in order, four questions
just by reading the screen — no other feature in this app currently answers all four at once:

1. **"Where do I stand?"** → the score, right now.
2. **"Why that score, specifically?"** → the seven-component breakdown + strengths/weaknesses.
3. **"What do I do about it?"** → the suggestion list, including the ones that need something from me.
4. **"Did it actually work?"** → the before/after comparison, after applying suggestions and rescoring.

Every field below exists to answer one of these four. Design the layout around the questions, not
around the JSON shape.

## Question 1 — "Where do I stand?"

`GET /workspaces/:id/report` → `overallScore` (0-100). That's the single number for the top of the
screen. Real example: a resume analyzed cold scored **69**; after applying two suggestions and
rescoring, the same resume scored **70** — real, small, honest movement, not a manufactured jump.
Never imply or hardcode a target range ("your score will hit 90+") — the whole point of rebuilding
this feature was to stop pretending, per the product decision that shaped it.

`resumeVersion` on the report tells you which version of the resume earned that score — surface it
subtly (e.g. "Scored against version 4 of your resume") so a user who's made several edits since the
last score isn't confused about staleness.

## Question 2 — "Why that score, specifically?"

This is the most underused data in the current UI — today's `score-card.tsx`/`score-breakdown.tsx`
render `overallScore` but the other eight fields on the same response carry the actual explanation:

- **`scoreBreakdown`** — an array of exactly 7 entries, one per scoring dimension:
  `{ component, score, weight, contribution }`. `component` is one of `keyword | semantic |
  experience | education | project | format | grammar`. `weight` is fixed
  (`0.3/0.2/0.15/0.1/0.1/0.1/0.05`) and `contribution = score × weight` — the breakdown IS the math
  behind `overallScore`, not a separate opinion. This is the natural candidate for a stacked bar or
  radial chart: it's the one place a user can see *why* the number is what it is, component by
  component, and which lever (keyword coverage vs. formatting vs. semantic fit) is worth pulling.
- **Which components are pure code vs. AI-graded is worth knowing when writing copy around this
  chart**: `keyword` (30%), `semantic` (20%), and `format` (10%) — 60% of the score — are
  deterministic, no AI judgment involved at all. `experience`, `education`, `project`, `grammar`
  (the remaining 40%) are AI-graded but plugged into the same fixed formula, never an AI-stated
  overall number. This is *why* the score is trustworthy enough to build a before/after feature
  around — worth a line of copy somewhere ("your score is calculated, not guessed") if there's room.
- **`strengths` / `weaknesses` / `recommendations`** — three separate string arrays, AI-written,
  meant to be read as three distinct lists (not merged into one feed). Real example from a live run:
  `weaknesses: ["Partial proficiency in PHP, which is a required skill", "Limited experience with
  SQL databases", "Lacks quantifiable achievements in project descriptions", "Few quantified
  achievements — add numbers (%, $, scale) to your bullets"]` — notice weaknesses can be specific
  (named skill gaps) or systemic (a pattern across the whole resume); don't force one visual
  treatment for both.
- **`keywords`** — the full per-keyword match list: `{ keyword, canonical, category, importance,
  status, evidence, foundIn, suggestion }`. `status` is `matched | partial | missing`, `importance`
  is `required | preferred | nice_to_have`. This is what `keywordScore` (one line of
  `scoreBreakdown`) is actually made of — a `required` + `missing` keyword is a very different
  signal from a `nice_to_have` + `missing` one, and today's UI (per the earlier design read) doesn't
  visually distinguish them. `evidence` (when non-null) is the literal resume text that satisfied the
  match — genuinely useful as a tooltip/expand, since it's the receipts for why something is
  "matched." `foundIn` is which resume sections contributed.

## Question 3 — "What do I do about it?"

`GET /workspaces/:id/suggestions` → up to 20 rows per analysis (raised from 12 this session),
`{ id, sectionType, itemIndex, bulletIndex, oldText, newText, reason, impact, keywordsAdded, status,
missingFact, exampleValue }`.

- **`reason`** is the one field worth never hiding — it's the AI's stated justification tied to a
  specific job requirement, e.g. `"Highlights strong experience with NestJS and REST APIs, both
  required skills."` It's what turns "here's a diff" into "here's *why* this diff matters to this
  specific job" — the JD-awareness is the whole value proposition of AI suggestions over a generic
  resume linter.
- **`impact`** (`high | medium | low`) is pre-computed for you — use it for sort order and visual
  weight (badge color, size), not just an afterthought label.
- **`keywordsAdded`** ties a suggestion back to Question 2's keyword list — a suggestion that adds
  `["NestJS", "REST APIs"]` is directly closing gaps visible in the keyword table. Cross-referencing
  the two (e.g. clicking a missing keyword highlights the suggestion(s) that would add it) is a real,
  buildable connection between two parts of this data model that currently live in separate tabs.
- **`status: "needs_info"`** is new. Real example, captured live:
  ```json
  {
    "oldText": "Led a small team on the checkout redesign.",
    "newText": "Led a team of 6 engineers on the checkout redesign, cutting cart abandonment by 18%.",
    "status": "needs_info",
    "missingFact": "a specific metric or number",
    "exampleValue": "18%"
  }
  ```
  The story here: the AI found a genuinely good rewrite, but it had to invent the "6 engineers" and
  "18%" to make it compelling — neither exists in the real resume. Rather than silently discarding a
  good idea (the old behavior), the product now asks the user directly: *do you actually know this
  number?* `missingFact` is the question, `exampleValue` is "here's the shape of an answer that would
  work" — never a fact. **Both `newText` and `exampleValue` on a `needs_info` row are illustrative
  only** — this is the one status where `newText` is not safe to render as an applicable diff.
  `POST /workspaces/:id/suggestions/:suggestionId/provide-detail` (`{ newText }`) is how the user
  answers — submit their own real number/fact, it's re-checked by the same guard, and it either
  becomes a normal `pending` suggestion or comes back `needs_info` again with a fresh example if
  their answer still can't be verified against the resume.
- The other statuses (`pending`, `accepted`, `rejected`, `stale`) are unchanged from before this
  session — `stale` specifically means the user hand-edited the underlying bullet since the
  suggestion was generated, so the suggestion no longer has a safe anchor to apply against.

## Question 4 — "Did it actually work?"

`GET /workspaces/:id/report`'s `original` field, present alongside every other field from Question
1-2 above: the exact same report shape, but for the very first analysis this workspace ever ran —
untouched by any suggestion the user has since applied. `null` until at least one rescore has
happened (i.e., while the current report *is* the original — there's nothing to compare yet).

This is the payoff screen: put the current report's `scoreBreakdown` next to `original`'s
`scoreBreakdown`, component by component, not just `overallScore` next to `overallScore` — a user who
added a missing required keyword should be able to see the `keyword` component's score move
specifically, which is a more convincing "this worked" moment than one aggregate number changing by
a point. Real captured example: `keyword 85→85` (unchanged — the two applied suggestions didn't add
new keywords), `semantic 41→44` (moved — the suggestions did make the phrasing more semantically
aligned with the JD), `overallScore 69→70`. The story a good UI tells here is "this specific thing
you did moved this specific number" — not just "your score went up."

`POST /workspaces/:id/rescore` is how the user gets from `original`-only to a real `original` +
current comparison — it's genuinely new paid AI work (a fresh embedding pass + AI re-grading), priced
separately (5 credits by default, admin-configurable, same knob as `analyzeCost`). It's fire-and-poll,
not fire-and-forget: `{ "queued": true }` comes back immediately, but the new report lands
asynchronously — same polling pattern as watching a fresh analysis run. `409
NO_CHANGES_TO_RESCORE` means the resume hasn't changed since the last score — the UI's job is to
make this state (button disabled, not an error toast) the common case, since it's genuinely wasteful
to let someone pay to re-score an unedited resume.

## What NOT to build from this data

- Don't build a progress bar or percentage toward "100" — there is no target, by design (see Question
  1). A meter that implies a finish line misrepresents a feature whose entire premise is honesty.
- Don't treat `needs_info` as an error state (red, alarming) — it's closer to a form validation nudge
  than a failure. The `missing-fields-banner.tsx` precedent (calm, inline, dismissible) is the right
  emotional register, not `run-failed.tsx`'s warning-triangle treatment.
- Don't collapse `strengths`/`weaknesses`/`recommendations` into one generic "feedback" list — they're
  three different AI-authored judgments (what's working / what's not / what to do) and reads better
  kept visually distinct.
