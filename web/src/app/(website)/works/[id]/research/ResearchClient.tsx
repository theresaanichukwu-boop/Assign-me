"use client";

import { useState } from "react";
import { CITATION_STYLES } from "@/lib/citations";

export interface SourceItem {
  id: string;
  authors: string | null;
  year: number | null;
  title: string;
  journal: string | null;
  doi: string | null;
  status: string;
  origin: string | null;
  africanRelevant: boolean;
}

export interface ReferenceItem {
  id: string;
  style: string;
  inText: string | null;
  referenceText: string;
}

export interface IssueItem {
  referenceId: string;
  message: string;
}

export default function ResearchClient({
  workId,
  initialSources,
  initialReferences,
  initialIssues,
}: {
  workId: string;
  initialSources: SourceItem[];
  initialReferences: ReferenceItem[];
  initialIssues: IssueItem[];
}) {
  const [sources, setSources] = useState(initialSources);
  const [references, setReferences] = useState(initialReferences);
  const [issues, setIssues] = useState(initialIssues);
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [style, setStyle] = useState<string>("APA 7");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [s, r] = await Promise.all([
      fetch(`/api/works/${workId}/research`).then((x) => x.json()),
      fetch(`/api/works/${workId}/references`).then((x) => x.json()),
    ]);
    if (s.sources) {
      setSources(
        s.sources.map((x: SourceItem & { url: string | null; metadata: { origin?: string; africanRelevant?: boolean } | null }) => ({
          id: x.id,
          authors: x.authors,
          year: x.year,
          title: x.title,
          journal: x.journal,
          doi: x.doi,
          status: x.status,
          origin: x.metadata?.origin ?? null,
          africanRelevant: x.metadata?.africanRelevant ?? false,
        })),
      );
    }
    if (r.references) setReferences(r.references);
    if (r.issues) setIssues(r.issues);
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await fetch(`/api/works/${workId}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        yearFrom: yearFrom || undefined,
        yearTo: yearTo || undefined,
      }),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) setError(data.error ?? "Research failed.");
    else {
      setQuery("");
      await reload();
    }
  }

  async function cite(sourceId: string) {
    const r = await fetch(`/api/works/${workId}/references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, style }),
    });
    if (r.ok) await reload();
  }

  return (
    <>
      <form onSubmit={onSearch} className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-sm text-muted sm:col-span-2">
            Search
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. digital competencies nurses"
              required
            />
          </label>
          <label className="text-sm text-muted">
            From year
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              inputMode="numeric"
              placeholder="2019"
            />
          </label>
          <label className="text-sm text-muted">
            To year
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              inputMode="numeric"
              placeholder="2026"
            />
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-err">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Searching…" : "Run guided research"}
        </button>
      </form>

      <h2 className="mt-8 font-bold">Evidence ({sources.length})</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {sources.map((s) => (
          <li key={s.id} className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="font-medium">
              {s.title}{" "}
              <span className="text-sm text-muted">
                {s.authors ?? "Unknown"} {s.year ? `(${s.year})` : ""}
              </span>
            </p>
            <p className="font-mono text-xs text-muted">
              {s.journal ?? ""} {s.doi ? `· doi:${s.doi}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${s.status === "VERIFIED" ? "bg-[#dcfae6] text-ok" : "bg-[#fef0c7] text-warn"}`}
              >
                {s.status === "VERIFIED" ? "Verified" : "Needs check"}
              </span>
              {s.africanRelevant && (
                <span className="rounded-full bg-[#e0f2f1] px-2 py-0.5 font-bold text-teal">NG/Africa</span>
              )}
              <span className="text-muted">{s.origin}</span>
              <button
                onClick={() => cite(s.id)}
                className="ml-auto rounded-lg border border-line px-2 py-0.5 font-semibold text-teal"
              >
                Cite ({style})
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-bold">References ({references.length})</h2>
      <label className="mt-2 block max-w-xs text-sm text-muted">
        Citation style
        <select
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {CITATION_STYLES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <ul className="mt-3 flex flex-col gap-2">
        {references.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="font-mono text-xs text-muted">{r.inText}</p>
            <p className="mt-1 text-sm">{r.referenceText}</p>
          </li>
        ))}
      </ul>

      {issues.length > 0 && (
        <section className="mt-6 rounded-2xl border border-warn bg-[#fffaeb] p-5">
          <h3 className="font-bold text-warn">Consistency warnings</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {issues.map((i, n) => (
              <li key={n}>{i.message}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
