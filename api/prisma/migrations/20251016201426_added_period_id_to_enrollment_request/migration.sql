-- AlterTable
ALTER TABLE `enrollment_request` ADD COLUMN `periodId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `enrollment_request` ADD CONSTRAINT `enrollment_request_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `academic_period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
