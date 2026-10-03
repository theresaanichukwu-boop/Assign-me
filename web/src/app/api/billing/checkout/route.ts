import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  const plan = String(body.plan ?? "") as PlanSlug;
  if (!(plan in PLANS)) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const tx = await initializeTransaction({
      email: session.user.email,
      plan,
      callbackUrl: `${appUrl}/dashboard?billing=callback`,
      metadata: { userId: session.user.id },
    });
    return NextResponse.json({ authorizationUrl: tx.authorizationUrl, reference: tx.reference });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed." },
      { status: 502 },
    );
  }
}
