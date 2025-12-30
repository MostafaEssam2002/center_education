/*
  Warnings:

  - A unique constraint covering the columns `[courseId,order]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Chapter_courseId_order_key` ON `Chapter`(`courseId`, `order`);
