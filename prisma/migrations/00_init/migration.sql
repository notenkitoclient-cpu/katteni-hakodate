-- CreateTable
CREATE TABLE "Store" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location_area" TEXT NOT NULL,
    "address" TEXT,
    "contact_tel" TEXT,
    "reservation_url" TEXT,
    "sns_instagram" TEXT,
    "sns_x" TEXT,
    "sns_facebook" TEXT,
    "sns_line" TEXT,
    "video_url" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "our_challenge" TEXT,
    "user_comment" TEXT,
    "hidden_gem" TEXT,
    "vibe_level" INTEGER,
    "opening_hours" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "share_banner_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

