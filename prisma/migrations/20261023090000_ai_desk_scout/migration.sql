-- AI Desk Tahap 7: sumber berita, topik hasil Scout, log agent.
-- Tidak mengubah tabel yang sudah ada.

-- CreateEnum
CREATE TYPE "NewsSourceKind" AS ENUM ('RSS', 'TRENDS');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('NEW', 'PASSED', 'FAILED', 'WRITING', 'WRITTEN', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('SCOUT', 'ANALIS', 'COPYWRITER', 'DESIGNER', 'PUBLISHER');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('RUNNING', 'OK', 'ERROR');

-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "kind" "NewsSourceKind" NOT NULL DEFAULT 'RSS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastNewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titleKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "imageUrl" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'id',
    "score" INTEGER,
    "scoreReason" TEXT,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT,
    "categorySlug" TEXT,
    "regionSlug" TEXT,
    "status" "TopicStatus" NOT NULL DEFAULT 'NEW',
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agent" "AgentName" NOT NULL,
    "trigger" TEXT NOT NULL DEFAULT 'cron',
    "status" "AgentRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "items" INTEGER NOT NULL DEFAULT 0,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,5) NOT NULL DEFAULT 0,
    "summary" TEXT,
    "error" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsSource_url_key" ON "NewsSource"("url");

-- CreateIndex
CREATE INDEX "NewsSource_isActive_idx" ON "NewsSource"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_url_key" ON "Topic"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_articleId_key" ON "Topic"("articleId");

-- CreateIndex
CREATE INDEX "Topic_status_createdAt_idx" ON "Topic"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Topic_titleKey_idx" ON "Topic"("titleKey");

-- CreateIndex
CREATE INDEX "Topic_sourceId_createdAt_idx" ON "Topic"("sourceId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_agent_startedAt_idx" ON "AgentRun"("agent", "startedAt");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewsSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
