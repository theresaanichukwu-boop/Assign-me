import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const work = await db.work.findFirst({
    where: { id, userId: session.user.id },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!work) redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link href={`/works/${id}`} className="text-sm font-semibold text-teal">
        ← Back to workspace
      </Link>
      <h1 className="mt-2 font-serif text-3xl text-navy">Academic review</h1>
      <p className="mt-1 text-sm text-muted">
        Structure, evidence, citations, repetition, and requirements — deterministic checks.
      </p>
      <ReviewClient
        workId={id}
        initialReviews={work.reviews.map((r) => ({
          id: r.id,
          severity: r.severity as { high: number; medium: number; low: number },
          issues: r.issues as Array<{
            severity: "high" | "medium" | "low";
            location: string;
            message: string;
            fix: string;
          }>,
        }))}
      />
    </main>
  );
}
