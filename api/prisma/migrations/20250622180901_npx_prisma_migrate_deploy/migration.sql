-- Conditionally add `phoneNumber` column to `users` if it does not exist (compatible with MySQL < 8.0)
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'phoneNumber'
);

SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `phoneNumber` VARCHAR(191) NULL',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
