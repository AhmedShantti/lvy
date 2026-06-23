-- Email verification: gate accounts behind a confirmed email address.
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verifyTokenExp" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");

-- Existing accounts predate verification and are trusted, so mark them verified
-- to avoid locking anyone (incl. the admin) out.
UPDATE "User" SET "emailVerified" = true;
