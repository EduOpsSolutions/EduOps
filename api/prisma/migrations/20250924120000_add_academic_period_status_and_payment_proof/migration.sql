-- AlterTable
ALTER TABLE `academic_period` ADD `status` ENUM('upcoming', 'ongoing', 'ended') NOT NULL DEFAULT 'upcoming';

-- AlterTable
ALTER TABLE `enrollment_request` ADD COLUMN `paymentProofPath` LONGTEXT NULL;