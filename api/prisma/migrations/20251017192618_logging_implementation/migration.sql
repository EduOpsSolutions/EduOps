/*
  Warnings:

  - The primary key for the `logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `initiatedByAdmin` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedByStudent` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedBySystem` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedByTeacher` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `logs` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `updatedAt` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `logs` DROP PRIMARY KEY,
    DROP COLUMN `initiatedByAdmin`,
    DROP COLUMN `initiatedByStudent`,
    DROP COLUMN `initiatedBySystem`,
    DROP COLUMN `initiatedByTeacher`,
    DROP COLUMN `moduleId`,
    DROP COLUMN `sourceId`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `moduleType` ENUM('UNCATEGORIZED', 'AUTH', 'ENROLLMENTS', 'SCHEDULES', 'GRADING', 'DOCUMENTS', 'PAYMENTS', 'REPORTS', 'CONTENTS', 'SYSTEM') NOT NULL DEFAULT 'UNCATEGORIZED',
    ADD COLUMN `reqBody` TEXT NULL,
    ADD COLUMN `type` ENUM('user_activity', 'system_activity', 'api_response', 'error_log', 'security_log', 'other') NOT NULL DEFAULT 'user_activity',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `content` TEXT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
