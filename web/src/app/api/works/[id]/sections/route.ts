import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { getWorkType, workTypeSlugFromEnum } from "@/lib/work-types";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const step = String(body.step ?? "").trim();
  const contentMd = String(body.contentMd ?? "");
  if (!step) return NextResponse.json({ error: "Step is required." }, { status: 400 });

  const def = getWorkType(workTypeSlugFromEnum(work.type));
  if (!def.builderSteps.includes(step))
    return NextResponse.json({ error: `Unknown step for ${def.label}.` }, { status: 400 });

  const existing = await db.workSection.findFirst({ where: { workId: id, step } });
  const order = def.builderSteps.indexOf(step);
  const section = existing
    ? await db.workSection.update({
        where: { id: existing.id },
        data: { contentMd, order, version: { increment: 1 } },
      })
    : await db.workSection.create({
        data: { workId: id, step, contentMd, order },
      });
  await db.work.update({ where: { id }, data: { status: "IN_PROGRESS" } });
  return NextResponse.json({ section }, { status: existing ? 200 : 201 });
}
