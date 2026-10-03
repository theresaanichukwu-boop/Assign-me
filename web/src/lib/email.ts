import { Resend } from "resend";

// Central email sender — server-side only. Never import this from client components.
// To switch to a verified AssignMe domain later, set RESEND_FROM_EMAIL
// (e.g. "AssignMe <noreply@assignme.com>") and redeploy. No code changes needed.

export function emailFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL ??
    process.env.EMAIL_FROM ??
    "AssignMe <onboarding@resend.dev>"
  );
}

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { error } = await client().emails.send({ from: emailFrom(), ...opts });
  if (error) throw new Error(`Resend: ${error.message}`);
}
