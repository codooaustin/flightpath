# FAA Integration — Flight Path

Flight Path surfaces FAA pilot certification guidance in the app. It does **not** replace official FAA publications or legal requirements.

**Official hub:** [FAA Pilots portal](https://www.faa.gov/pilots)

---

## Principles

1. **Link out, don’t duplicate.** Prefer official `.gov` URLs over copying large FAA corpora into the repo.
2. **Structured data drives the UI.** User-facing copy and links live in code, not scattered in components.
3. **Educational, not legal.** Tooltip text is simplified guidance. Always link to FAA sources for authoritative requirements.
4. **Never invent Part 61 numbers.** Hour minimums and ages must match `pilot-milestones.json` or an cited FAA page.

---

## Source of truth (runtime)

| File | Purpose |
|------|---------|
| [`src/lib/data/pilot-milestones.json`](../src/lib/data/pilot-milestones.json) | Milestone IDs, FAA hour minimums, typical ranges, minimum ages, `track_progress`, instrument sub-requirements |
| [`src/lib/data/faa-resources.ts`](../src/lib/data/faa-resources.ts) | Tooltip summaries, bullet details, official URLs, logbook field help, `getRelevantFaaResources()` |
| [`src/lib/calculations/certification.ts`](../src/lib/calculations/certification.ts) | Age, milestone progress, achievements, career markers |
| [`src/lib/calculations/flight-hours.ts`](../src/lib/calculations/flight-hours.ts) | Aggregates logged flight totals |

---

## UI components

| File | Purpose |
|------|---------|
| [`src/components/certification/faa-help-tip.tsx`](../src/components/certification/faa-help-tip.tsx) | `FaaHelpTip`, `FaaHelpLink`, `FaaGuidancePanel`, `FieldHelpTip` |

**Used on:** Dashboard (Flight Hours, Certification & Age), Logbook (header + hour fields), Settings (date of birth).

---

## Key FAA URLs (prefer these)

| Topic | URL |
|-------|-----|
| Pilots hub | https://www.faa.gov/pilots |
| Become a pilot | https://www.faa.gov/pilots/become |
| Student pilot certificate | https://www.faa.gov/pilots/become/student_cert |
| Medical certification | https://www.faa.gov/pilots/medical_certification/ |
| Part 61 (pilot certification) | https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61 |

Use milestone-specific pages when they exist (e.g. student cert). Use `/pilots/become` or `/pilots` as fallback for higher certificates.

---

## Known approximations (document when changing logic)

| Feature | Approximation |
|---------|----------------|
| Instrument rating — PIC cross-country | Uses `min(pic, crossCountry)` from logbook totals; no dedicated `cross_country_pic_time` column yet |
| Mission unlocks | Hour milestones are **display only**; roadmap missions are still manually completed |
| First solo hour target | Uses `typical_hours_range[0]` (15 hrs) when `faa_minimum_hours` is null |
| Student pilot milestone | `track_progress: false` — shown via `getRelevantFaaResources()` when total hours &lt; 30 |

---

## Adding a milestone

1. Add entry to `pilot-milestones.json` with stable `id`, `minimum_age`, hour fields, `track_progress`.
2. Add matching entry to `FAA_RESOURCES` in `faa-resources.ts` with summary, details, and official `url`.
3. If the dashboard should show sub-requirements, extend `getInstrumentRequirementProgress()` or add a similar helper in `certification.ts`.
4. Wire UI only through existing help components — avoid hardcoding FAA copy in TSX files.

---

## Adding help text or tooltips

1. Add or update an `FaaResource` in `faa-resources.ts`.
2. For logbook field labels, add to `LOGBOOK_FIELD_HELP`.
3. Use `FaaHelpTip` / `FaaGuidancePanel` in the page component.
4. Update `getRelevantFaaResources()` if the resource should appear automatically on the dashboard.

---

## Out of scope (future)

- Full Part 61 requirement engine
- ForeFlight / FAA logbook import
- `certificates` table (issued certs with expiration)
- `flight_media` linking Hangar photos to flights
- Auto-unlocking missions from logged hours

---

## Agent / contributor checklist

When changing certification or FAA-related features:

- [ ] Read this doc and the two data files above
- [ ] Cite an official FAA URL for any new requirement text
- [ ] Keep tooltip copy concise (summary + bullets + link)
- [ ] Note new approximations in this doc
- [ ] Do not add a second markdown copy of FAA requirements elsewhere in the repo
