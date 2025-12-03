-- AlterTable
ALTER TABLE `enrollment_request` ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `enrollment_request` ADD CONSTRAINT `enrollment_request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
