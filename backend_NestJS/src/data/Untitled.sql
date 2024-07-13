CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) PRIMARY KEY NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT null,
  `migration_name` varchar(255) NOT NULL,
  `logs` text,
  `rolled_back_at` datetime(3) DEFAULT null,
  `started_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `applied_steps_count` int NOT NULL DEFAULT '0'
);

CREATE TABLE `appointment` (
  `appointmentId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `note` varchar(500) NOT NULL,
  `consultantId` int NOT NULL,
  `appointmentDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `updatedAt` datetime(3) NOT NULL,
  `jobApplicationId` int NOT NULL,
  `timeSlotId` int NOT NULL,
  `appHoursEnd` datetime(3) DEFAULT null,
  `appHoursStart` datetime(3) DEFAULT null,
  `appointmentMade` tinyint(1) DEFAULT null,
  `blockedTimeSlot` tinyint(1) DEFAULT null,
  `fullyBooked` tinyint(1) DEFAULT null
);

CREATE TABLE `contracttypes` (
  `contractTypeId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL
);

CREATE TABLE `experiences` (
  `experienceId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT null
);

CREATE TABLE `historiques` (
  `historiqueId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `publicationDate` datetime(3) DEFAULT null,
  `nameCompany` varchar(255) DEFAULT null,
  `nameRecruiter` varchar(255) DEFAULT null,
  `jobtitle` varchar(255) NOT NULL,
  `contractTypetitle` varchar(255) NOT NULL,
  `JobLocation` varchar(255) NOT NULL,
  `numberOfCandidates` int NOT NULL,
  `checkUserConsultant` varchar(100) DEFAULT null,
  `createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `updatedAt` datetime(3) NOT NULL
);

CREATE TABLE `jobapplications` (
  `jobApplicationId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `jobListingId` int NOT NULL,
  `applicationHours` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `status` tinyint(1) DEFAULT null,
  `jobInterviewOK` tinyint(1) DEFAULT null,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `updatedAt` datetime(3) NOT NULL,
  `deadlineToDelete` date DEFAULT null,
  `appointmentId` int DEFAULT null,
  `checkJobAppliByConsultant` varchar(70) DEFAULT null,
  `interviewNote` varchar(2000) DEFAULT null,
  `actif` tinyint(1) DEFAULT null
);

CREATE TABLE `joblistings` (
  `jobListingId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `jobLocationId` int NOT NULL,
  `jobTitleId` int NOT NULL,
  `description` varchar(2000) DEFAULT null,
  `workingHours` int NOT NULL,
  `workingHoursStart` varchar(5) NOT NULL,
  `workingHoursEnd` varchar(5) NOT NULL,
  `startDate` date DEFAULT null,
  `salary` double DEFAULT null,
  `validate` tinyint(1) DEFAULT null,
  `deadline` date NOT NULL,
  `userId` int NOT NULL,
  `contractTypeId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `updatedAt` datetime(3) DEFAULT null,
  `noteJoblisting` varchar(1000) DEFAULT null,
  `deadlineExpires` datetime(3) NOT NULL,
  `deadlineToDeleteNotConfirm` datetime(3) DEFAULT null,
  `invalidatyToDelete` tinyint(1) DEFAULT null,
  `checkJobListingByConsultant` varchar(70) DEFAULT null,
  `jobClose` tinyint(1) DEFAULT null,
  `publicationDate` datetime(3) DEFAULT null,
  `dayAgo` int DEFAULT null,
  `benefits` json DEFAULT null,
  `requiredQualifications` json DEFAULT null,
  `responsibilities` json DEFAULT null,
  `askUpdatingToRecruiter` tinyint(1) DEFAULT null,
  `numberOfCandidates` int NOT NULL,
  `experienceId` int NOT NULL
);

CREATE TABLE `joblocation` (
  `jobLocationId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `location` varchar(255) NOT NULL
);

CREATE TABLE `jobtitle` (
  `jobTitleId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL
);

CREATE TABLE `roles` (
  `roleId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL
);

CREATE TABLE `savejobs` (
  `saveJobId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `jobListingId` int NOT NULL
);

