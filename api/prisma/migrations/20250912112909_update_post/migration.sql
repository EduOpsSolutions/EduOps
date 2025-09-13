/*
  Warnings:

  - You are about to drop the column `department` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `postedBy` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `enrollment_request` MODIFY `idPhotoPath` LONGTEXT NULL,
    MODIFY `validIdPath` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `department`,
    DROP COLUMN `postedBy`;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` LONGTEXT NOT NULL,
    `token` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `originalName` VARCHAR(191) NULL,
    `directory` VARCHAR(191) NULL DEFAULT 'uncategorized',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `files_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
