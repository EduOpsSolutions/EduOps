/*
  Warnings:

  - You are about to drop the column `studentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentId` on the `payments` table. All the data in the column will be lost.
  - Made the column `userId` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_enrollmentId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_userId_fkey`;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `studentId`,
    DROP COLUMN `enrollmentId`,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
