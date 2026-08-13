-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "lat" REAL,
    "lon" REAL,
    "state" TEXT,
    "county" TEXT,
    "capacityValue" REAL,
    "capacityUnit" TEXT,
    "applicationFiledDate" DATETIME,
    "dateConfidence" TEXT NOT NULL DEFAULT 'exact',
    "currentStatus" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "causeDetail" TEXT NOT NULL,
    "isAggregateExample" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMwDelayed" REAL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'verified',
    "dataQualityNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectCause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "causeSlug" TEXT NOT NULL,
    CONSTRAINT "ProjectCause_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "ProjectSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dateConfidence" TEXT NOT NULL DEFAULT 'exact',
    "stage" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "lat" REAL,
    "lon" REAL,
    "state" TEXT,
    "county" TEXT,
    "capacityValue" REAL,
    "capacityUnit" TEXT,
    "applicationFiledDate" DATETIME,
    "causeSlugs" TEXT NOT NULL,
    "causeDetail" TEXT NOT NULL,
    "sourceUrls" TEXT NOT NULL,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "publishedProjectId" TEXT
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
