/*
  Warnings:

  - You are about to drop the column `checkoutUrl` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymongoId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` DROP COLUMN `checkoutUrl`,
    DROP COLUMN `paymongoId`,
    ADD COLUMN `paymentIntentId` VARCHAR(191) NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_transactionId_key` ON `payments`(`transactionId`);
