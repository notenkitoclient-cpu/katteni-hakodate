-- AlterTable
ALTER TABLE "Store" ADD COLUMN "website_url" TEXT;

-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'その他',
    "area" TEXT,
    "body" TEXT,
    "url" TEXT,
    "source" TEXT,
    "reporter" TEXT NOT NULL DEFAULT '編集部',
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
