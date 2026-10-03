"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Issue {
  severity: "high" | "medium" | "low";
  location: string;
  message: string;
  fix: string;
}

interface Review {
  id: string;
  severity: { high: number; medium: number; low: number };
  issues: Issue[];
  createdAt: string;
}

const badge: Record<Issue["severity"], string> = {
  high: "bg-[#fee4e2] text-err",
  medium: "bg-[#fef0c7] text-warn",
  low: "bg-[#dcfae6] text-ok",
};

export default function ReviewPage(ctx: { params: Promise<{ id: string }> }) {
  const { id } = use(ctx.params);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/works/${id}/reviews`).then((x) => x.json());
    if (r.reviews) setReviews(r.reviews);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function run() {
    setBusy(true);
    setError(null);
    const r = await fetch(`/api/works/${id}/reviews`, { method: "POST" });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) setError(data.error ?? "Review failed.");
    else {
      setScore(data.score);
      await load();
    }
  }

  const latest = reviews[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link href={`/works/${id}`} className="text-sm font-semibold text-teal">
        ← Back to workspace
      </Link>
      <h1 className="mt-2 font-serif text-3xl text-navy">Academic review</h1>
      <p className="mt-1 text-sm text-muted">
        Structure, evidence, citations, repetition, and requirements — deterministic checks.
      </p>
      <button
        onClick={run}
        disabled={busy}
        className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Reviewing…" : "Run review"}
      </button>
      {error && <p className="mt-2 text-sm text-err">{error}</p>}
      {score !== null && <p className="mt-3 font-serif text-xl">Score: {score}/100</p>}

      {latest && (
        <section className="mt-6">
          <p className="text-sm text-muted">
            {latest.severity.high} high · {latest.severity.medium} medium · {latest.severity.low} low
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {(latest.issues as Issue[]).map((i, n) => (
              <li key={n} className="rounded-xl border border-line bg-white px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge[i.severity]}`}>
                  {i.severity}
                </span>{" "}
                <span className="font-mono text-xs text-muted">{i.location}</span>
                <p className="mt-1 font-medium">{i.message}</p>
                <p className="text-sm text-muted">Fix: {i.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
