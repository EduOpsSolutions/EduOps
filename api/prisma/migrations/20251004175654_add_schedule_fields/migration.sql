-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `color` VARCHAR(191) NULL DEFAULT '#FFCF00',
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `periodEnd` DATETIME(3) NULL,
    ADD COLUMN `periodStart` DATETIME(3) NULL,
    ADD COLUMN `time_end` VARCHAR(191) NULL,
    ADD COLUMN `time_start` VARCHAR(191) NULL,
    MODIFY `time` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `profilePicLink` VARCHAR(191) NULL;
