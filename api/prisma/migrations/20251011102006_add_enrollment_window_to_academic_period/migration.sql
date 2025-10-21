/*
  Warnings:

  - You are about to drop the column `status` on the `academic_period` table. All the data in the column will be lost.
  - Added the required column `enrollmentCloseAt` to the `academic_period` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentOpenAt` to the `academic_period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `academic_period` DROP COLUMN `status`,
    ADD COLUMN `enrollmentCloseAt` DATETIME(3) NOT NULL,
    ADD COLUMN `enrollmentOpenAt` DATETIME(3) NOT NULL,
    ADD COLUMN `isEnrollmentClosed` BOOLEAN NOT NULL DEFAULT false;
