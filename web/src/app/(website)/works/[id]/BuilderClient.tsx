"use client";

import { useState } from "react";

export interface SavedSection {
  contentMd: string;
  version: number;
}

export default function BuilderClient({
  workId,
  steps,
  initialSaved,
}: {
  workId: string;
  steps: string[];
  initialSaved: Record<string, SavedSection>;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openStep(step: string) {
    setActiveStep(step);
    setDraft(saved[step]?.contentMd ?? "");
    setError(null);
  }

  async function saveStep() {
    if (!activeStep) return;
    setSaving(true);
    setError(null);
    const r = await fetch(`/api/works/${workId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: activeStep, contentMd: draft }),
    });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    setSaved((prev) => ({
      ...prev,
      [activeStep]: { contentMd: data.section.contentMd, version: data.section.version },
    }));
    setActiveStep(null);
  }

  return (
    <>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((step, i) => {
          const s = saved[step];
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
    </>
  );
}
