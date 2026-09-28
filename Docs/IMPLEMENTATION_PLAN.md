# AssignMe — Detailed Implementation Plan (Phased)

Source: `Docs/ASSIGNME Product Requirements Document.md` (18 sections, serious academic platform rewrite) + `README.md`
Repo: `theresaanichukwu-boop/Assign-me` (private, `main`)
Date: 2026-09-28

Core rule: **Context before generation → Evidence before claims.**
Core flow: Sign Up → Profile → Course → Intelligence → Work Type → Workspace → Research → Build → Review → Save/Resume.
Positioning: workspace/supervisor, not chatbot. No forced Chapter 1–5 — structures adapt by work type, discipline, level, institution, style, lecturer requirements.

---

## Phase 0 — Foundations & Scope Lock

**Goal:** Freeze MVP, lock stack, set up repo.

1. MVP scope (PRD §17):
   - Account + profile, 2–3 intelligences (Nursing + one more), work types (assignment, seminar, topic/objectives, research assist, writing, references), builder for project/seminar/assignment, workspace with memory, basic research/verification/citations, free + Paystack paid + trial preview + usage tracking.
   - Defer: uploads at scale, templates, ref manager, lit-review assistant, editor, slides generator, Word/PDF export, stronger verification (Phase 2); University/Department intelligence (Phase 3).
2. Locked stack (user constraints: Better Auth, Cloudflare R2, Paystack, Resend, no Supabase, no Vercel, local device):

   | Layer | Recommendation | Reason |
   |---|---|---|
   | Website framework | Next.js (App Router) | PRD website requirement; SSR for dashboard/workspaces, SEO landing, API routes for MVP backend |
   | Language + styling | TypeScript + Tailwind CSS | Type safety for work-type/builder/citation logic; fast academic UI iteration |
   | Backend | Next.js API routes / tRPC (Node) | Single deploy on local device for MVP; extract worker only if AI/research queue grows |
   | Database + ORM | Self-hosted Postgres + Prisma | Relational model for works/versions/sources/refs/files/usage; no Supabase per constraint, full local control |
   | Auth | Better Auth (better-auth) | Email/password + verification + reset + sessions + rate-limit; Prisma adapter; admin/organization plugins for Student/Admin/Manager/Support RBAC |
   | File storage | Cloudflare R2 (S3-compatible) | Private bucket + presigned URLs for instructions/guidelines/PDFs/drafts/exports; cheap, predictable |
   | Payments | Paystack | NGN cards/bank/transfer + weekly/monthly/pay-per-project/credits; webhooks drive subscription + trial state |
   | Email | Resend | Verification, reset, receipts, security notices via API + React Email templates |
   | Hosting | Local device (Docker Compose + Caddy + PM2) | No Vercel per constraint; Compose runs web + Postgres + Redis queue; Caddy reverse-proxy/TLS |
   | AI + research | OpenAI-compatible model + Crossref/OpenAlex/Semantic Scholar | Discipline packs + work-type templates + year-range + Nigerian/African prioritization + verification; never invent refs |
   | Validation | Zod | Per-work-type intake, API safety, citation fields |
   | Rejected | Supabase, Vercel, Stripe/Flutterwave | Excluded per constraint; Paystack only for MVP |

3. Repo: `main` protected, `dev` branch, conventional commits, PR template, `.env.example`, `Docs/` versioned. Envs on local device only: dev (`npm run dev`), staging (Compose), prod (Compose + Caddy + PM2). Secrets in `.env` + OS keyring.
4. Exit: ADR signed, GitHub Milestones v0.2-design / v0.3-arch / v0.4-mvp created from this plan.

---

## Phase 1 — Design System (Website, Clean + Easy × Serious + Academic)

PRD §§1,3,12. Must not look like chatbot, portal, or playful site.

1. Tokens: navy/teal primary, warm coral #D95D39 accent, reading neutrals, verified/needs-check states; Inter UI, serif output, mono citations; 16px/1.6; 4pt scale, cards, subtle borders; light-first + print-friendly (Times 12, double, A4).
2. Components (Storybook): website shell + nav (Home, My Work, Research, Tools, References, Profile) + Start New Work; dashboard (Welcome + intelligence + 9 work-type cards); per-work-type intake forms (minimal fields only); workspace (instructions, topic/objectives/RQs, sections, drafts/versions, evidence view, references, review results, progress); citation previews (6 styles) + DOI badges; paywall/meter + trial banner; toasts, empty states, auth forms.
3. Flows (Figma clickable): signup → profile → welcome → choose work type → create/open workspace → research → build steps → review → resume; multi-work list with status; mobile intake/reading first.
4. A11y: WCAG AA, keyboard nav, no AI clichés/excessive headings.
5. Exit: tokens JSON + 15+ Storybook components + Theresa Nursing walkthrough. Preview: `Docs/DESIGN_SYSTEM_PREVIEW.html`.

---

## Phase 2 — Architectural Design

PRD §§2,4,5,6,9,13,15,16.

