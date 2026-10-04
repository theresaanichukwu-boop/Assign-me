import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { ALLOWED_MIME, MAX_FILE_BYTES, presignDownload, presignUpload, r2Key } from "@/lib/r2";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const files = await db.file.findMany({ where: { workId: id }, orderBy: { createdAt: "asc" } });
  const withUrls = await Promise.all(
    files.map(async (f) => ({ ...f, downloadUrl: await presignDownload(f.r2Key) })),
  );
  return NextResponse.json({ files: withUrls });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const work = await db.work.findFirst({ where: { id, userId }, select: { id: true } });
  if (!work) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const filename = String(body.filename ?? "").trim();
  const mime = String(body.mime ?? "");
  const sizeBytes = Number(body.sizeBytes ?? 0);
  const purpose = String(body.purpose ?? "reference");
  if (!filename) return NextResponse.json({ error: "Filename is required." }, { status: 400 });
  if (!ALLOWED_MIME.has(mime))
    return NextResponse.json({ error: "File type not allowed (PDF, DOCX, TXT, MD, images)." }, { status: 400 });
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_FILE_BYTES)
    return NextResponse.json({ error: "File must be between 1 byte and 25 MB." }, { status: 400 });

  const fileId = randomUUID();
  const key = r2Key(userId, id, fileId, filename);
  const file = await db.file.create({
    data: { id: fileId, userId, workId: id, r2Key: key, filename, mime, sizeBytes, purpose },
  });
  try {
    const uploadUrl = await presignUpload(key, mime);
    return NextResponse.json({ file, uploadUrl }, { status: 201 });
  } catch (e) {
    await db.file.delete({ where: { id: fileId } });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage unavailable." },
      { status: 502 },
    );
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId") ?? "";
  const file = await db.file.findFirst({ where: { id: fileId, userId, workId: id } });
  if (!file) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { deleteObject } = await import("@/lib/r2");
  await deleteObject(file.r2Key).catch(() => {});
  await db.file.delete({ where: { id: fileId } });
  return NextResponse.json({ ok: true });
}
