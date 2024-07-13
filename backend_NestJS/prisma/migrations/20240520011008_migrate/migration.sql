/*
  Warnings:

  - You are about to alter the column `interviewNote` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(2500)` to `Json`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `interviewNote` JSON NULL;
