/*
  Warnings:

  - You are about to drop the column `postedBy` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `posts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_userId_fkey`;

-- AlterTable
ALTER TABLE `enrollment_request` MODIFY `idPhotoPath` LONGTEXT NULL,
    MODIFY `validIdPath` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `postedBy`,
    DROP COLUMN `userId`;

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

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `feeType` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PHP',
    `status` ENUM('pending', 'paid', 'failed', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    `paymentMethod` VARCHAR(191) NULL,
    `checkoutUrl` LONGTEXT NULL,
    `paymongoResponse` JSON NULL,
    `paidAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_paymentId_key`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollment_request`(`enrollmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
