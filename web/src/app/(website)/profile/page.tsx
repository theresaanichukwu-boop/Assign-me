import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="font-serif text-2xl text-navy">Your academic profile</h1>
      <p className="mt-1 text-sm text-muted">
        Tell AssignMe what you study — it personalizes everything.
      </p>
      <ProfileForm
        initial={
          profile
            ? {
                course: profile.course,
                university: profile.university,
                faculty: profile.faculty ?? "",
                department: profile.department,
                level: profile.level,
                country: profile.country ?? "",
                citationStyle: profile.citationStyle,
              }
            : null
        }
      />
    </main>
  );
}
