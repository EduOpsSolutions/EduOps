/*
  Warnings:

  - You are about to drop the column `enrollmentData` on the `enrollment_request` table. All the data in the column will be lost.
  - Added the required column `address` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDate` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `civilStatus` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coursesToEnroll` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredEmail` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referredBy` to the `enrollment_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `enrollment_request` DROP COLUMN `enrollmentData`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `altContactNumber` VARCHAR(191) NULL,
    ADD COLUMN `altEmail` VARCHAR(191) NULL,
    ADD COLUMN `birthDate` DATETIME(3) NOT NULL,
    ADD COLUMN `civilStatus` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `coursesToEnroll` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherContact` VARCHAR(191) NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `guardianContact` VARCHAR(191) NULL,
    ADD COLUMN `guardianName` VARCHAR(191) NULL,
    ADD COLUMN `idPhotoPath` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `motherContact` VARCHAR(191) NULL,
    ADD COLUMN `motherName` VARCHAR(191) NULL,
    ADD COLUMN `preferredEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `referredBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `validIdPath` VARCHAR(191) NULL;
