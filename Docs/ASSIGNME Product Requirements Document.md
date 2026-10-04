# ASSIGNME

## Product Requirements Document

**Product:** AssignMe
**Product Type:** AI academic assistant and academic work platform (app)
**Primary Users:** University and college students
**Business Model:** Freemium with free trial / limited premium preview
**Core Idea:** An AI academic assistant that understands the type of academic work, researches relevant evidence, helps students build it, and reviews the final work.
**Positioning:** A personal academic workspace and supervisor, not a normal chatbot or assignment writer.

---

# 1. PRODUCT OVERVIEW

AssignMe is an AI-powered academic workspace for university and college students.

It helps students research, build, and review serious academic work — not just chat or generate text.

Unlike a general AI chatbot, AssignMe understands:

* Who the student is
* What they study and at what level
* Which institution and requirements apply
* What type of academic work they are doing
* What evidence supports the work

The core flow is:

**Sign Up → Academic Profile → Course → Academic Intelligence → Work Type → Workspace → Research → Build → Review → Save/Resume**

Example:

**Theresa's AssignMe**
**Course:** Nursing
**University:** University of Nigeria
**Level:** Final Year
**Citation Style:** APA 7

> Welcome back, Theresa. Your Nursing Academic Intelligence is ready. What are you working on today?

---

# 2. USERS AND ROLES

Clearly separate **human users** from **AI Academic Intelligence**.

## 2.1 Student (primary user and customer)

Students sign up with name, email, and password, then create an academic profile (course, university, department, level).

Students can:

* Create and manage academic profile and preferences
* Select course/field of study
* Create and manage academic work of any supported type
* Generate topics, objectives, and research questions
* Run guided research and manage sources/references/citations
* Build work step by step and save versions/drafts
* Run Academic Review on completed work
* Upload instructions, guidelines, drafts, and reference PDFs
* Save, resume, and delete work
* Manage account, view usage/subscription, upgrade, trial premium features

Each student's work is private, visible only to the student and authorized staff when necessary for support or administration.

## 2.2 Admin

Manages the platform:

* Student accounts and access, staff roles/permissions
* Courses, disciplines, intelligence configurations
* Plans, trials, subscriptions, payments (Paystack), content, settings
* Usage, reports, analytics, system issues

Admin access must be protected (MFA, audit logs).

## 2.3 Academic Intelligence Manager

Creates and maintains discipline intelligence (terminology, structures, research approaches, source types, guidance, QA of AI responses). Not a human professor account — the intelligence itself is AI configuration.

## 2.4 Support Staff

Handles tickets, account, subscription, and navigation help. Limited access by default; no automatic access to full student content. Access grants must be explicit and audited.

## 2.5 AI Academic Intelligence (not a human role)

The AI layer activated by the student's course, e.g. Nursing, Medicine, Public Health, Business, Education, Law, Engineering, Computer Science, Accounting.

Each intelligence defines terminology, conventions, structures, research standards, source types, writing expectations, and task guidance.

Rule: **Student Account → Profile → Course → Intelligence → Work Type → Workspace.**

---

# 3. ACCOUNT, PROFILE, AND WELCOME

## 3.1 Sign-up and login

* Required: full name, unique email, password. Verify email. Support password recovery, change email/password, account deletion.
* Social login optional later.
* Email is used for login, recovery, security notices, payment receipts, subscription info.

## 3.2 Academic profile

Required: course/field, university/college, department, academic level. Optional: faculty, country, citation style, lecturer/school requirements, preferences. Editable anytime. Do not ask repeatedly.

## 3.3 Personalized welcome and dashboard

After profile setup, show personalized dashboard, not a blank chatbot. Show name, discipline intelligence, and task entry points. Main nav: Home, My Work, Research, Tools, References, Profile, plus persistent **Start New Work**.

---

# 4. ACADEMIC WORK TYPES

Support these work types as first-class citizens, each with its own structure and workflow. Do not force everything into Chapter 1–5.

