/*
  Warnings:

  - You are about to drop the column `userId` on the `logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_userId_fkey`;

-- AlterTable
ALTER TABLE `logs` DROP COLUMN `userId`;
