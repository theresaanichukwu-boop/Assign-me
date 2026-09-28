import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { runResearch, verificationOf } from "@/lib/research";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const sources = await db.source.findMany({
    where: { workId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ sources });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const query = String(body.query ?? "").trim();
  if (!query) return NextResponse.json({ error: "Query is required." }, { status: 400 });
  const yearFrom = body.yearFrom ? Number(body.yearFrom) : undefined;
  const yearTo = body.yearTo ? Number(body.yearTo) : undefined;
  if ((yearFrom && Number.isNaN(yearFrom)) || (yearTo && Number.isNaN(yearTo)))
    return NextResponse.json({ error: "Year range must be numeric." }, { status: 400 });

  const found = await runResearch({
    query,
    yearFrom,
    yearTo,
    boostAfrican: body.boostAfrican !== false,
    limit: 20,
  });

  const sources = await Promise.all(
    found.map((s) =>
      db.source.create({
        data: {
          workId: id,
          authors: s.authors,
          year: s.year,
          title: s.title,
          journal: s.journal,
          volume: s.volume,
          issue: s.issue,
          pages: s.pages,
          doi: s.doi,
          url: s.url,
          status: verificationOf(s),
          bucket: null,
          metadata: { origin: s.origin, africanRelevant: s.africanRelevant },
        },
      }),
    ),
  );
  await db.usage.create({ data: { userId, task: "research", count: 1, plan: "free" } });
  return NextResponse.json({ sources }, { status: 201 });
}