* Research Projects (including final-year Chapters 1–5 where required)
* Seminars
* Assignments
* Term Papers
* Essays
* Literature Reviews (including conceptual, theoretical, empirical organization)
* Case Studies
* Research Proposals
* Academic Presentations (outline/slide structure + speaker notes)

For each work type, the system must adapt to:

* Discipline conventions
* Academic level (e.g. ND/HND/BSc/MSc expectations)
* Institution/department format
* Referencing style (APA 7, MLA, Harvard, Chicago, Vancouver, IEEE)
* Lecturer/school requirements and uploaded instructions
* Word/page/slide limits and deadlines

Intake must ask only what each work type needs. Example: Assignment asks question, course, instructions, words, style, deadline; Seminar asks topic, objectives if known, structure, length, style; Proposal asks topic, population, location, methodology requirements.

---

# 5. DISCIPLINE-SPECIFIC INTELLIGENCE

Course selection activates the matching intelligence. It must change substance, not just the name: terminology, structure, research approach, source types, concepts, writing expectations, common tasks, and standards.

Example — Nursing understands nursing research/theories, clinical care, public health, evidence-based practice, and project structures. A Nursing seminar must be treated differently from Law or Engineering.

Support Nursing, Medicine, Public Health, Business, Education, Law, Engineering, and others over time. Each intelligence is versioned and QA-reviewed.

---

# 6. RESEARCH AND EVIDENCE ENGINE

This is the key differentiator from a chatbot. Before substantial work, AssignMe must actively search for relevant, current, credible materials.

It must:

* Search peer-reviewed and other appropriate academic/official sources (journals, books, university publications, government/professional reports).
* Respect requested year range; prefer recent sources unless seminal work is needed.
* Prioritize relevant Nigerian/African evidence where appropriate (without excluding essential international evidence).
* Verify author, year, title, journal, volume/issue/pages, DOI/URL where possible. Mark sources as verified or needs verification.
* Never invent references, authors, studies, or DOIs. Never present invented sources as real.
* Connect claims to supporting sources and flag unsupported claims.
* Organize sources for conceptual, theoretical, and empirical reviews.
* Provide an evidence/source view per workspace listing what was used, with links/DOIs.

---

# 7. CITATIONS AND REFERENCES

Support APA 7, MLA, Harvard, Chicago, Vancouver, IEEE. Support in-text citations, reference lists, multi-author works, paraphrase vs quotation, journal/website/DOI formatting. Generate, check consistency, and flag mismatches between in-text citations and the reference list.

---

# 8. ACADEMIC BUILDER (STEP-BY-STEP)

Students build work incrementally, not in one shot. Workflows adapt by work type, e.g.:

* **Research project:** topic → objectives → research questions → Chapter 1 → literature review → methodology → results → discussion → conclusion → references.
* **Seminar:** topic → outline → research → academic discussion → conclusion → references.
* **Assignment:** question → research → structure → answer → references.
* **Proposal:** topic → objectives/questions → literature gap → methodology → work plan → references.
* **Case study:** background → problem → analysis → options → recommendation → references.
* **Presentation:** topic → outline → slide content → notes → references.

Each step reuses prior steps and workspace memory. Students can regenerate, edit, expand, paraphrase, summarize, or shorten any step.

---

# 9. ACADEMIC WORKSPACE AND MEMORY

Every academic work has its own workspace under the student's account. Multiple works per account, kept separate.

Each workspace stores:

* Instructions and lecturer/school requirements
* Topic, objectives, research questions
* Outline/structure for that work type
* Drafts, sections/chapters, previous versions
* Sources, evidence view, references/citations
* Review results and revision notes
* Word count, style, progress, uploads

Workspace memory (topic, objectives, questions, prior sections, sources, style, uploads) must persist so students never re-explain the project and can return later to continue.

---

# 10. ACADEMIC REVIEWER

Review completed or in-progress work for:

* Structure appropriate to work type, discipline, and level
* Academic quality, clarity, and logical flow
* Evidence strength and claim-to-source alignment
* Objectives–questions–findings consistency
* Citation/reference consistency and formatting
* Repetition, unsupported claims, missing sections
* Compliance with word count, style, and lecturer/school requirements

