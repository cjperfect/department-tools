/*
  Warnings:

  - You are about to drop the column `name` on the `monitor_products` table. All the data in the column will be lost.
  - Added the required column `keyword` to the `monitor_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `analyses` MODIFY `image` VARCHAR(8) NOT NULL DEFAULT '📦';

-- AlterTable
ALTER TABLE `monitor_products` DROP COLUMN `name`,
    ADD COLUMN `keyword` VARCHAR(512) NOT NULL,
    MODIFY `image` VARCHAR(768) NOT NULL DEFAULT '📦';
