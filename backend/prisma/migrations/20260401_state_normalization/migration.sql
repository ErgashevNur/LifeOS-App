CREATE TABLE IF NOT EXISTS "PublicContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublicContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DashboardTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DashboardTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Habit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "completedDays" INTEGER NOT NULL DEFAULT 0,
    "completedToday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "readPages" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BookComment" (
    "id" BIGSERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HealthOverview" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "waterMl" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthOverview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HealthLog" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "waterMl" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MasterySkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MasterySkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FocusSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NetworkPerson" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "mutualFriends" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NetworkPerson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NetworkConnection" (
    "id" BIGSERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NetworkConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NetworkMessage" (
    "id" BIGSERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NetworkMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AssistantMessage" (
    "id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssistantMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AppSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL,
    "notifyHabits" BOOLEAN NOT NULL DEFAULT true,
    "notifyGoals" BOOLEAN NOT NULL DEFAULT true,
    "notifyAssistant" BOOLEAN NOT NULL DEFAULT false,
    "integrationCalendar" BOOLEAN NOT NULL DEFAULT true,
    "integrationSmartwatch" BOOLEAN NOT NULL DEFAULT false,
    "integrationMobileSync" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NetworkConnection_personId_key" ON "NetworkConnection"("personId");

CREATE INDEX IF NOT EXISTS "DashboardTask_createdAt_idx" ON "DashboardTask"("createdAt");
CREATE INDEX IF NOT EXISTS "Goal_createdAt_idx" ON "Goal"("createdAt");
CREATE INDEX IF NOT EXISTS "Goal_period_idx" ON "Goal"("period");
CREATE INDEX IF NOT EXISTS "Habit_createdAt_idx" ON "Habit"("createdAt");
CREATE INDEX IF NOT EXISTS "Book_createdAt_idx" ON "Book"("createdAt");
CREATE INDEX IF NOT EXISTS "Book_category_idx" ON "Book"("category");
CREATE INDEX IF NOT EXISTS "BookComment_bookId_createdAt_idx" ON "BookComment"("bookId", "createdAt");
CREATE INDEX IF NOT EXISTS "HealthLog_createdAt_idx" ON "HealthLog"("createdAt");
CREATE INDEX IF NOT EXISTS "MasterySkill_createdAt_idx" ON "MasterySkill"("createdAt");
CREATE INDEX IF NOT EXISTS "FocusSession_date_idx" ON "FocusSession"("date");
CREATE INDEX IF NOT EXISTS "FocusSession_skillId_idx" ON "FocusSession"("skillId");
CREATE INDEX IF NOT EXISTS "NetworkMessage_personId_createdAt_idx" ON "NetworkMessage"("personId", "createdAt");
CREATE INDEX IF NOT EXISTS "AssistantMessage_createdAt_idx" ON "AssistantMessage"("createdAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BookComment_bookId_fkey'
    ) THEN
        ALTER TABLE "BookComment"
        ADD CONSTRAINT "BookComment_bookId_fkey"
        FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FocusSession_skillId_fkey'
    ) THEN
        ALTER TABLE "FocusSession"
        ADD CONSTRAINT "FocusSession_skillId_fkey"
        FOREIGN KEY ("skillId") REFERENCES "MasterySkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NetworkConnection_personId_fkey'
    ) THEN
        ALTER TABLE "NetworkConnection"
        ADD CONSTRAINT "NetworkConnection_personId_fkey"
        FOREIGN KEY ("personId") REFERENCES "NetworkPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NetworkMessage_personId_fkey'
    ) THEN
        ALTER TABLE "NetworkMessage"
        ADD CONSTRAINT "NetworkMessage_personId_fkey"
        FOREIGN KEY ("personId") REFERENCES "NetworkPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
