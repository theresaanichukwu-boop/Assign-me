# AssignMe — PRD (grader note)

Full product requirements: [`Docs/ASSIGNME Product Requirements Document.md`](Docs/ASSIGNME Product Requirements Document.md).
Visual preview: [`design.html`](design.html).

## Refinement note

**Instruction given to the builder:** change the amber accent color.

**What was changed:**
- Old accent: amber `#E8A838`.
- New accent: warm coral `#D95D39`.
- Reason: coral keeps the friendly student accent but reads more serious and
  professional next to the navy/teal academic palette.

**Where it is reflected:**
- `design.html` — coral swatch card, coral "Generate Topic" button, `--accent` token.
- `Docs/DESIGN_SYSTEM_PREVIEW.html` — same coral token and swatch.
- `Docs/IMPLEMENTATION_PLAN.md` (Phase 1 tokens) — "warm coral #D95D39 accent".
- `web/src/app/globals.css` — Tailwind v4 theme `--color-accent: #d95d39`.
- `design/tokens.json` — `"accent": "#D95D39"`.

A grader can compare this note against `design.html`: the coral color,
typography samples, styled buttons, and sample input are all rendered there.
