-- CreateTable
CREATE TABLE `Historiques` (
    `historiqueId` INTEGER NOT NULL AUTO_INCREMENT,
    `publicationDate` DATETIME(3) NULL,
    `nameCompany` VARCHAR(255) NULL,
    `nameRecruiter` VARCHAR(255) NULL,
    `jobtitle` VARCHAR(255) NOT NULL,
    `contractTypetitle` VARCHAR(255) NOT NULL,
    `JobLocation` VARCHAR(255) NOT NULL,
    `numberOfCandidates` INTEGER NOT NULL,
    `checkUserConsultant` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Historiques_jobtitle_key`(`jobtitle`),
    UNIQUE INDEX `Historiques_contractTypetitle_key`(`contractTypetitle`),
    UNIQUE INDEX `Historiques_JobLocation_key`(`JobLocation`),
    PRIMARY KEY (`historiqueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Roles_title_key`(`title`),
    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experiences` (
    `experienceId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NULL,

    UNIQUE INDEX `Experiences_title_key`(`title`),
    PRIMARY KEY (`experienceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractTypes` (
    `contractTypeId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `ContractTypes_title_key`(`title`),
    PRIMARY KEY (`contractTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobLocation` (
    `jobLocationId` INTEGER NOT NULL AUTO_INCREMENT,
    `location` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `JobLocation_location_key`(`location`),
    PRIMARY KEY (`jobLocationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobTitle` (
    `jobTitleId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `JobTitle_title_key`(`title`),
    PRIMARY KEY (`jobTitleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimeSlot` (
    `timeSlotId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `appHoursStart` VARCHAR(191) NOT NULL,
    `appHoursEnd` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TimeSlot_title_key`(`title`),
    PRIMARY KEY (`timeSlotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaveJobs` (
    `saveJobId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `jobListingId` INTEGER NOT NULL,

    PRIMARY KEY (`saveJobId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(70) NOT NULL,
    `firstname` VARCHAR(70) NOT NULL,
    `dateBirth` DATE NOT NULL,
    `sex` CHAR(1) NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(250) NOT NULL,
    `jobTitleId` INTEGER NULL,
    `cv` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `nameCompany` VARCHAR(255) NULL,
    `descriptionCompany` VARCHAR(1500) NULL,
    `addressCompany` VARCHAR(255) NULL,
    `actif` BOOLEAN NULL,
    `refreshToken` VARCHAR(500) NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 1,
    `notification` BOOLEAN NULL DEFAULT true,
    `checkUserConsultant` VARCHAR(100) NULL,
    `confirmationMailToken` VARCHAR(500) NULL,
    `tvaNumber` VARCHAR(50) NULL,
    `confirmationMailTokenExpires` DATETIME(3) NULL,
    `roleId` INTEGER NOT NULL,
    `experienceId` INTEGER NULL,
    `verifiedMail` BOOLEAN NULL DEFAULT false,
    `noteInscription` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobListings` (
    `jobListingId` INTEGER NOT NULL AUTO_INCREMENT,
    `jobLocationId` INTEGER NOT NULL,
    `jobTitleId` INTEGER NOT NULL,
    `experienceId` INTEGER NOT NULL,
    `description` VARCHAR(2000) NULL,
    `responsibilities` JSON NULL,
    `requiredQualifications` JSON NULL,
    `benefits` JSON NULL,
    `workingHours` INTEGER NOT NULL,
    `numberOfCandidates` INTEGER NOT NULL,
    `workingHoursStart` VARCHAR(5) NOT NULL,
    `workingHoursEnd` VARCHAR(5) NOT NULL,
    `startDate` DATE NULL,
    `salary` DOUBLE NULL,
    `noteJoblisting` VARCHAR(1000) NULL,
    `deadline` DATE NOT NULL,
    `deadlineExpires` DATETIME(3) NOT NULL,
    `validate` BOOLEAN NULL,
    `invalidatyToDelete` BOOLEAN NULL,
    `askUpdatingToRecruiter` BOOLEAN NULL,
    `jobClose` BOOLEAN NULL,
    `checkJobListingByConsultant` VARCHAR(70) NULL,
    `deadlineToDeleteNotConfirm` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,
    `dayAgo` INTEGER NULL,
    `contractTypeId` INTEGER NOT NULL,
    `publicationDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`jobListingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplications` (
    `jobApplicationId` INTEGER NOT NULL AUTO_INCREMENT,
    `jobListingId` INTEGER NOT NULL,
    `appointmentId` INTEGER NULL,
    `applicationHours` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` BOOLEAN NULL,
    `jobInterviewOK` BOOLEAN NULL,
    `interviewNote` VARCHAR(2000) NULL,
    `userId` INTEGER NOT NULL,
    `checkJobAppliByConsultant` VARCHAR(70) NULL,
    `deadlineToDelete` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actif` BOOLEAN NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JobApplications_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`jobApplicationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `appointmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `note` VARCHAR(500) NOT NULL,
    `consultantId` INTEGER NOT NULL,
    `jobApplicationId` INTEGER NOT NULL,
    `timeSlotId` INTEGER NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `appHoursStart` DATETIME(3) NULL,
    `appHoursEnd` DATETIME(3) NULL,
    `appointmentMade` BOOLEAN NULL,
    `fullyBooked` BOOLEAN NULL,
    `blockedTimeSlot` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Appointment_jobApplicationId_key`(`jobApplicationId`),
    PRIMARY KEY (`appointmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SaveJobs` ADD CONSTRAINT `SaveJobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaveJobs` ADD CONSTRAINT `SaveJobs_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `JobListings`(`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experiences`(`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `JobTitle`(`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobListings` ADD CONSTRAINT `JobListings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobListings` ADD CONSTRAINT `JobListings_contractTypeId_fkey` FOREIGN KEY (`contractTypeId`) REFERENCES `ContractTypes`(`contractTypeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobListings` ADD CONSTRAINT `JobListings_jobLocationId_fkey` FOREIGN KEY (`jobLocationId`) REFERENCES `JobLocation`(`jobLocationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobListings` ADD CONSTRAINT `JobListings_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `JobTitle`(`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobListings` ADD CONSTRAINT `JobListings_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experiences`(`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplications` ADD CONSTRAINT `JobApplications_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `JobListings`(`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplications` ADD CONSTRAINT `JobApplications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_jobApplicationId_fkey` FOREIGN KEY (`jobApplicationId`) REFERENCES `JobApplications`(`jobApplicationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_timeSlotId_fkey` FOREIGN KEY (`timeSlotId`) REFERENCES `TimeSlot`(`timeSlotId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
