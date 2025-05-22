/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Wallet_wallet_address_key" ON "Wallet"("wallet_address");
