-- CreateTable
CREATE TABLE `document_templates` (
    `id` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `privacy` ENUM('public', 'student_only', 'teacher_only') NOT NULL DEFAULT 'public',
    `requestBasis` BOOLEAN NOT NULL DEFAULT true,
    `downloadable` BOOLEAN NOT NULL DEFAULT false,
    `price` ENUM('free', 'paid') NOT NULL DEFAULT 'free',
    `amount` DECIMAL(10, 2) NULL,
    `uploadFile` VARCHAR(191) NULL,
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_requests` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `status` ENUM('in_process', 'in_transit', 'delivered', 'failed', 'fulfilled') NOT NULL DEFAULT 'in_process',
    `remarks` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `mode` ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
    `paymentMethod` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `purpose` VARCHAR(191) NULL,
    `additionalNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `document_requests_requestId_key`(`requestId`),
    INDEX `document_requests_studentId_fkey`(`studentId`),
    INDEX `document_requests_documentId_fkey`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_validations` (
    `id` VARCHAR(191) NOT NULL,
    `fileSignature` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_validations_fileSignature_key`(`fileSignature`),
    INDEX `document_validations_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_validations` ADD CONSTRAINT `document_validations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
