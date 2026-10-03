"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STYLES = ["APA 7", "MLA", "Harvard", "Chicago", "Vancouver", "IEEE"];

export interface ProfileInitial {
  course: string;
  university: string;
  faculty: string;
  department: string;
  level: string;
  country: string;
  citationStyle: string;
}

const EMPTY: ProfileInitial = {
  course: "",
  university: "",
  faculty: "",
  department: "",
  level: "",
  country: "",
  citationStyle: "APA 7",
};

export default function ProfileForm({ initial }: { initial: ProfileInitial | null }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileInitial>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(name: keyof ProfileInitial, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) setError(data.error ?? "Could not save profile.");
    else router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      {(
        [
          ["course", "Course / Field of Study"],
          ["university", "University / College"],
          ["department", "Department"],
          ["level", "Academic Level (e.g. Final Year)"],
          ["faculty", "Faculty (optional)"],
          ["country", "Country (optional)"],
        ] as const
      ).map(([name, label]) => (
        <label key={name} className="text-sm text-muted">
          {label}
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            value={form[name]}
            onChange={(e) => set(name, e.target.value)}
            required={!label.includes("optional")}
          />
        </label>
      ))}
      <label className="text-sm text-muted">
        Preferred citation style
        <select
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
          value={form.citationStyle}
          onChange={(e) => set("citationStyle", e.target.value)}
        >
          {STYLES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-err">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
