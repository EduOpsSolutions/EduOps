-- AlterTable
ALTER TABLE `course` ADD COLUMN `adviserId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_adviserId_fkey` FOREIGN KEY (`adviserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
