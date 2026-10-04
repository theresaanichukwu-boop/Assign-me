import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WORK_TYPE_REGISTRY, WORK_TYPES, workTypeLabel } from "@/lib/work-types";
import NewWorkForm from "./NewWorkForm";
import BillingCard from "./BillingCard";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-[#eef1f4] text-muted",
  IN_PROGRESS: "bg-[#dcfae6] text-ok",
  IN_REVIEW: "bg-[#fef0c7] text-warn",
  COMPLETED: "bg-navy text-white",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/profile");

  const userId = session.user.id;
  const [works, totalWorks, completed, sources, reviews, monthUsage] = await Promise.all([
    db.work.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, type: true, status: true, updatedAt: true },
    }),
    db.work.count({ where: { userId } }),
    db.work.count({ where: { userId, status: "COMPLETED" } }),
    db.source.count({ where: { work: { userId } } }),
    db.review.count({ where: { work: { userId } } }),
    db.usage.aggregate({
      where: {
        userId,
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { count: true },
    }),
  ]);
  const inProgress = totalWorks - completed;

  const stats = [
    { value: String(totalWorks), label: "Works total" },
    { value: String(inProgress), label: "In progress" },
    { value: String(sources), label: "Vetted sources saved" },
    { value: String(reviews), label: "Reviews run" },
    { value: String(monthUsage._sum.count ?? 0), label: "AI actions this month" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <section className="rounded-3xl bg-navy p-6 text-white md:p-8">
        <h1 className="font-serif text-3xl">
          Welcome back, {session.user.name}
        </h1>
        <p className="mt-1 text-white/80">
          Your {profile.course} Academic Intelligence is ready. What are you
          working on today?
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
            <p className="font-serif text-2xl font-bold text-navy">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-8 font-bold">Start new work</h2>
      <NewWorkForm />
      <BillingCard />

      <h2 className="mt-8 font-bold">Recent work</h2>
      {works.length === 0 ? (
        <p className="mt-2 text-muted">
          No work yet — create your first one above. Everything saves
          automatically.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {works.map((w) => (
            <li
              key={w.id}
              className="rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-md"
            >
              <Link href={`/works/${w.id}`} className="font-semibold text-navy">
                {w.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{workTypeLabel(w.type)}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[w.status] ?? STATUS_STYLE.DRAFT}`}
              >
                {w.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 font-bold">Work types</h2>
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
    </main>
  );
}
