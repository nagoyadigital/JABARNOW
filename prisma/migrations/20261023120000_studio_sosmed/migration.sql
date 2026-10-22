-- Studio Sosmed: paket konten sosmed turunan artikel. Hanya menambah tabel.

-- CreateEnum
CREATE TYPE "SocialFormat" AS ENUM ('SINGLE', 'CAROUSEL');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'POSTED', 'FAILED', 'REJECTED');

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "format" "SocialFormat" NOT NULL,
    "template" TEXT NOT NULL,
    "kicker" TEXT,
    "headline" TEXT NOT NULL,
    "headlineAlts" TEXT[],
    "highlight" TEXT,
    "slides" JSONB NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "imageUrl" TEXT,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "generatedBy" TEXT NOT NULL DEFAULT 'rules',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_articleId_format_key" ON "SocialPost"("articleId", "format");

-- CreateIndex
CREATE INDEX "SocialPost_status_createdAt_idx" ON "SocialPost"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
