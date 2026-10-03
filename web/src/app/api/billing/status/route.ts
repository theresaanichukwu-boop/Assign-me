import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await db.subscription.findUnique({ where: { userId } });
  return NextResponse.json({
    subscription: sub ?? { plan: "free", status: "active", trialUsed: false },
  });
}
