"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORK_TYPES, WORK_TYPE_REGISTRY } from "@/lib/work-types";

export default function NewWorkForm() {
  const router = useRouter();
  const [workType, setWorkType] = useState<string>(WORK_TYPES[0]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await fetch("/api/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workType, title, topic }),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) setError(data.error ?? "Could not create work.");
    else router.push(`/works/${data.work.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 rounded-2xl border border-line bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-muted">
          Work type
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
          >
            {WORK_TYPES.map((slug) => (
              <option key={slug} value={slug}>
                {WORK_TYPE_REGISTRY[slug].label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted">
          Title
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Digital Competencies Among Nurses"
          />
        </label>
        <label className="text-sm text-muted">
          Topic (optional)
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-err">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Creating…" : "Start new work"}
      </button>
    </form>
  );
}
