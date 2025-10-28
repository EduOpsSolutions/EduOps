/*
  Warnings:

  - Added the required column `requisiteCourseId` to the `course_requisite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course_requisite` ADD COLUMN `requisiteCourseId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `course_requisite` ADD CONSTRAINT `course_requisite_requisiteCourseId_fkey` FOREIGN KEY (`requisiteCourseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
