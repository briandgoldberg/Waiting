-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "state" TEXT,
    "county" TEXT,
    "capacityValue" DOUBLE PRECISION,
    "capacityUnit" TEXT,
    "applicationFiledDate" TIMESTAMP(3),
    "dateConfidence" TEXT NOT NULL DEFAULT 'exact',
    "currentStatus" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "causeDetail" TEXT NOT NULL,
    "isAggregateExample" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMwDelayed" DOUBLE PRECISION,
    "verificationStatus" TEXT NOT NULL DEFAULT 'verified',
    "dataQualityNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCause" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "causeSlug" TEXT NOT NULL,

    CONSTRAINT "ProjectCause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSource" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ProjectSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dateConfidence" TEXT NOT NULL DEFAULT 'exact',
    "stage" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "state" TEXT,
    "county" TEXT,
    "capacityValue" DOUBLE PRECISION,
    "capacityUnit" TEXT,
    "applicationFiledDate" TIMESTAMP(3),
    "causeSlugs" TEXT NOT NULL,
    "causeDetail" TEXT NOT NULL,
    "sourceUrls" TEXT NOT NULL,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "publishedProjectId" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");

-- CreateIndex
CREATE INDEX "Project_fuelType_idx" ON "Project"("fuelType");

-- CreateIndex
CREATE INDEX "Project_currentStage_idx" ON "Project"("currentStage");

-- CreateIndex
CREATE INDEX "Project_verificationStatus_idx" ON "Project"("verificationStatus");

-- CreateIndex
CREATE INDEX "ProjectCause_causeSlug_idx" ON "ProjectCause"("causeSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCause_projectId_causeSlug_key" ON "ProjectCause"("projectId", "causeSlug");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectCause" ADD CONSTRAINT "ProjectCause_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSource" ADD CONSTRAINT "ProjectSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
