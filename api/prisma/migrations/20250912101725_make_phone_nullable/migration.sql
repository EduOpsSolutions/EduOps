/*
  Warnings:

  - Made the column `feeType` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `payments` MODIFY `feeType` VARCHAR(191) NOT NULL;
