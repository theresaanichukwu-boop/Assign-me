import { createHmac, timingSafeEqual } from "crypto";
import { PLANS, type PlanSlug } from "./plans";

// Paystack billing — PRD §14. Amounts in kobo (NGN × 100).
// Pricing is a placeholder to be tested with real users.

const API = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export async function initializeTransaction(opts: {
  email: string;
  plan: PlanSlug;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const r = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: PLANS[opts.plan].amount,
      callback_url: opts.callbackUrl,
      metadata: { plan: opts.plan, ...(opts.metadata ?? {}) },
    }),
  });
  const data = (await r.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; reference: string };
  };
  if (!r.ok || !data.status || !data.data)
    throw new Error(`Paystack initialize failed: ${data.message}`);
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{
  paid: boolean;
  plan: string | null;
  email: string;
}> {
  const r = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
  });
  const data = (await r.json()) as {
    status: boolean;
    data?: { status: string; customer?: { email?: string }; metadata?: { plan?: string } };
  };
  const ok = r.ok && data.status && data.data?.status === "success";
  return {
    paid: !!ok,
    plan: data.data?.metadata?.plan ?? null,
    email: data.data?.customer?.email ?? "",
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const hookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!hookSecret || !signature) return false;
  const hash = createHmac("sha512", hookSecret).update(rawBody).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
