import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const CITATION_STYLES = ["APA 7", "MLA", "Harvard", "Chicago", "Vancouver", "IEEE"];

async function sessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await db.profile.findUnique({ where: { userId } });
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  const course = String(body.course ?? "").trim();
  const university = String(body.university ?? "").trim();
  const department = String(body.department ?? "").trim();
  const level = String(body.level ?? "").trim();
  const citationStyle = String(body.citationStyle ?? "APA 7");
  if (!course || !university || !department || !level)
    return NextResponse.json(
      { error: "Course, university, department, and level are required." },
      { status: 400 },
    );
  if (!CITATION_STYLES.includes(citationStyle))
    return NextResponse.json({ error: "Unsupported citation style." }, { status: 400 });
  const profile = await db.profile.upsert({
    where: { userId },
    create: {
      userId,
      course,
      university,
      faculty: (body.faculty as string) || null,
      department,
      level,
      country: (body.country as string) || null,
      citationStyle,
      requirements: (body.requirements as object) ?? undefined,
    },
    update: {
      course,
      university,
      faculty: (body.faculty as string) || null,
      department,
      level,
      country: (body.country as string) || null,
      citationStyle,
      requirements: (body.requirements as object) ?? undefined,
    },
  });
  return NextResponse.json({ profile });
}
