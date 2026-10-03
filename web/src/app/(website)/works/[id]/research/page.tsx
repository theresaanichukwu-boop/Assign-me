import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkConsistency } from "@/lib/citations";
import ResearchClient from "./ResearchClient";

export default async function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const work = await db.work.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sources: { orderBy: { createdAt: "asc" } },
      references: { orderBy: { createdAt: "asc" } },
      sections: { select: { contentMd: true } },
    },
  });
  if (!work) redirect("/dashboard");

  const text = work.sections.map((s) => s.contentMd).join("\n");
  const byId = new Map(work.sources.map((s) => [s.id, s]));
  const issues = checkConsistency(
    text,
    work.references.map((r) => {
      const s = r.sourceId ? byId.get(r.sourceId) : undefined;
      return { id: r.id, authors: s?.authors ?? null, year: s?.year ?? null };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      <Link href={`/works/${id}`} className="text-sm font-semibold text-teal">
        ← Back to workspace
      </Link>
      <h1 className="mt-2 font-serif text-3xl text-navy">Research & evidence</h1>
      <p className="mt-1 text-sm text-muted">
        Crossref + OpenAlex. Nigerian/African evidence boosted. Nothing here is
        invented — every source was fetched live.
      </p>
      <ResearchClient
        workId={id}
        initialSources={work.sources.map((s) => ({
          id: s.id,
          authors: s.authors,
          year: s.year,
          title: s.title,
          journal: s.journal,
          doi: s.doi,
          status: s.status,
          origin: (s.metadata as { origin?: string } | null)?.origin ?? null,
          africanRelevant: (s.metadata as { africanRelevant?: boolean } | null)?.africanRelevant ?? false,
        }))}
        initialReferences={work.references.map((r) => ({
          id: r.id,
          style: r.style,
          inText: r.inText,
          referenceText: r.referenceText,
        }))}
        initialIssues={issues}
      />
    </main>
  );
}
