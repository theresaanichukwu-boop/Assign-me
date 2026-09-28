import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WORK_TYPE_REGISTRY, WORK_TYPES, workTypeLabel } from "@/lib/work-types";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/profile");

  const works = await db.work.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: { id: true, title: true, type: true, status: true, updatedAt: true },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <h1 className="font-serif text-3xl text-navy">
        Welcome back, {session.user.name}
      </h1>
      <p className="mt-1 text-muted">
        Your {profile.course} Academic Intelligence is ready. What are you
        working on today?
      </p>

      <h2 className="mt-8 font-bold">Start new work</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {WORK_TYPES.map((slug) => (
          <div
            key={slug}
            className="rounded-2xl border border-line bg-white p-4"
          >
            <p className="font-semibold">{WORK_TYPE_REGISTRY[slug].label}</p>
            <p className="mt-1 text-sm text-muted">
              {WORK_TYPE_REGISTRY[slug].builderSteps.length} guided steps
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-bold">Recent work</h2>
      {works.length === 0 ? (
        <p className="mt-2 text-muted">
          No work yet — pick a type above to begin. Everything saves
          automatically.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {works.map((w) => (
            <li
              key={w.id}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <p className="font-semibold">{w.title}</p>
              <p className="text-sm text-muted">
                {workTypeLabel(w.type)} · {w.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
