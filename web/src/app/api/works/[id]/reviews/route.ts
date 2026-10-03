import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { runReview } from "@/lib/reviewer";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const reviews = await db.review.findMany({
    where: { workId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ reviews });
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({
    where: { id, userId },
    include: {
      sections: { select: { step: true, contentMd: true } },
      sources: { select: { id: true, authors: true, year: true } },
      references: { select: { id: true, sourceId: true } },
    },
  });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const report = runReview({
    workTypeEnum: work.type,
    objectives: work.objectives,
    style: work.style,
    sections: work.sections,
    sources: work.sources,
    references: work.references,
  });
  const review = await db.review.create({
    data: {
      workId: id,
      severity: JSON.parse(JSON.stringify(report.summary)),
      issues: JSON.parse(JSON.stringify(report.issues)),
    },
  });
  await db.usage.create({ data: { userId, task: "review", count: 1, plan: "free" } });
  await db.work.update({ where: { id }, data: { status: "IN_REVIEW" } });
  return NextResponse.json({ review, score: report.score }, { status: 201 });
}