CREATE TABLE `timeslot` (
  `timeSlotId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `appHoursStart` varchar(191) NOT NULL,
  `appHoursEnd` varchar(191) NOT NULL
);

CREATE TABLE `users` (
  `userId` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(70) NOT NULL,
  `firstname` varchar(70) NOT NULL,
  `dateBirth` date NOT NULL,
  `sex` char(1) DEFAULT null,
  `phoneNumber` varchar(20) DEFAULT null,
  `email` varchar(100) NOT NULL,
  `password` varchar(250) NOT NULL,
  `jobTitleId` int DEFAULT null,
  `cv` varchar(255) DEFAULT null,
  `address` varchar(255) DEFAULT null,
  `nameCompany` varchar(255) DEFAULT null,
  `addressCompany` varchar(255) DEFAULT null,
  `actif` tinyint(1) DEFAULT null,
  `refreshToken` varchar(500) DEFAULT null,
  `notification` tinyint(1) DEFAULT '1',
  `roleId` int NOT NULL,
  `verifiedMail` tinyint(1) DEFAULT '0',
  `confirmationMailToken` varchar(500) DEFAULT null,
  `confirmationMailTokenExpires` datetime(3) DEFAULT null,
  `tokenVersion` int NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  `noteInscription` varchar(500) DEFAULT null,
  `updatedAt` datetime(3) DEFAULT null,
  `checkUserConsultant` varchar(100) DEFAULT null,
  `experienceId` int DEFAULT null,
  `tvaNumber` varchar(50) DEFAULT null,
  `descriptionCompany` varchar(1500) DEFAULT null
);

CREATE UNIQUE INDEX `Appointment_jobApplicationId_key` ON `appointment` (`jobApplicationId`);

CREATE INDEX `Appointment_consultantId_fkey` ON `appointment` (`consultantId`);

CREATE INDEX `Appointment_timeSlotId_fkey` ON `appointment` (`timeSlotId`);

CREATE UNIQUE INDEX `ContractTypes_title_key` ON `contracttypes` (`title`);

CREATE UNIQUE INDEX `Experiences_title_key` ON `experiences` (`title`);

CREATE UNIQUE INDEX `Historiques_jobtitle_key` ON `historiques` (`jobtitle`);

CREATE UNIQUE INDEX `Historiques_contractTypetitle_key` ON `historiques` (`contractTypetitle`);

CREATE UNIQUE INDEX `Historiques_JobLocation_key` ON `historiques` (`JobLocation`);

CREATE UNIQUE INDEX `JobApplications_appointmentId_key` ON `jobapplications` (`appointmentId`);

CREATE INDEX `JobApplications_jobListingId_fkey` ON `jobapplications` (`jobListingId`);

CREATE INDEX `JobApplications_userId_fkey` ON `jobapplications` (`userId`);

CREATE INDEX `JobListings_userId_fkey` ON `joblistings` (`userId`);

CREATE INDEX `JobListings_contractTypeId_fkey` ON `joblistings` (`contractTypeId`);

CREATE INDEX `JobListings_jobLocationId_fkey` ON `joblistings` (`jobLocationId`);

CREATE INDEX `JobListings_jobTitleId_fkey` ON `joblistings` (`jobTitleId`);

CREATE INDEX `JobListings_experienceId_fkey` ON `joblistings` (`experienceId`);

CREATE UNIQUE INDEX `JobLocation_location_key` ON `joblocation` (`location`);

CREATE UNIQUE INDEX `JobTitle_title_key` ON `jobtitle` (`title`);

CREATE UNIQUE INDEX `Roles_title_key` ON `roles` (`title`);

CREATE INDEX `SaveJobs_userId_fkey` ON `savejobs` (`userId`);

CREATE INDEX `SaveJobs_jobListingId_fkey` ON `savejobs` (`jobListingId`);

CREATE UNIQUE INDEX `TimeSlot_title_key` ON `timeslot` (`title`);

CREATE UNIQUE INDEX `Users_email_key` ON `users` (`email`);

CREATE INDEX `Users_roleId_fkey` ON `users` (`roleId`);

CREATE INDEX `Users_jobTitleId_fkey` ON `users` (`jobTitleId`);

CREATE INDEX `Users_experienceId_fkey` ON `users` (`experienceId`);

ALTER TABLE `appointment` ADD CONSTRAINT `Appointment_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `appointment` ADD CONSTRAINT `Appointment_jobApplicationId_fkey` FOREIGN KEY (`jobApplicationId`) REFERENCES `jobapplications` (`jobApplicationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `appointment` ADD CONSTRAINT `Appointment_timeSlotId_fkey` FOREIGN KEY (`timeSlotId`) REFERENCES `timeslot` (`timeSlotId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `jobapplications` ADD CONSTRAINT `JobApplications_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `joblistings` (`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `jobapplications` ADD CONSTRAINT `JobApplications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `joblistings` ADD CONSTRAINT `JobListings_contractTypeId_fkey` FOREIGN KEY (`contractTypeId`) REFERENCES `contracttypes` (`contractTypeId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `joblistings` ADD CONSTRAINT `JobListings_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `experiences` (`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `joblistings` ADD CONSTRAINT `JobListings_jobLocationId_fkey` FOREIGN KEY (`jobLocationId`) REFERENCES `joblocation` (`jobLocationId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `joblistings` ADD CONSTRAINT `JobListings_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `jobtitle` (`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `joblistings` ADD CONSTRAINT `JobListings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `savejobs` ADD CONSTRAINT `SaveJobs_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `joblistings` (`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `savejobs` ADD CONSTRAINT `SaveJobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users` ADD CONSTRAINT `Users_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `experiences` (`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users` ADD CONSTRAINT `Users_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `jobtitle` (`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`roleId`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users` ADD FOREIGN KEY (`sex`) REFERENCES `timeslot` (`timeSlotId`);
