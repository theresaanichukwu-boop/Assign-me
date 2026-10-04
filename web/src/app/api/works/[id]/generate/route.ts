import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { complete } from "@/lib/ai";
import {
  buildSupervisedDraftPrompt,
  currentYearRange,
  packForCourse,
  type SourcePoolItem,
} from "@/lib/prompts";
import { getWorkType, workTypeLabel, workTypeSlugFromEnum } from "@/lib/work-types";
import { runResearch, verificationOf } from "@/lib/research";

// Supervised drafting — session + ownership guarded, usage recorded.
// Research-first: live vetted sources (5-year window) become the ONLY
// permitted citation pool, so drafts cannot invent references.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({
    where: { id, userId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const step = String(body.step ?? "").trim();
  if (!step) return NextResponse.json({ error: "Step is required." }, { status: 400 });

  const slug = workTypeSlugFromEnum(work.type);
  const def = getWorkType(slug);
  if (!def.builderSteps.includes(step))
    return NextResponse.json({ error: `Unknown step for ${def.label}.` }, { status: 400 });

  const profile = await db.profile.findUnique({ where: { userId } });
  const { from, to } = currentYearRange(5);
  const query = [work.topic, step.replace(/-/g, " ")].filter(Boolean).join(" ");

  let pool: SourcePoolItem[] = [];
  try {
    const found = await runResearch({ query, yearFrom: from, yearTo: to, limit: 8 });
    const saved = await Promise.all(
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
            metadata: { origin: s.origin, africanRelevant: s.africanRelevant },
          },
        }),
      ),
    );
    pool = saved.map((s) => ({
      id: s.id,
      authors: s.authors,
      year: s.year,
      title: s.title,
      journal: s.journal,
      volume: s.volume,
      issue: s.issue,
      pages: s.pages,
      doi: s.doi,
      url: s.url,
    }));
  } catch {
    pool = [];
  }

  const messages = buildSupervisedDraftPrompt(packForCourse(profile?.course ?? null), {
    workTypeLabel: workTypeLabel(work.type),
    step,
    topic: work.topic,
    objectives: work.objectives,
    priorSteps: work.sections
      .filter((s) => s.step !== step)
      .map((s) => ({ step: s.step, contentMd: s.contentMd })),
    citationStyle: work.style,
    level: profile?.level ?? null,
  }, pool);

  try {
    const draft = await complete(messages);
    await db.usage.create({ data: { userId, task: "ai-draft", count: 1, plan: "free" } });
    return NextResponse.json({ draft, sourceIds: pool.map((s) => s.id) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed." },
      { status: 502 },
    );
  }
}
