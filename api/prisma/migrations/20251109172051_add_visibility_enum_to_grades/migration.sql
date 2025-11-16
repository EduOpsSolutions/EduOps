-- AlterTable
ALTER TABLE `notification` MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `student_grade` ADD COLUMN `visibility` ENUM('hidden', 'visible') NOT NULL DEFAULT 'hidden';
