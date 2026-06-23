-- Password reset tokens.
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExp" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
