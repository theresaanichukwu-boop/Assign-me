"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getWorkType,
  workTypeLabel,
  workTypeSlugFromEnum,
} from "@/lib/work-types";

interface Section {
  id: string;
  step: string;
  contentMd: string;
  version: number;
}

interface Work {
  id: string;
  title: string;
  type: string;
  topic: string | null;
  status: string;
  sections: Section[];
}

export default function WorkPage(ctx: { params: Promise<{ id: string }> }) {
  const { id } = use(ctx.params);
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch(`/api/works/${id}`);
    if (r.status === 401) return router.push("/login");
    if (r.status === 404) return router.push("/dashboard");
    const data = await r.json();
    setWork(data.work);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!work) return <main className="mx-auto max-w-3xl px-5 py-16 text-muted">Loading…</main>;

  const def = getWorkType(workTypeSlugFromEnum(work.type));
  const saved = new Map(work.sections.map((s) => [s.step, s]));

  function openStep(step: string) {
    setActiveStep(step);
    setDraft(saved.get(step)?.contentMd ?? "");
    setError(null);
  }

  async function saveStep() {
    if (!activeStep) return;
    setSaving(true);
    setError(null);
    const r = await fetch(`/api/works/${id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: activeStep, contentMd: draft }),
    });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) setError(data.error ?? "Could not save.");
    else {
      await load();
      setActiveStep(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">{workTypeLabel(work.type)}</p>
      <h1 className="font-serif text-3xl text-navy">{work.title}</h1>
      {work.topic && <p className="mt-1 text-muted">{work.topic}</p>}
      <a href={`/works/${work.id}/research`} className="mt-2 inline-block text-sm font-semibold text-teal">
        Research & evidence →
      </a>
      <br />
      <a href={`/works/${work.id}/review`} className="mt-1 inline-block text-sm font-semibold text-teal">
        Academic review →
      </a>

      <h2 className="mt-8 font-bold">Build step by step</h2>
      <ol className="mt-3 flex flex-col gap-2">
        {def.builderSteps.map((step, i) => {
          const s = saved.get(step);
          return (
            <li
              key={step}
              className={`flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 ${activeStep === step ? "ring-2 ring-teal" : ""}`}
            >
              <span>
                <span className="mr-2 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium capitalize">{step.replace(/-/g, " ")}</span>{" "}
                {s && <span className="ml-1 text-xs text-ok">✓ v{s.version}</span>}
              </span>
              <button
                onClick={() => openStep(step)}
                className="rounded-lg border border-line px-3 py-1 text-sm font-semibold text-teal"
              >
                {s ? "Edit" : "Write"}
              </button>
            </li>
          );
        })}
      </ol>

      {activeStep && (
        <section className="mt-6 rounded-2xl border border-line bg-white p-5">
          <h3 className="font-bold capitalize">{activeStep.replace(/-/g, " ")}</h3>
          <textarea
            className="mt-3 min-h-48 w-full rounded-lg border border-line px-3 py-2 font-serif text-ink"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write this section… evidence first, then claims."
          />
          {error && <p className="mt-2 text-sm text-err">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={saveStep}
              disabled={saving}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save step"}
            </button>
            <button
              onClick={() => setActiveStep(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
