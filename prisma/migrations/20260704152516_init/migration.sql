-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "posterPath" TEXT,
    "overview" TEXT,
    "watchedAt" TIMESTAMP(3),
    "rating" DECIMAL(3,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_tmdbId_key" ON "favorites"("tmdbId");
