"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.signUp.email(
      { name, email, password },
      {
        onError: (ctx) => setError(ctx.error.message ?? "Could not sign up."),
        onSuccess: () => setDone(true),
      },
    );
    if (res.error) setError(res.error.message ?? "Could not sign up.");
    setBusy(false);
  }

  if (done)
    return (
      <main className="mx-auto w-full max-w-md px-5 py-16">
        <h1 className="font-serif text-2xl text-navy">Check your email</h1>
        <p className="mt-2 text-muted">
          We sent a verification link to {email}. Verify it, then{" "}
          <Link href="/profile" className="font-semibold text-teal">
            build your academic profile
          </Link>
          .
        </p>
      </main>
    );

  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="font-serif text-2xl text-navy">Create your account</h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <label className="text-sm text-muted">
          Full name
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="text-sm text-muted">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="text-sm text-muted">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-ink"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <p className="text-sm text-err">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Have an account?{" "}
        <Link href="/login" className="font-semibold text-teal">
          Log in
        </Link>
      </p>
    </main>
  );
}
