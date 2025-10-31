/*
  Warnings:

  - You are about to drop the column `requisiteCourseId` on the `course_requisite` table. All the data in the column will be lost.
  - You are about to drop the column `periodId` on the `enrollment_request` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `fees` table. All the data in the column will be lost.
  - The primary key for the `logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deletedAt` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `moduleType` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `reqBody` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `feeType` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentEmail` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `grade_file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_fee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_grade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `moduleId` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `course_requisite` DROP FOREIGN KEY `course_requisite_requisiteCourseId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollment_request` DROP FOREIGN KEY `enrollment_request_periodId_fkey`;

-- DropForeignKey
ALTER TABLE `grade_file` DROP FOREIGN KEY `grade_file_studentGradeId_fkey`;

-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_userId_fkey`;

-- DropForeignKey
ALTER TABLE `student_fee` DROP FOREIGN KEY `student_fee_batchId_fkey`;

-- DropForeignKey
ALTER TABLE `student_fee` DROP FOREIGN KEY `student_fee_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `student_fee` DROP FOREIGN KEY `student_fee_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `student_grade` DROP FOREIGN KEY `student_grade_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `student_grade` DROP FOREIGN KEY `student_grade_studentId_fkey`;

-- DropIndex
DROP INDEX `payments_transactionId_key` ON `payments`;

-- AlterTable
ALTER TABLE `course_requisite` DROP COLUMN `requisiteCourseId`;

-- AlterTable
ALTER TABLE `document_request` ADD COLUMN `proofOfPayment` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `enrollment_request` DROP COLUMN `periodId`;

-- AlterTable
ALTER TABLE `fees` DROP COLUMN `dueDate`;

-- AlterTable
ALTER TABLE `logs` DROP PRIMARY KEY,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `moduleType`,
    DROP COLUMN `reqBody`,
    DROP COLUMN `type`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `initiatedByAdmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `initiatedByStudent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `initiatedBySystem` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `initiatedByTeacher` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `moduleId` INTEGER NOT NULL,
    ADD COLUMN `sourceId` INTEGER NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `content` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `feeType`,
    DROP COLUMN `paymentEmail`,
    DROP COLUMN `paymentIntentId`,
    DROP COLUMN `transactionId`,
    ADD COLUMN `checkoutUrl` LONGTEXT NULL,
    ADD COLUMN `paymongoId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `post_files` MODIFY `url` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `grade_file`;

-- DropTable
DROP TABLE `student_fee`;

-- DropTable
DROP TABLE `student_grade`;
