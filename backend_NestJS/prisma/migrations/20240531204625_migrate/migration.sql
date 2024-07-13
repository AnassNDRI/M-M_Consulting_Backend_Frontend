/*
  Warnings:

  - Added the required column `histNumber` to the `Historiques` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobCloseDate` to the `Historiques` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Historiques_JobLocation_key` ON `historiques`;

-- DropIndex
DROP INDEX `Historiques_contractTypetitle_key` ON `historiques`;

-- DropIndex
DROP INDEX `Historiques_jobtitle_key` ON `historiques`;

-- AlterTable
ALTER TABLE `historiques` ADD COLUMN `addressCompany` VARCHAR(255) NULL,
    ADD COLUMN `email` VARCHAR(100) NULL,
    ADD COLUMN `firstnameRecruiter` VARCHAR(255) NULL,
    ADD COLUMN `histNumber` VARCHAR(255) NOT NULL,
    ADD COLUMN `jobCloseDate` DATETIME(3) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(20) NULL,
    ADD COLUMN `savedInAccounting` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tvaNumber` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `jobapplications` ADD COLUMN `hasReceivedRejectionEmail` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `refjobNoteAdded` INTEGER NULL,
    MODIFY `interviewNote` VARCHAR(2500) NULL;
