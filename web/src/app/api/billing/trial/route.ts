import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";

// Free trial / limited premium preview — one claim per student (PRD §14).
export async function POST() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await db.subscription.findUnique({ where: { userId } });
  if (existing?.trialUsed)
    return NextResponse.json({ error: "Trial already used." }, { status: 409 });
  const sub = await db.subscription.upsert({
    where: { userId },
    create: { userId, plan: "trial", status: "active", provider: "paystack", trialUsed: true },
    update: { plan: "trial", status: "active", trialUsed: true },
  });
  return NextResponse.json({ subscription: sub }, { status: 201 });
}
