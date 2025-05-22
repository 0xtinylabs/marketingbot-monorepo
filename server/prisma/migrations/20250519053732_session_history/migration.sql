-- CreateTable
CREATE TABLE "SessionHistoryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "is_loop" BOOLEAN NOT NULL,
    "is_flat" BOOLEAN NOT NULL,
    "is_success" BOOLEAN NOT NULL,
    "is_fail" BOOLEAN NOT NULL,
    "is_working" BOOLEAN NOT NULL,
    "wallet_index" INTEGER NOT NULL,
    "usd_value" INTEGER NOT NULL,
    "token_count" INTEGER NOT NULL,
    "ticker" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
