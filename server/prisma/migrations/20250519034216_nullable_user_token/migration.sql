-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet_address" TEXT NOT NULL,
    "target_token" TEXT,
    "target_token_ticker" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("created_at", "id", "target_token", "target_token_ticker", "updated_at", "wallet_address") SELECT "created_at", "id", "target_token", "target_token_ticker", "updated_at", "wallet_address" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_wallet_address_key" ON "User"("wallet_address");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
