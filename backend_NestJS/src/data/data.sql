INSERT INTO `roles` (`roleId`,`title`  ) VALUES
(1,'Administrator'),
(2,'Consultant'),
(3,'Candidate'),
(4,'Recruiter');
(5,'External');

INSERT INTO `contracttypes` (`contractTypeId`, `title`) VALUES
(1, 'CDI'),
(2, 'CDD'),
(3, 'Freelance'),
(4, 'Intérim'),
(5, 'Contrat de prestation de services'),
(6, 'Contrat de consultant informatique'),
(7, 'Contrat d''intérim'),
(8, 'Contrat à temps partiel'),
(9, 'Contrat de télétravail'),
(10, 'Contrat de stage'),
(11, 'Contrat de projet');

-- Insérer les valeurs dans la table JobTitle
INSERT INTO JobTitle (jobTitleId, title)
VALUES
  (1, 'Administrateur de bases de données'),
  (2, 'Administrateur réseau'),
  (3, 'Administrateur système'),
  (4, 'Analyste de données'),
  (5, 'Analyste de systèmes'),
  (6, 'Analyste en récupération après sinistre'),
  (7, 'Analyste en sécurité informatique'),
  (8, 'Architecte cloud'),
  (9, 'Architecte de solutions'),
  (10, 'Chef de projet informatique'),
  (11, 'Consultant en amélioration des processus'),
  (12, 'Consultant en technologie de l''information'),
  (13, 'Designer d''interface utilisateur (UI)'),
  (14, 'Développeur/euse Angular'),
  (15, 'Développeur/euse Backend'),
  (16, 'Développeur/euse Blockchain'),
  (17, 'Développeur/euse Frontend'),
  (18, 'Développeur/euse Full Stack'),
  (19, 'Développeur/euse Python'),
  (20, 'Développeur/euse d''applications mobiles'),
  (21, 'Développeur/euse de jeux vidéo'),
  (22, 'Développeur/euse de logiciels'),
  (23, 'Développeur/euse web'),
  (24, 'Gestionnaire de produit (Product Manager)'),
  (25, 'Gestionnaire de réseau de distribution de contenu (CDN)'),
  (26, 'Ingénieur DevOps'),
  (27, 'Ingénieur de données'),
  (28, 'Ingénieur de virtualisation'),
  (29, 'Ingénieur en acoustique logicielle'),
  (30, 'Ingénieur en intelligence artificielle'),
  (31, 'Ingénieur en logiciel embarqué'),
  (32, 'Ingénieur en sécurité des réseaux'),
  (33, 'Ingénieur réseau'),
  (34, 'Ingénieur système embarqué'),
  (35, 'Scientifique des données'),
  (36, 'Spécialiste BI (Business Intelligence)'),
  (37, 'Spécialiste de l''apprentissage automatique (Machine Learning Engineer)'),
  (38, 'Spécialiste en accessibilité numérique'),
  (39, 'Spécialiste en assurance qualité (QA Engineer)'),
  (40, 'Spécialiste en automatisation de tests'),
  (41, 'Spécialiste en cloud computing'),
  (42, 'Spécialiste en cybersécurité'),
  (43, 'Spécialiste en expérience utilisateur (UX Designer)'),
  (44, 'Spécialiste en intégration de systèmes'),
  (45, 'Technicien de support informatique'),
  (46, 'Web Designer');


INSERT INTO JobLocation (jobLocationId, location) VALUES
(1, 'Bruxelles'),
(2, 'Liège'),
(3, 'Wavre'),
(4, 'Namur'),
(5, 'Charleroi'),
(6, 'Bruxelles-Capitale'),
(7, 'Tournai'),
(8, 'Mons'),
(9, 'Nivelles'),
(10, 'Anderlecht'),
(11, 'Anvers'),
(12, 'La Louvière'),
(13, "Braine-l'Alleud"),
(14, 'Hainaut');


-- Insérer les expériences
INSERT INTO experiences (experienceId, title) VALUES
(1, "Pas d'expérience"),
(2, '1 an'),
(3, '2 ans'),
(4, '3 ans'),
(5, '4 ans'),
(6, '5 ans et plus');


INSERT INTO TimeSlot (timeSlotId, title, appHoursStart, appHoursEnd) VALUES
(1, '09:00 - 10:00', '09:00', '10:00'),
(2, '10:15 - 11:15', '10:15', '11:15'),
(3, '11:30 - 12:30', '11:30', '12:30'),
(4, '13:00 - 14:30', '13:00', '14:30'),
(5, '14:45 - 15:45', '14:45', '15:45'),
(6, '16:00 - 17:00', '16:00', '17:00');

model TimeSlot {
  timeSlotId    Int            @id @default(autoincrement())
  title         String         @unique @db.VarChar(50)  // "09:00 - 10:00"
  appHoursStart String         // Format HH:MM, par exemple "09:00"
  appHoursEnd   String         // Format HH:MM, par exemple "10:00"
  appHoursStart Int         // 1 , heure de debut 1
  appHoursEnd   Int         // 2,  , heure de debut 1
  appointments  Appointment[]  @relation("appointment_timeSlot")
}



INSERT INTO TimeSlot (timeSlotId, title, appHoursStart, appHoursEnd, appHoursStartInt, appHoursEndInt) VALUES
(1, '09:00 - 10:00', '09:00', '10:00', 1,2),
(2, '10:15 - 11:15', '10:15', '11:15'3,4),
(3, '11:30 - 12:30', '11:30', '12:30'5,6),
(4, '13:00 - 14:30', '13:00', '14:30'7,8),
(5, '14:45 - 15:45', '14:45', '15:45'8,9),
(6, '16:00 - 17:00', '16:00', '17:00'10,11);

// Pour afficher les containtes existante du table:
SHOW CREATE TABLE jobapplications;

CREATE TABLE `jobapplications` (
   `jobApplicationId` int NOT NULL AUTO_INCREMENT,
   `jobListingId` int NOT NULL,
   `applicationHours` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
   `status` tinyint(1) DEFAULT NULL,
   `jobInterviewOK` tinyint(1) DEFAULT NULL,
   `userId` int NOT NULL,
   `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
   `updatedAt` datetime(3) NOT NULL,
   `deadlineToDelete` date DEFAULT NULL,
   `appointmentId` int DEFAULT NULL,
   `checkJobAppliByConsultant` varchar(70) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `interviewNote` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   PRIMARY KEY (`jobApplicationId`),
   UNIQUE KEY `JobApplications_appointmentId_key` (`appointmentId`),
   KEY `JobApplications_jobListingId_fkey` (`jobListingId`),
   KEY `JobApplications_userId_fkey` (`userId`),
   CONSTRAINT `JobApplications_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `joblistings` (`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE,
   CONSTRAINT `JobApplications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci



// Pour afficher noms des contraintes de clé étrangère dans une table 
SELECT CONSTRAINT_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'jobapplications' 
AND TABLE_SCHEMA = 'nom_de_votre_base_de_données'; -- A remplacez par le nom de votre base de données

// La commande de suppression correcte serait :
exemple: ALTER TABLE `jobapplications` DROP FOREIGN KEY `fk_user_jobapplications`;

ALTER TABLE `jobapplications` DROP FOREIGN KEY `JobApplications_jobListingId_fkey`;
ALTER TABLE `jobapplications`
ADD CONSTRAINT `JobApplications_jobListingId_fkey`
FOREIGN KEY (`jobListingId`)
REFERENCES `joblistings` (`jobListingId`)
ON DELETE CASCADE ON UPDATE CASCADE;



    