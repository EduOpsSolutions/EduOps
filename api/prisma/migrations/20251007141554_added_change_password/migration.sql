-- AlterTable
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'academic_period'
    AND COLUMN_NAME = 'status'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE `academic_period` ADD COLUMN `status` ENUM(''upcoming'',''ongoing'',''ended'') NOT NULL DEFAULT ''upcoming''',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- AlterTable
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'changePassword'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `changePassword` BOOLEAN NOT NULL DEFAULT true',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
