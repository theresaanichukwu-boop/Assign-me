import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";

async function ownedWork(userId: string, id: string) {
  return db.work.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({
    where: { id, userId },
    include: {
      sections: { orderBy: { order: "asc" } },
      sources: { orderBy: { createdAt: "asc" } },
      references: { orderBy: { createdAt: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 5 },
      files: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ work });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await ownedWork(userId, id)))
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  const body = (await req.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const key of ["title", "topic", "objectives", "questions", "requirements", "style", "status", "disciplineId"] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const work = await db.work.update({ where: { id }, data });
  return NextResponse.json({ work });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await ownedWork(userId, id)))
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  // Remove R2 objects before the DB cascade deletes their metadata.
  const files = await db.file.findMany({ where: { workId: id }, select: { r2Key: true } });
  const { deleteObject } = await import("@/lib/r2");
  await Promise.all(files.map((f) => deleteObject(f.r2Key).catch(() => {})));
  await db.work.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
