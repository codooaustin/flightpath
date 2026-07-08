---
name: faa-pilot-certification
description: >-
  Extends Flight Path FAA pilot certification features using project data files
  and official faa.gov links. Use when adding milestones, certification
  progress, age requirements, logbook help tooltips, FAA resources, or pilot
  training guidance in this repo.
---

# FAA Pilot Certification (Flight Path)

Read [docs/faa-integration.md](../../docs/faa-integration.md) first.

## Source of truth

- Milestones: `src/lib/data/pilot-milestones.json`
- Help text + URLs: `src/lib/data/faa-resources.ts`
- Calculations: `src/lib/calculations/certification.ts`, `flight-hours.ts`
- UI: `src/components/certification/faa-help-tip.tsx`

## Rules

1. **Do not invent FAA requirements.** Use values from `pilot-milestones.json` or cite official pages.
2. **Link to `.gov`, don’t copy the FAA corpus.** Hub: https://www.faa.gov/pilots
3. **Add copy in `faa-resources.ts`**, not inline in page components.
4. **Keep tooltips educational** — summary, short bullets, external link via `FaaHelpLink`.
5. **Document approximations** in `docs/faa-integration.md` when logic simplifies Part 61.

## Common tasks

**New milestone:** Update JSON + `FAA_RESOURCES` + calculation helpers if needed.

**New tooltip:** Add `FaaResource` entry; use `FaaHelpTip` or `FieldHelpTip`.

**Dashboard guidance:** Update `getRelevantFaaResources()` in `faa-resources.ts`.

## Preferred FAA URLs

- https://www.faa.gov/pilots
- https://www.faa.gov/pilots/become
- https://www.faa.gov/pilots/become/student_cert
- https://www.faa.gov/pilots/medical_certification/get
- https://www.faa.gov/pilots/training
- https://www.faa.gov/pilots/safety
- https://www.faa.gov/pilots/rights

## Do not

- Duplicate FAA content in new markdown files
- Hardcode hour/age minimums in TSX
- Present app progress as legally binding certification status
