import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import {
  CITATION_STYLES,
  checkConsistency,
  formatInText,
  formatReference,
  type CitationStyle,
} from "@/lib/citations";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({
    where: { id, userId },
    include: {
      references: { orderBy: { createdAt: "asc" } },
      sections: { select: { contentMd: true } },
    },
  });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const text = work.sections.map((s) => s.contentMd).join("\n");
  // Resolve author/year from linked sources for accurate checks.
  const sources = await db.source.findMany({ where: { workId: id } });
  const byId = new Map(sources.map((s) => [s.id, s]));
  const accurate = checkConsistency(
    text,
    work.references.map((r) => {
      const s = r.sourceId ? byId.get(r.sourceId) : undefined;
      return { id: r.id, authors: s?.authors ?? null, year: s?.year ?? null };
    }),
  );
  return NextResponse.json({ references: work.references, issues: accurate });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const style = String(body.style ?? "APA 7") as CitationStyle;
  if (!(CITATION_STYLES as readonly string[]).includes(style))
    return NextResponse.json({ error: "Unsupported citation style." }, { status: 400 });
  const sourceId = String(body.sourceId ?? "");
  const source = await db.source.findFirst({ where: { id: sourceId, workId: id } });
  if (!source) return NextResponse.json({ error: "Source not found." }, { status: 404 });

  const citable = {
    authors: source.authors,
    year: source.year,
    title: source.title,
    journal: source.journal,
    volume: source.volume,
    issue: source.issue,
    pages: source.pages,
    doi: source.doi,
    url: source.url,
  };
  const reference = await db.reference.create({
    data: {
      workId: id,
      sourceId: source.id,
      style,
      inText: formatInText(citable, style),
      referenceText: formatReference(citable, style),
    },
  });
  return NextResponse.json({ reference }, { status: 201 });
}
