# Phase 1 Components (15) — status: designed, not yet built in Storybook

Node.js is not installed on this device, so Next.js/Storybook scaffolding is blocked until Node LTS is installed.

Designed (see Docs/DESIGN_SYSTEM_PREVIEW.html v2):
1. Website shell + nav + Start New Work
2. Dashboard (welcome + intelligence + 9 work-type cards)
3. Work-type intake forms (minimal per type)
4. Workspace layout (steps + editor + evidence side-by-side)
5. Evidence view (verified/needs-check + NG flag + buckets)
6. Citation preview (6 styles + DOI badge)
7. Reviewer report (severity + fix)
8. Usage meter + trial banner + Paystack upgrade
9. Auth forms (Better Auth)
10. Empty states
11. Toasts
12. Project/work cards + status
13. Version history list
14. File upload list (R2)
15. Print stylesheet (Times 12 double A4)

## To build (needs Node LTS)
1. Install Node LTS: `winget install OpenJS.NodeJS.LTS`
2. Reopen PowerShell, run `node -v && npm -v`
3. Scaffold: `npx create-next-app@latest web --typescript --tailwind --app --src-dir`
4. Apply `design/tokens.json` to `tailwind.config` + `web/styles/tokens.css`
5. `npx storybook@latest init`, add stories for the 15 above
6. Mobile + WCAG AA + print CSS pass
