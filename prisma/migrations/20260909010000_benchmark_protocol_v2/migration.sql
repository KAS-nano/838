ALTER TABLE "CommunitySubmission"
ADD COLUMN "reasonCode" TEXT,
ADD COLUMN "protocolVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "installationKeyId" TEXT;

CREATE INDEX "CommunitySubmission_installationKeyId_createdAt_idx"
ON "CommunitySubmission"("installationKeyId", "createdAt");
