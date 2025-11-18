/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_idempotencyKey_key` ON `payments`(`idempotencyKey`);
