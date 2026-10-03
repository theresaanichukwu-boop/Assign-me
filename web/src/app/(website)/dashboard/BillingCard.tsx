"use client";

import { useEffect, useState } from "react";
import { PLANS, type PlanSlug } from "@/lib/plans";

interface Sub {
  plan: string;
  status: string;
  trialUsed: boolean;
}

export default function BillingCard() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((d) => d.subscription && setSub(d.subscription));
  }, []);

  async function claimTrial() {
    setBusy(true);
    const r = await fetch("/api/billing/trial", { method: "POST" });
    const d = await r.json();
    setBusy(false);
    if (r.ok) setSub(d.subscription);
    else setMsg(d.error ?? "Could not claim trial.");
  }

  async function checkout(plan: PlanSlug) {
    setBusy(true);
    const r = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const d = await r.json();
    setBusy(false);
    if (r.ok) window.location.href = d.authorizationUrl;
    else setMsg(d.error ?? "Checkout failed.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-bold">Plan: {sub ? sub.plan : "…"}</h2>
      {!sub?.trialUsed && sub?.plan === "free" && (
        <button
          onClick={claimTrial}
          disabled={busy}
          className="mt-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Claim free premium preview
        </button>
      )}
      {(sub?.plan === "free" || sub?.plan === "trial") && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(PLANS) as PlanSlug[]).map((p) => (
            <button
              key={p}
              onClick={() => checkout(p)}
              disabled={busy}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy disabled:opacity-60"
            >
              {PLANS[p].label} — ₦{(PLANS[p].amount / 100).toLocaleString()}
            </button>
          ))}
        </div>
      )}
      {msg && <p className="mt-2 text-sm text-err">{msg}</p>}
    </section>
  );
}
