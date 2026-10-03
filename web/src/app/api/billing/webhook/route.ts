import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";

interface PaystackEvent {
  event: string;
  data: {
    status?: string;
    reference?: string;
    customer?: { email?: string };
    metadata?: { plan?: string; userId?: string };
  };
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature))
    return NextResponse.json({ error: "Bad signature." }, { status: 401 });

  let evt: PaystackEvent;
  try {
    evt = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  if (evt.event === "charge.success" && evt.data.status === "success") {
    const userId = evt.data.metadata?.userId;
    const plan = evt.data.metadata?.plan ?? "monthly";
    if (userId) {
      await db.subscription.upsert({
        where: { userId },
        create: { userId, plan, status: "active", provider: "paystack", providerRef: evt.data.reference },
        update: { plan, status: "active", providerRef: evt.data.reference },
      });
    }
  }
  return NextResponse.json({ received: true });
}
