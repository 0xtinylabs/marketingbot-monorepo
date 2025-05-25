/*
  Warnings:

  - You are about to alter the column `token_count` on the `SessionHistoryRecord` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SessionHistoryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "is_loop" BOOLEAN NOT NULL,
    "is_flat" BOOLEAN NOT NULL,
    "is_success" BOOLEAN NOT NULL,
    "is_fail" BOOLEAN NOT NULL,
    "is_working" BOOLEAN NOT NULL,
    "wallet_index" INTEGER NOT NULL,
    "usd_value" INTEGER NOT NULL,
    "token_count" BIGINT NOT NULL,
    "ticker" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    CONSTRAINT "SessionHistoryRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SessionHistoryRecord" ("created_at", "id", "is_fail", "is_flat", "is_loop", "is_success", "is_working", "sessionId", "ticker", "token_count", "type", "updated_at", "usd_value", "wallet_index") SELECT "created_at", "id", "is_fail", "is_flat", "is_loop", "is_success", "is_working", "sessionId", "ticker", "token_count", "type", "updated_at", "usd_value", "wallet_index" FROM "SessionHistoryRecord";
DROP TABLE "SessionHistoryRecord";
ALTER TABLE "new_SessionHistoryRecord" RENAME TO "SessionHistoryRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