1. Personalization (3 levels): L1 Student (profile + requirements JSON) → L2 Discipline (`intelligence_id` + versioned pack) → L3 Workspace (work type, topic, objectives, RQs, sections, sources, style, uploads). Composer: base model + discipline pack + work-type template + profile + workspace + requirements.
2. Work-type registry: 9 types (project, seminar, assignment, term paper, essay, lit review, case study, proposal, presentation), each with structure definition, intake schema, builder step list, reviewer checklist. No default Chapter 1–5.
3. Frontend: Next.js App Router, `(auth)` + `(website)/dashboard/works/research/tools/references/profile`, server lists + client editor/chat, React Query/Zustand for workspace memory, evidence view panel.
4. Backend (Better Auth + tRPC/REST): Better Auth for signup/login/verify/reset/sessions; `profile/*`, `intelligences/*` (manager), `works/*` (+ sections/versions/memory), `work-types/*`, `research/*` (search + verify), `citations/*`, `reviews/*`, `files/*` (R2 presigned up/down, key `users/{u}/works/{w}/{f}-name`, 25MB default, PDF/DOCX/TXT/MD/images, MIME + quota checks), `usage/billing/*` (Paystack verify/webhooks), `supportTickets/*`. Zod everywhere, free-tier rate limits, audit logs.
5. DB (Postgres/Prisma): `users`, `profiles`, `disciplines`, `works(id,user,discipline,work_type,title,topic,objectives,rqs,requirements,status)`, `work_sections(id,work,step,content_md,order,version)`, `conversations/messages`, `sources(...verification_status)`, `references(style,in_text,reference_text)`, `files(r2_key,filename,mime,size,purpose)`, `usage`, `plans/subscriptions/payments(provider=paystack)`, `staff_roles`, `tickets`.
6. Evidence engine: query planner (keywords + year range + NG/Africa boost) → retrieval → metadata normalize → DOI/URL check → verified/needs-check labels → claim-source linker → conceptual/theoretical/empirical buckets → evidence view. Hard rule: no invented authors/studies/DOIs.
7. Reviewer engine: rule + LLM checks (structure, quality, evidence, objectives alignment, citation consistency, repetition, missing sections, requirements compliance) → severity report + fix suggestions + optional apply.
8. RBAC: student owns data; admin (MFA) full; manager edits packs; support ticket-scoped, explicit grants, audited. AI intelligences are config, not accounts.
9. Security: hashing, verify/reset via Resend, TLS, ownership checks, private R2 + short-lived URLs + delete cascades, Paystack webhook signature verify, PII minimization.
10. Exit: ADR + ERD + OpenAPI + work-type schemas + prompt-pack schema + RBAC matrix.

---

## Phase 3 — MVP Build (PRD §17 order)

1. P1 Account (Better Auth + Resend): signup/login/logout, verify, forgot/reset, change email/password, delete; receipts/security mail.
2. P2 Profile: CRUD course/uni/dept/level/style/requirements; welcome dashboard.
3. P3 Intelligence: seed Nursing + 1 more; selector; versioned packs; “Intelligence ready” banner.
4. P4 Work types + Builder: 9-type selector, minimal intakes, create workspace; builder steps per type (project/seminar/assignment first, others scaffolded); regenerate/edit/expand/paraphrase/summarize/shorten.
5. P5 Workspace: My Work list, per-work memory, sections/versions, uploads to R2, save/resume/delete, isolation between works.
6. P6 Research + Citations: search (Crossref/OpenAlex), year filter, NG/Africa boost, verification badges, evidence view; APA7 first + consistency check, then other 5 styles.
7. P7 Reviewer (basic): structure + citation + missing-section checks free/trial; advanced (evidence, alignment, full report) paid-gated.
8. P8 Monetization (Paystack + Resend): free caps (topics/objectives/basic help never paywalled), trial/preview (1 research run or review), paid gates (deep research, full builds, advanced review, large docs), meter + upgrade prompts, webhooks, receipts.
9. Exit: Theresa Nursing demo end-to-end (signup → seminar built with verified sources → reviewed → resumed).

---

## Phase 4 — Quality, Integrity, Compliance

* Writing QA: level-appropriate, discipline terms, evidence-backed; lint fake cites, unsupported claims, filler.
* Ref QA: DOI checks, dedupe, 6-style tests.
* Tests: unit (citations, work-type schemas, packs), integration (auth→work→research→build→review→billing), e2e Playwright (signup to resume), load (AI/research queue), security (OWASP, RBAC, R2 ownership, webhook forgery).
* Analytics: activation, task start, discipline fit, return-to-work, trial→paid conversion.

---

## Phase 5 — Launch on Local Device

* Compose: `web` + `postgres` + `redis`; Caddy reverse-proxy + TLS; PM2/cluster; backups (pg_dump + R2 metadata export); restore drill.
* Private beta (e.g. UNN Nursing): collect real lecturer requirements, refine Nursing pack.
* Pricing test: weekly/monthly/pay-per-work/credits — pick 2. Gate Phase 2 on retention + willingness to pay.

---

## Phase 6 — Post-MVP (PRD §17)

* Phase 2: more disciplines, uploads scale, templates, ref manager, lit-review assistant, editor, slides, Word/PDF export (outputs to R2), stronger verification, advanced workspace.
* Phase 3: University → Faculty → Department intelligence + long-term academic memory.

---

## Next Steps

1. Approve 2 starter intelligences + 3 builder flows.
2. Scaffold `web/`, `db/` (Prisma), `prompts/`, `e2e/` on `dev`.
3. Build Figma → Storybook → P1+P2 slice.
