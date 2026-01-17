/*
  Warnings:

  - You are about to alter the column `status` on the `enrollmentrequest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `enrollmentrequest` MODIFY `status` ENUM('SENT', 'WAIT_FOR_PAY', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'SENT';
