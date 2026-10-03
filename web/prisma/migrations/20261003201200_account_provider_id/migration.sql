-- Better Auth 1.7 uses providerId (not provider) on Account.
-- Account table is empty (no successful signups yet), so replace directly.
ALTER TABLE "Account" DROP COLUMN "provider";
ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;
ALTER TABLE "Account" ADD CONSTRAINT "Account_providerId_accountId_key" UNIQUE ("providerId", "accountId");
