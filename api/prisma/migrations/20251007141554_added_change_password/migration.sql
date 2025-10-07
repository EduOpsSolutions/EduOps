-- AlterTable
ALTER TABLE `academic_period` ADD COLUMN `status` ENUM('upcoming', 'ongoing', 'ended') NOT NULL DEFAULT 'upcoming';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `changePassword` BOOLEAN NOT NULL DEFAULT true;
