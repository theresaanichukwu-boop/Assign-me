import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getWorkType, workTypeLabel, workTypeSlugFromEnum } from "@/lib/work-types";
import BuilderClient from "./BuilderClient";
import FilesClient from "./FilesClient";

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const work = await db.work.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sections: { orderBy: { order: "asc" } },
      files: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!work) redirect("/dashboard");

  const def = getWorkType(workTypeSlugFromEnum(work.type));
  const saved: Record<string, { contentMd: string; version: number }> = {};
  for (const s of work.sections) saved[s.step] = { contentMd: s.contentMd, version: s.version };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">{workTypeLabel(work.type)}</p>
      <h1 className="font-serif text-3xl text-navy">{work.title}</h1>
      {work.topic && <p className="mt-1 text-muted">{work.topic}</p>}
      <a href={`/works/${work.id}/research`} className="mt-2 inline-block text-sm font-semibold text-teal">
        Research & evidence →
      </a>
      <br />
      <a href={`/works/${work.id}/review`} className="mt-1 inline-block text-sm font-semibold text-teal">
        Academic review →
      </a>

      <h2 className="mt-8 font-bold">Build step by step</h2>
      <BuilderClient workId={work.id} steps={def.builderSteps} initialSaved={saved} />
      <FilesClient
        workId={work.id}
        initialFiles={work.files.map((f) => ({
          id: f.id,
          filename: f.filename,
          mime: f.mime,
          sizeBytes: f.sizeBytes,
          purpose: f.purpose,
        }))}
      />
    </main>
  );
}
