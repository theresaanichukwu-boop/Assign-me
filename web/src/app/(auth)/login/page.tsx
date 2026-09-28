"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.signIn.email(
      { email, password },
      { onError: (ctx) => setError(ctx.error.message ?? "Could not log in.") },
    );
    setBusy(false);
    if (!res.error) router.push("/dashboard");
    else setError(res.error.message ?? "Could not log in.");
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="font-serif text-2xl text-navy">Welcome back</h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
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
          />
        </label>
        {error && <p className="text-sm text-err">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-teal">
          Create an account
        </Link>
      </p>
    </main>
  );
}
