/*
  Warnings:

  - You are about to drop the column `status` on the `monitor_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `analyses` MODIFY `image` VARCHAR(8) NOT NULL DEFAULT '📦';

-- AlterTable
ALTER TABLE `monitor_items` DROP COLUMN `status`,
    ADD COLUMN `name` VARCHAR(512) NOT NULL DEFAULT '',
    ADD COLUMN `shop_name` VARCHAR(256) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `monitor_products` ADD COLUMN `configs` JSON NULL,
    MODIFY `image` VARCHAR(768) NOT NULL DEFAULT '📦';
