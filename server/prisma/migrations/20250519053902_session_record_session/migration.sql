-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "is_running" BOOLEAN NOT NULL,
    "time_min" INTEGER NOT NULL,
    "time_max" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "is_flat" BOOLEAN NOT NULL,
    "is_loop" BOOLEAN NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Session" ("created_at", "id", "is_flat", "is_loop", "is_running", "percentage", "time_max", "time_min", "type", "updated_at") SELECT "created_at", "id", "is_flat", "is_loop", "is_running", "percentage", "time_max", "time_min", "type", "updated_at" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
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
    "token_count" INTEGER NOT NULL,
    "ticker" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    CONSTRAINT "SessionHistoryRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SessionHistoryRecord" ("created_at", "id", "is_fail", "is_flat", "is_loop", "is_success", "is_working", "ticker", "token_count", "type", "updated_at", "usd_value", "wallet_index") SELECT "created_at", "id", "is_fail", "is_flat", "is_loop", "is_success", "is_working", "ticker", "token_count", "type", "updated_at", "usd_value", "wallet_index" FROM "SessionHistoryRecord";
DROP TABLE "SessionHistoryRecord";
ALTER TABLE "new_SessionHistoryRecord" RENAME TO "SessionHistoryRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
