import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16 text-center">
      <h1 className="font-serif text-2xl text-navy">You are offline</h1>
      <p className="mt-2 text-muted">
        AssignMe needs a connection for research, AI drafting, and syncing your
        workspace. Reconnect and try again.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
