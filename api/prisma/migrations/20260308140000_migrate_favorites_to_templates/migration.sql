-- CreateTable
CREATE TABLE "StoryTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "socialAccountIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTemplateMedia" (
    "id" TEXT NOT NULL,
    "storyTemplateId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "localUrl" TEXT NOT NULL,
    "publicUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoryTemplateMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoryTemplate" ADD CONSTRAINT "StoryTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTemplateMedia" ADD CONSTRAINT "StoryTemplateMedia_storyTemplateId_fkey" FOREIGN KEY ("storyTemplateId") REFERENCES "StoryTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing favorites to templates
INSERT INTO "StoryTemplate" ("id", "userId", "socialAccountIds", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    s."userId",
    ARRAY(SELECT sa."socialAccountId" FROM "StoryAccount" sa WHERE sa."storyId" = s."id"),
    NOW(),
    NOW()
FROM "Story" s
WHERE s."isFavorite" = true;

-- Migrate media for favorites
INSERT INTO "StoryTemplateMedia" ("id", "storyTemplateId", "type", "localUrl", "publicUrl", "position")
SELECT
    gen_random_uuid()::text,
    st."id",
    sm."type",
    sm."localUrl",
    sm."publicUrl",
    sm."position"
FROM "StoryTemplate" st
JOIN "Story" s ON s."userId" = st."userId" AND s."isFavorite" = true
JOIN "StoryMedia" sm ON sm."storyId" = s."id"
WHERE st."createdAt" >= NOW() - INTERVAL '1 minute';

-- Drop isFavorite column
ALTER TABLE "Story" DROP COLUMN "isFavorite";
