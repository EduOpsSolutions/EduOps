/*
  Warnings:

  - The values [visibile] on the enum `course_visibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `course` MODIFY `visibility` ENUM('hidden', 'visible') NOT NULL;
