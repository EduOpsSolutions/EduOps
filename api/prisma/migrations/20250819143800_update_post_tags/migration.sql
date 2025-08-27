/*
  Warnings:

  - The values [broadcast] on the enum `posts_tag` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `posts` MODIFY `tag` ENUM('global', 'student', 'teacher') NOT NULL DEFAULT 'global';
