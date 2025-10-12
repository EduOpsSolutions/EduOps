/*
  Warnings:

  - You are about to drop the `document_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_validations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `document_requests` DROP FOREIGN KEY `document_requests_documentId_fkey`;

-- DropForeignKey
ALTER TABLE `document_requests` DROP FOREIGN KEY `document_requests_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `document_validations` DROP FOREIGN KEY `document_validations_userId_fkey`;

-- DropTable
DROP TABLE `document_requests`;

-- DropTable
DROP TABLE `document_templates`;

-- DropTable
DROP TABLE `document_validations`;

-- CreateTable
CREATE TABLE `document_template` (
    `id` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `privacy` ENUM('public', 'student_only', 'teacher_only') NOT NULL DEFAULT 'public',
    `requestBasis` BOOLEAN NOT NULL DEFAULT false,
    `downloadable` BOOLEAN NOT NULL DEFAULT true,
    `price` ENUM('free', 'paid') NOT NULL DEFAULT 'free',
    `amount` DECIMAL(10, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_request` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `mode` ENUM('pickup', 'delivery') NULL DEFAULT 'pickup',
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `purpose` TEXT NULL,
    `additionalNotes` TEXT NULL,
    `status` ENUM('in_process', 'in_transit', 'delivered', 'failed', 'fulfilled') NOT NULL DEFAULT 'in_process',
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_validation` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `documentName` VARCHAR(191) NULL,
    `fileSignature` VARCHAR(191) NOT NULL,
    `isValid` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_validation_fileSignature_key`(`fileSignature`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_request` ADD CONSTRAINT `document_request_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document_template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_request` ADD CONSTRAINT `document_request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_validation` ADD CONSTRAINT `document_validation_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document_template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_validation` ADD CONSTRAINT `document_validation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
