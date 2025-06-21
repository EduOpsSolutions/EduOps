/*
  Warnings:

  - You are about to drop the column `details` on the `course` table. All the data in the column will be lost.
  - Added the required column `visibility` to the `course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` DROP COLUMN `details`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `maxNumber` INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN `schedule` JSON NULL,
    ADD COLUMN `visibility` ENUM('hidden', 'visibile') NOT NULL;

-- CreateTable
CREATE TABLE `course_requisite` (
    `id` VARCHAR(191) NOT NULL,
    `ruleName` VARCHAR(191) NOT NULL,
    `type` ENUM('prerequisite', 'corequisite') NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_period` (
    `id` VARCHAR(191) NOT NULL,
    `batchName` VARCHAR(191) NOT NULL,
    `periodName` VARCHAR(191) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_period_courses` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `academicperiodId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_requisite` ADD CONSTRAINT `course_requisite_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_period_courses` ADD CONSTRAINT `academic_period_courses_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_period_courses` ADD CONSTRAINT `academic_period_courses_academicperiodId_fkey` FOREIGN KEY (`academicperiodId`) REFERENCES `academic_period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
