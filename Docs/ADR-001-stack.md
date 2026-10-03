# ADR-001 — Locked Stack (Phase 0)

Date: 2026-09-28
Status: Accepted
PRD: `Docs/ASSIGNME Product Requirements Document.md` §§14,16 (Paystack, Resend, R2, Better Auth, local hosting)

## Decision

| Layer | Choice |
|---|---|
| Website | Next.js App Router + TypeScript + Tailwind |
| Backend | Next.js API / tRPC (Node) |
| DB/ORM | Self-hosted Postgres + Prisma (no Supabase) |
| Auth | Better Auth |
| Files | Cloudflare R2 private bucket + presigned URLs |
| Payments | Paystack |
| Email | Resend |
| Hosting | Local device Docker Compose + Caddy + PM2 (no Vercel) |
| AI/Research | OpenAI-compatible + Crossref/OpenAlex |

## Reasons

* Paystack/Resend/R2/Better Auth/local-hosting are hard user constraints.
* Postgres gives relational integrity for works/versions/sources/refs/files/usage without external BaaS.
* Better Auth fits email/password + verify/reset + admin/organization RBAC better than Auth.js for this PRD.
* R2 keeps student files private and cheap vs local disk.
* Local Compose keeps all data on-device for beta.

## Consequences

* Must run Postgres + Redis locally via Docker.
* No Vercel preview envs — use local staging.
* Paystack webhooks need public tunnel (e.g. Caddy + ngrok) for local testing.
