/*
  Warnings:

  - You are about to drop the column `adviserId` on the `course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `course_adviserId_fkey`;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `adviserId`;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `teacherId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `student_enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `status` ENUM('enrolled', 'completed', 'dropped', 'withdrawn') NOT NULL DEFAULT 'enrolled',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `student_enrollment_studentId_periodId_key`(`studentId`, `periodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `schedule_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_schedule` ADD CONSTRAINT `user_schedule_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_schedule` ADD CONSTRAINT `user_schedule_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollment` ADD CONSTRAINT `student_enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollment` ADD CONSTRAINT `student_enrollment_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `academic_period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
