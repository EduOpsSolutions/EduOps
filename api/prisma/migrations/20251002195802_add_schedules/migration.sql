-- AlterTable
ALTER TABLE `users` MODIFY `profilePicLink` LONGTEXT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS `schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `days` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `periodId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `user_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NULL,
    `scheduleId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `schedule_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `schedule_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `academic_period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
