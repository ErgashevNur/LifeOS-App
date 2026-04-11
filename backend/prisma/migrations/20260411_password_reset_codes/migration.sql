CREATE TABLE IF NOT EXISTS "PasswordResetCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PasswordResetCode_userId_createdAt_idx"
ON "PasswordResetCode"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "PasswordResetCode_expiresAt_idx"
ON "PasswordResetCode"("expiresAt");

CREATE INDEX IF NOT EXISTS "PasswordResetCode_consumedAt_idx"
ON "PasswordResetCode"("consumedAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PasswordResetCode_userId_fkey'
    ) THEN
        ALTER TABLE "PasswordResetCode"
        ADD CONSTRAINT "PasswordResetCode_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
