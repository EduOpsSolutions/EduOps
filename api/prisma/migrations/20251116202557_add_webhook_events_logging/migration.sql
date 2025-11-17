-- CreateTable
CREATE TABLE `webhook_events` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `signature` TEXT NULL,
    `signatureVerified` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('pending', 'processing', 'success', 'failed') NOT NULL DEFAULT 'pending',
    `processedAt` DATETIME(3) NULL,
    `processingTimeMs` INTEGER NULL,
    `error` TEXT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `lastRetryAt` DATETIME(3) NULL,
    `paymentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `webhook_events_eventId_key`(`eventId`),
    INDEX `webhook_events_eventType_idx`(`eventType`),
    INDEX `webhook_events_status_idx`(`status`),
    INDEX `webhook_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
