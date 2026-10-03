const NAV = ["Home", "My Work", "Research", "Tools", "References", "Profile"];

const WORK_TYPES = [
  "Research Project",
  "Seminar",
  "Assignment",
  "Term Paper",
  "Essay",
  "Literature Review",
  "Case Study",
  "Research Proposal",
  "Presentation",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-5 py-4">
          <span className="mr-2 text-lg font-extrabold text-navy">AssignMe</span>
          {NAV.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink"
            >
              {item}
            </span>
          ))}
          <span className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-white">
            + Start New Work
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <section className="rounded-2xl bg-navy p-8 text-white">
          <p className="text-sm opacity-80">
            Personal academic workspace — not a chatbot
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight">
            Welcome back, Theresa. Your Nursing Academic Intelligence is ready.
          </h1>
          <p className="mt-2 opacity-90">
            Research evidence, build step by step, then review — what are you
            working on today?
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Choose a work type</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {WORK_TYPES.map((type) => (
              <span
                key={type}
                className="rounded-lg bg-[#eef1f4] px-3 py-1.5 text-sm font-medium"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">
            Each type has its own structure — nothing is forced into Chapter
            1–5.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-bold text-teal">1. Research</h3>
            <p className="mt-1 text-sm text-muted">
              Peer-reviewed and official sources, year range respected,
              Nigerian evidence prioritized, verified or flagged.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-bold text-navy">2. Build</h3>
            <p className="mt-1 font-serif text-sm">
              Evidence-based practice improves outcomes when…
            </p>
            <p className="mt-1 text-sm text-muted">
              Step-by-step: topic → objectives → sections → references.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-bold text-accent">3. Review</h3>
            <p className="mt-1 text-sm text-muted">
              Structure, evidence, citations, and requirements checked before
              submission.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-5xl px-5 py-4 font-mono text-xs text-muted">
          Phase 1 foundation • Better Auth • R2 • Paystack • Resend • Local
          hosting
        </div>
      </footer>
    </div>
  );
}