Output a structured report (issues by severity, location, suggested fix) plus optional one-click improvements. Advanced review is paid; basic checks may be free/trial.

---

# 11. ACADEMIC WRITING AND INTEGRITY

Writing must be clear, level-appropriate, discipline-specific, evidence-supported, and well-structured. Avoid fake citations, unsupported claims, repetitive AI phrasing, excessive headings, and generic filler.

Position as assistant/workspace: explain content, show sources, support editing, encourage source checking, and help students understand their work.

---

# 12. AI INTERACTION

Natural commands using profile + intelligence + workspace context, e.g. explain topic, give three objectives, make paragraph academic, find sources for argument, reduce to 500 words, check references, continue previous section. Use context before generation: who, what field, level, work type, requirements, task.

---

# 13. SCHOOL REQUIREMENTS AND UPLOADS

Students can save reusable requirements (font, size, spacing, paper size, citation style, structure e.g. Chapters 1–5) and attach them to workspaces automatically.

Uploads (instructions, guidelines, supervisor notes, articles, PDFs, drafts): store files in Cloudflare R2, metadata in database, use as project context. Enforce type/size limits, ownership checks, and private-by-default access.

---

# 14. FREEMIUM, TRIAL, AND PAYMENTS

Basic help must remain free so students are not forced to pay for topics, objectives, or basic assistance.

Free includes: topic/objective generation, basic research guidance, basic introduction/background help, simple assignments, basic academic Q&A, limited tool access with reasonable caps.

Paid unlocks deeper work: extensive research and large-scale source discovery, detailed conceptual/theoretical/empirical reviews, full project/seminar development, long term papers, advanced review, larger documents, higher research/source/AI limits, advanced discipline intelligence and citation tools.

Include a free trial or limited premium preview (e.g. one advanced research run or review) before subscribing. Payments via Paystack (weekly, monthly, pay-per-project, or credits to be tested). Email receipts and subscription notices via Resend. Track usage and enforce plan limits with a visible meter and upgrade prompts.

---

# 15. PRODUCT RULES

* Context before generation: profile + discipline + work type + workspace + requirements first, then output.
* Evidence before claims for substantial work; no invented sources.
* Work-type-aware structures; never default everything to Chapter 1–5.
* Save everything; resumable workspaces.

---

# 16. SECURITY, PRIVACY, AND TECHNICAL NOTES

Security: secure auth (Better Auth), password hashing, email verification, TLS, RBAC and ownership checks, private R2 files with short-lived access, audit logs, account/work deletion, student control of data.

Technical (locked): app (Next.js App Router + TypeScript + Tailwind), Node API, self-hosted Postgres + Prisma (no Supabase), Better Auth, Cloudflare R2, Paystack, Resend, local-device hosting (Docker + Caddy/Nginx, no Vercel). AI layer = base model + discipline pack + task template + profile + workspace + requirements.

Database stores users, profiles, disciplines/intelligence configs, works, sections/versions, conversations, sources, references, files metadata, usage, plans/subscriptions/payments.

---

# 17. MVP, PHASES, AND SUCCESS CRITERIA

MVP: account, profile, 2–3 intelligences (start Nursing + one more), work types (assignment, seminar, topic/objectives, research assist, writing, references), builder for at least project/seminar/assignment, workspace with memory, basic research/verification/citations, free + Paystack paid + usage tracking + trial preview.

Phase 2: more disciplines, uploads at scale, templates, more styles, ref manager, lit-review assistant, editor, slides generator, Word/PDF export, stronger verification.
Phase 3: University/Department intelligence and long-term academic memory.

Success: easy signup/profile; users understand discipline intelligence; fast task start; discipline-appropriate output; return to continue work; trial converts to paid for advanced research.

---

# 18. CORE EXPERIENCE

Sign up → profile → personalized workspace (“Welcome back, Theresa. Your Nursing Intelligence is ready.”) → choose work type → create/open workspace → research → build step by step → review → save and resume. Account holds course, university, department, level, preferences, works, requirements, and history.
