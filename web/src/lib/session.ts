import { headers } from "next/headers";
import { auth } from "./auth";

export async function sessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}
