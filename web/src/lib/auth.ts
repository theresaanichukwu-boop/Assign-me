import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { db } from "./db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your AssignMe password",
        html: `<p>Hi ${user.name},</p><p>Reset your password here:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your AssignMe email",
        html: `<p>Hi ${user.name},</p><p>Verify your email here:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  plugins: [admin(), organization()],
});
