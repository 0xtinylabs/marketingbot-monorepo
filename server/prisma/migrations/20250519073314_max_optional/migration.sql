-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "is_running" BOOLEAN NOT NULL,
    "time_min" INTEGER NOT NULL,
    "time_max" INTEGER,
    "percentage" INTEGER NOT NULL,
    "is_flat" BOOLEAN NOT NULL,
    "is_loop" BOOLEAN NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Session" ("created_at", "ended_at", "id", "is_flat", "is_loop", "is_running", "percentage", "started_at", "time_max", "time_min", "type", "updated_at") SELECT "created_at", "ended_at", "id", "is_flat", "is_loop", "is_running", "percentage", "started_at", "time_max", "time_min", "type", "updated_at" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
