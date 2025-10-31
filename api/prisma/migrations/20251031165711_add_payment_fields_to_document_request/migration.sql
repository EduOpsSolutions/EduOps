-- AlterTable
ALTER TABLE `document_request` ADD COLUMN `paymentAmount` DECIMAL(10, 2) NULL,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NULL DEFAULT 'pending',
    ADD COLUMN `paymentUrl` LONGTEXT NULL;
