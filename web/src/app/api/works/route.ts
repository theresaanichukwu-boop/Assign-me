import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { WORK_TYPES, getWorkType } from "@/lib/work-types";

const ENUM: Record<string, "PROJECT" | "SEMINAR" | "ASSIGNMENT" | "TERM_PAPER" | "ESSAY" | "LIT_REVIEW" | "CASE_STUDY" | "PROPOSAL" | "PRESENTATION"> = {
  project: "PROJECT",
  seminar: "SEMINAR",
  assignment: "ASSIGNMENT",
  "term-paper": "TERM_PAPER",
  essay: "ESSAY",
  "lit-review": "LIT_REVIEW",
  "case-study": "CASE_STUDY",
  proposal: "PROPOSAL",
  presentation: "PRESENTATION",
};

export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const works = await db.work.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, type: true, status: true, updatedAt: true },
  });
  return NextResponse.json({ works });
}

export async function POST(req: Request) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  const slug = String(body.workType ?? "");
  if (!(WORK_TYPES as readonly string[]).includes(slug))
    return NextResponse.json({ error: "Unknown work type." }, { status: 400 });
  const def = getWorkType(slug);
  const title = String(body.title ?? "").trim() || `Untitled ${def.label}`;
  const topic = String(body.topic ?? "").trim() || null;

  const profile = await db.profile.findUnique({ where: { userId } });
  const work = await db.work.create({
    data: {
      userId,
      disciplineId: null,
      type: ENUM[slug],
      title,
      topic,
      objectives: (body.objectives as object) ?? undefined,
      questions: (body.questions as object) ?? undefined,
      requirements: (body.requirements as object) ?? undefined,
      style: profile?.citationStyle ?? "APA 7",
      status: "IN_PROGRESS",
    },
    select: { id: true, title: true, type: true, status: true },
  });
  return NextResponse.json({ work }, { status: 201 });
}
