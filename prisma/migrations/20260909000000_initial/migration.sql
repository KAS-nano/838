-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'NOTEBOOK');

-- CreateEnum
CREATE TYPE "OsType" AS ENUM ('WINDOWS', 'LINUX', 'MACOS');

-- CreateEnum
CREATE TYPE "BenchmarkConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Meu computador',
    "deviceType" "DeviceType" NOT NULL,
    "cpu" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "vramGb" DOUBLE PRECISION NOT NULL,
    "ramGb" DOUBLE PRECISION NOT NULL,
    "storageTotalGb" DOUBLE PRECISION NOT NULL,
    "storageFreeGb" DOUBLE PRECISION NOT NULL,
    "os" "OsType" NOT NULL,
    "distro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "paramsB" DOUBLE PRECISION NOT NULL,
    "activeParamsB" DOUBLE PRECISION,
    "contextK" INTEGER NOT NULL,
    "license" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "description" TEXT NOT NULL,
    "modalities" TEXT[],
    "objectives" TEXT[],
    "benchmarkClass" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVariant" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "quantization" TEXT NOT NULL,
    "diskGb" DOUBLE PRECISION NOT NULL,
    "weightVramGb" DOUBLE PRECISION NOT NULL,
    "qualityFactor" DOUBLE PRECISION NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'GGUF',
    "availability" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "ModelVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelSource" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "etag" TEXT,
    "payloadHash" TEXT NOT NULL,

    CONSTRAINT "ModelSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelArtifact" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "quantization" TEXT NOT NULL,
    "bytes" BIGINT,
    "sha256" TEXT,
    "url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "community" BOOLEAN NOT NULL DEFAULT false,
    "splitGroup" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "availability" TEXT NOT NULL DEFAULT 'available',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelCapability" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "objective" TEXT,
    "evidenceSource" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelLicense" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "url" TEXT,
    "requiresAcceptance" BOOLEAN NOT NULL DEFAULT false,
    "commercialUseKnown" BOOLEAN,

    CONSTRAINT "ModelLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSnapshot" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'candidate',
    "validationReport" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataProvenance" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confidence" TEXT NOT NULL,

    CONSTRAINT "DataProvenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Runtime" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "homepage" TEXT,

    CONSTRAINT "Runtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeCompatibility" (
    "id" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "os" "OsType" NOT NULL,
    "backend" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "RuntimeCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "hardwareProfileId" TEXT,
    "modelId" TEXT NOT NULL,
    "variantId" TEXT,
    "runtimeId" TEXT,
    "contextK" INTEGER NOT NULL,
    "backend" TEXT NOT NULL,
    "os" "OsType" NOT NULL,
    "generationTps" DOUBLE PRECISION NOT NULL,
    "promptTps" DOUBLE PRECISION,
    "vramGb" DOUBLE PRECISION,
    "ramGb" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "measured" BOOLEAN NOT NULL DEFAULT false,
    "confidence" "BenchmarkConfidence" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "homepage" TEXT,
    "githubRepo" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiModel" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contextK" INTEGER,
    "inputUsdPerM" DOUBLE PRECISION,
    "outputUsdPerM" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "hardwareProfileId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "confidence" "BenchmarkConfidence" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationRecipe" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "os" "OsType" NOT NULL,
    "distro" TEXT,
    "toolSlug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "verification" JSONB NOT NULL,
    "uninstall" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstallationRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunitySubmission" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE INDEX "AiModel_family_idx" ON "AiModel"("family");

-- CreateIndex
CREATE INDEX "ModelVariant_quantization_availability_idx" ON "ModelVariant"("quantization", "availability");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVariant_modelId_quantization_key" ON "ModelVariant"("modelId", "quantization");

-- CreateIndex
CREATE INDEX "ModelSource_modelId_fetchedAt_idx" ON "ModelSource"("modelId", "fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModelSource_provider_externalId_key" ON "ModelSource"("provider", "externalId");

-- CreateIndex
CREATE INDEX "ModelArtifact_modelId_format_quantization_availability_idx" ON "ModelArtifact"("modelId", "format", "quantization", "availability");

-- CreateIndex
CREATE UNIQUE INDEX "ModelArtifact_url_key" ON "ModelArtifact"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ModelCapability_modelId_modality_objective_evidenceSource_key" ON "ModelCapability"("modelId", "modality", "objective", "evidenceSource");

-- CreateIndex
CREATE UNIQUE INDEX "ModelLicense_modelId_key" ON "ModelLicense"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogSnapshot_version_key" ON "CatalogSnapshot"("version");

-- CreateIndex
CREATE INDEX "CatalogSnapshot_status_generatedAt_idx" ON "CatalogSnapshot"("status", "generatedAt");

-- CreateIndex
CREATE INDEX "DataProvenance_entityType_entityId_idx" ON "DataProvenance"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DataProvenance_observedAt_idx" ON "DataProvenance"("observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_name_key" ON "Runtime"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeCompatibility_runtimeId_os_backend_key" ON "RuntimeCompatibility"("runtimeId", "os", "backend");

-- CreateIndex
CREATE INDEX "Benchmark_modelId_variantId_idx" ON "Benchmark"("modelId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "ApiModel_provider_idx" ON "ApiModel"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "InstallationRecipe_slug_os_distro_version_key" ON "InstallationRecipe"("slug", "os", "distro", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CommunitySubmission_fingerprint_key" ON "CommunitySubmission"("fingerprint");

-- CreateIndex
CREATE INDEX "CommunitySubmission_status_createdAt_idx" ON "CommunitySubmission"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareProfile" ADD CONSTRAINT "HardwareProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVariant" ADD CONSTRAINT "ModelVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelSource" ADD CONSTRAINT "ModelSource_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelArtifact" ADD CONSTRAINT "ModelArtifact_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelCapability" ADD CONSTRAINT "ModelCapability_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelLicense" ADD CONSTRAINT "ModelLicense_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuntimeCompatibility" ADD CONSTRAINT "RuntimeCompatibility_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_hardwareProfileId_fkey" FOREIGN KEY ("hardwareProfileId") REFERENCES "HardwareProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ModelVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_hardwareProfileId_fkey" FOREIGN KEY ("hardwareProfileId") REFERENCES "HardwareProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

