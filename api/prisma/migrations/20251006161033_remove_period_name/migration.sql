/*
  Warnings:

  - You are about to drop the column `periodName` on the `academic_period` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `academic_period` DROP COLUMN `periodName`;

-- AlterTable
ALTER TABLE `users` MODIFY `profilePicLink` LONGTEXT NULL;
