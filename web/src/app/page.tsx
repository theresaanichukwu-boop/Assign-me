import Link from "next/link";

const NAV = [
  { label: "Home", href: "/" },
  { label: "My Work", href: "/dashboard" },
  { label: "Research", href: "/dashboard" },
  { label: "Tools", href: "/dashboard" },
  { label: "References", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
];

const WORK_TYPES: Array<{ name: string; blurb: string }> = [
  { name: "Research Project", blurb: "Chapters, methodology, results" },
  { name: "Seminar", blurb: "Topic to references, step by step" },
  { name: "Assignment", blurb: "Question to polished answer" },
  { name: "Term Paper", blurb: "Long-form, fully sourced" },
  { name: "Essay", blurb: "Thesis-driven arguments" },
  { name: "Literature Review", blurb: "Conceptual, theoretical, empirical" },
  { name: "Case Study", blurb: "Problem to recommendation" },
  { name: "Research Proposal", blurb: "Gap, method, work plan" },
  { name: "Presentation", blurb: "Slides plus speaker notes" },
];

const STATS = [
  { value: "9", label: "Work types, each with its own structure" },
  { value: "6", label: "Citation styles checked for consistency" },
  { value: "5yr", label: "Recency window on every source" },
  { value: "0", label: "Invented references tolerated" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
          <Link href="/" className="mr-2 text-lg font-extrabold text-navy">
            AssignMe
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {NAV.slice(1).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-1 text-sm text-muted transition-colors hover:bg-[#eef1f4] hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex gap-2">
            <Link href="/login" className="rounded-full px-3 py-1.5 text-sm font-semibold text-navy">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-px"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5">
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-navy p-8 text-white md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal opacity-30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent opacity-25 blur-3xl"
          />
          <p className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            AI academic workspace — not a chatbot
          </p>
          <h1 className="relative mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
            Research it. Build it. <span className="text-accent">Defend it.</span>
          </h1>
          <p className="relative mt-4 max-w-xl text-white/85">
            AssignMe understands your discipline, researches real evidence from
            the last five years, helps you build work step by step, and reviews
            it like a supervisor — before your supervisor does.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Start free — topics & objectives on us
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-serif text-3xl font-bold text-navy">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-navy">One workspace per work type</h2>
          <p className="mt-1 text-muted">
            Each type gets its own structure, intake, builder steps, and review checklist.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_TYPES.map((t) => (
              <Link
                key={t.name}
                href="/signup"
                className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-1 hover:border-teal hover:shadow-md"
              >
                <p className="font-bold group-hover:text-teal">{t.name}</p>
                <p className="mt-1 text-sm text-muted">{t.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-line bg-white p-8 md:p-10">
          <h2 className="font-serif text-2xl text-navy">How a work gets done</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Research", "Live search across journals, filtered to 5 years, verified or flagged."],
              ["Build", "Step-by-step drafting grounded in your vetted sources."],
              ["Cite", "In-text citations in your style, matched to the reference list."],
              ["Review", "Structure, evidence, and consistency checked with fixes."],
            ].map(([title, body], i) => (
              <li key={title} className="rounded-2xl bg-canvas p-4">
                <p className="font-mono text-xs text-muted">STEP {i + 1}</p>
                <p className="mt-1 font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-3xl bg-navy p-8 text-center text-white md:p-12">
          <p className="mx-auto max-w-2xl font-serif text-2xl leading-snug">
            “It corrected my objectives before writing a word. That&apos;s when I
            knew it wasn&apos;t a chatbot.”
          </p>
          <p className="mt-3 text-sm text-white/70">The AssignMe standard — supervision, not sentences</p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Create your workspace
          </Link>
        </section>
      </main>

      <footer className="mt-12 border-t border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5">
          <p className="text-sm font-bold text-navy">AssignMe</p>
          <p className="font-mono text-xs text-muted">
            Research • Build • Review — no invented references, ever
          </p>
        </div>
      </footer>
    </div>
  );
}
