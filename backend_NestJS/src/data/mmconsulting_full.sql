-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: mmconsulting
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('113ae505-3b40-4dc9-8e0f-b14178ea27d9','f01d642bc988d8b13e1b8f63d21846f15a3f19958ac9975007c57964c3fbf9c3','2024-05-11 11:18:58.302','20240511111858_migrate',NULL,NULL,'2024-05-11 11:18:58.216',1),('19476dc9-a357-4b16-9943-906535e2be6a','a7fc95b5a93b47d85dd6386473536a685627ff2ea0281343b9b12cb984ff495b','2024-04-20 22:21:19.197','20240219204225_migrate_init_15',NULL,NULL,'2024-04-20 22:21:19.141',1),('295b1533-a8f8-4ac9-a7c8-0c210f43e75e','ef3585961b6fb1ed3830f8aefc0d6a3746653f0c1cece768b0d123e3d5aa0ded','2024-04-20 22:21:18.592','20240210153821_migrate_init_6',NULL,NULL,'2024-04-20 22:21:18.538',1),('306520c5-2fa2-47e1-b0ca-c3d77a30ae7c','cb480faf3a4da29505cb8bd4582fd071808b6fcc0a76b53adb3f7c78a24f4e77','2024-04-26 12:48:29.381','20240426124829_migrate',NULL,NULL,'2024-04-26 12:48:29.339',1),('36f73fad-4bff-4b7e-8572-9cebb08c0b14','79e14ff6ae9026b2654fcaa77d23bdd400800152f3e580d3fc163ac40f3581c3','2024-04-20 22:21:19.361','20240222162626_migrate_init_16',NULL,NULL,'2024-04-20 22:21:19.262',1),('379e44c1-a702-4f4f-bd41-05f251f19853','e2fb3f067d9d201d7ccbc8c80af6bc7ff91458accd6370790a33b99af45f44f8','2024-04-20 22:21:18.327','20240205205914_add_token_version',NULL,NULL,'2024-04-20 22:21:18.301',1),('3b180c59-18f1-46a0-b64a-ae29bb33afe0','f62959d23ee3b61875171397274ca9fa020e8f06d00d9365d9fa990423cd4607','2024-04-20 22:21:20.043','20240420001010_migrate',NULL,NULL,'2024-04-20 22:21:20.022',1),('3de258d3-df9f-4583-bfee-8585f5caafb7','96d804ed942540e515228f634efb0060ffe1cce747c20cd08b15a5fcf3b9e230','2024-04-20 22:21:18.781','20240216005624_migrate_init_10',NULL,NULL,'2024-04-20 22:21:18.736',1),('4354f82f-b069-425a-9832-757e29249dfa','5c305b10a110924085964466476315a341125c01961ed3e8f7074ee54bf2916f','2024-04-20 22:21:19.441','20240224110849_migrate_init_19',NULL,NULL,'2024-04-20 22:21:19.419',1),('44adee28-2cb6-45f6-ac63-ff07a8798f22','6931dc407c2ade63624722b2b1ef7e686f8ccccf0959ab7f23e502d6f64e1825','2024-04-20 22:21:19.852','20240406165331_migrate',NULL,NULL,'2024-04-20 22:21:19.809',1),('5b861ddf-fa20-4227-8706-c3a635e92579','37a0bf7b09cf9b6d125d9951a632e999bec77ef37e0a1b01e623cc88d5abe8af','2024-04-20 22:21:19.113','20240217182830_migrate_init_14',NULL,NULL,'2024-04-20 22:21:19.086',1),('6de1ac79-ad09-4f06-bb8c-c2539d6980b9','676f44596c2836f7b3ec63e197ba9b0c45cb0e664be3818bf49b0b4fbeaa969f','2024-04-20 22:21:18.535','20240210130733_migrate_init_5',NULL,NULL,'2024-04-20 22:21:18.469',1),('6fca4580-e6ad-4715-a72a-8ab707c6558f','35988725d1e00c00e7271aeed19bef25c3b30f67908848217271f736a889b5b3','2024-04-20 22:21:24.551','20240420222124_migrate',NULL,NULL,'2024-04-20 22:21:24.460',1),('7ee99c74-5a94-4e2a-abdc-0e23427237e7','090a541d9d1d96f8e91f69eae8c02226c0c595df6d00fa6394510f6bb25edda5','2024-04-20 22:21:18.618','20240211032043_migrate_init_7',NULL,NULL,'2024-04-20 22:21:18.594',1),('81cb4f0d-167c-4089-9622-8bd6b1fff728','584dbaa41536affae78418dbca4db4cb9bd7625359740b7470a4c4f09e2d13e0','2024-04-20 22:21:19.499','20240224221725_migrate_init_20',NULL,NULL,'2024-04-20 22:21:19.443',1),('81d46a90-5e30-42f7-8b6a-17ff350737dd','c81680552d7d4a4423368060619e0b0225236ac65d51a40e820a28b5078905b8','2024-04-20 22:21:19.084','20240216234422_migrate_init_13',NULL,NULL,'2024-04-20 22:21:19.064',1),('871c1033-102e-4010-aa6c-5260b13109f2','4e8ead4027f2691455dfd4f7441a0f6d8396c603728a0763fd78c7ad3adbef03','2024-04-20 22:21:18.394','20240208104118_init_migrate',NULL,NULL,'2024-04-20 22:21:18.328',1),('8b511421-8302-4107-82ee-57e713dda50a','861b23c2db521996a4bbb961d2ca770ffb678975465255481f2dec453357ade2','2024-04-20 22:21:19.574','20240316130447_migrate',NULL,NULL,'2024-04-20 22:21:19.531',1),('8d26d23f-4196-4f67-b8fd-2e29031fa340','abbac0efbe7a69ae33aadf6fb6fed4cfe29591f98aeb661875e1768ee09ae839','2024-04-20 22:21:19.528','20240225225835_mograte_init_21',NULL,NULL,'2024-04-20 22:21:19.501',1),('8e4d5eca-7d0d-4ee5-8c5a-36706e61cd97','d99153dc030bf98dfa89a0064d6bc03386c834b1bd3a90bfe8004b1bebc13c5c','2024-04-20 22:21:18.964','20240216204405_migrate_init_12',NULL,NULL,'2024-04-20 22:21:18.916',1),('93e3e38f-0c18-4ff3-afbf-14d3b9215613','8974c4c49c0884f5e6af6032f516ec473e84393af8be7034e2bd4dee25eacc89','2024-04-20 22:21:18.914','20240216164747_migrate_init_11',NULL,NULL,'2024-04-20 22:21:18.784',1),('989afde9-18ee-471d-af9f-30ee24614b08','1c9807e2e927c3e68be213b5b434aedfcbfe12387cc480c0b3fc1e961c6e5667','2024-04-20 22:21:19.778','20240328115334_migrate',NULL,NULL,'2024-04-20 22:21:19.752',1),('9eea6039-dcf5-41ae-92c2-f762fb44c936','b9fce34af8360985dcd9614630f1d6dfe724b84e44c207077fc132a7b0d03424','2024-04-20 22:21:18.271','20240201160954_init_migration',NULL,NULL,'2024-04-20 22:21:17.570',1),('9f1c9447-fb46-4ea6-a5cc-057fbb82864f','32cc5e30a12d5a9c1d6583f655a5dc0765a74802b31ccd17c3b1f7716800e9df','2024-04-20 22:21:18.646','20240211134614_migrate_init_8',NULL,NULL,'2024-04-20 22:21:18.619',1),('aaa78ce7-a249-4e6a-827d-4ecd72384104','3b679f094a21c14909a88d9f25b1f2f829b6b4d3e2283858e6080600a5339754','2024-04-20 22:21:19.806','20240402122038_migrate',NULL,NULL,'2024-04-20 22:21:19.780',1),('b016b94e-6e59-4923-82a6-4a181db3553b','9f14f0d135789c3c2f2bc7663d7faff64f2d02f6d01988798439fc3bccd569ab','2024-04-20 22:21:19.139','20240217183541_migrate_init_14',NULL,NULL,'2024-04-20 22:21:19.115',1),('c442ba42-4ea8-440b-b86d-f29f59b05519','2de829fa8f3aaf6c48fb1e6146ec91a5c1d19fe59b197572bc91031484b542bf','2024-04-20 22:21:18.299','20240202215427_init_migrate',NULL,NULL,'2024-04-20 22:21:18.273',1),('d2a26315-6f92-4d2c-9542-bc292107052e','0e8bdb8bd54dc18f18336725aad17399a0d5d8b6fb50ab150732f0825c8c89f1','2024-04-20 22:21:18.468','20240210005109_init_migrate',NULL,NULL,'2024-04-20 22:21:18.396',1),('d657a21e-9f36-496c-a75f-f0592e47d3e4','617842df966137476bf2847eabc893a3ee768126c9caa12ffb0cdb7b4776912e','2024-04-20 22:21:19.261','20240219225630_migrate_init_16',NULL,NULL,'2024-04-20 22:21:19.201',1),('dcb5dd84-f6f8-4db6-a4f6-be819c0e1eaf','1583b73a03214b52c295693dd369daf91223ad39b3900e89eec73ca7b89733dd','2024-04-20 22:21:19.882','20240415232732_migrate',NULL,NULL,'2024-04-20 22:21:19.854',1),('df35cc5a-abe8-471f-96a8-15bd32760481','22189001d2be46b9bae785f16a355d42bea0d5fc035ca88883e1b15668f5999c','2024-05-04 20:14:51.621','20240504201451_migrate',NULL,NULL,'2024-05-04 20:14:51.590',1),('e330f567-fa11-45a5-96db-8a3bc637f956','d6b2d4b8cf92028bfbdb6e9c057222cc929005ade2e36b576e5ec99bd93848f8','2024-04-22 12:50:04.702','20240422125004_migrate',NULL,NULL,'2024-04-22 12:50:04.579',1),('e54a2a41-387d-4ede-916d-2b19f9a9486d','065edf1fc6bc22a7dd095f0e880a52c9f47881efad9b73a850b1940bbb623f5e','2024-04-20 22:21:18.735','20240213215622_migrate_init_9',NULL,NULL,'2024-04-20 22:21:18.648',1),('e56a750e-7354-491c-b220-d52b2234be94','016cc36968ba5b3d936ac949625aa8c04653730b050a1ee8ba064800e906b878','2024-04-20 22:21:19.751','20240318230000_migrate',NULL,NULL,'2024-04-20 22:21:19.576',1),('eb5962cf-d9f7-4d3b-ba08-746a49cdf9ff','6558c157ccf8f10b64d89854d2a236e78353b9f987fc3ebb682fbffa206dfab0','2024-04-20 22:21:19.416','20240223201450_migrate_init_18',NULL,NULL,'2024-04-20 22:21:19.363',1),('eff4417f-3534-45e1-ae92-25c5aae157b9','669e52734cf9e48f99e28de41432f3a90fe075f59b8d89615a5b67a048fb1e9d','2024-04-20 22:21:20.021','20240420000715_add_number_of_candidates',NULL,NULL,'2024-04-20 22:21:19.884',1),('f106d85f-a553-419a-9ca9-fe1c090aac53','bf2551d9841bbe2450fc3e76cfd8a6551359206f76462067a9fbdaf50c00973f','2024-04-20 22:21:19.063','20240216210251_migrate_init_13',NULL,NULL,'2024-04-20 22:21:18.965',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `appointmentId` int NOT NULL AUTO_INCREMENT,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultantId` int NOT NULL,
  `appointmentDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `jobApplicationId` int NOT NULL,
  `timeSlotId` int NOT NULL,
  `appHoursEnd` datetime(3) DEFAULT NULL,
  `appHoursStart` datetime(3) DEFAULT NULL,
  `appointmentMade` tinyint(1) DEFAULT NULL,
  `blockedTimeSlot` tinyint(1) DEFAULT NULL,
  `fullyBooked` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`appointmentId`),
  UNIQUE KEY `Appointment_jobApplicationId_key` (`jobApplicationId`),
  KEY `Appointment_consultantId_fkey` (`consultantId`),
  KEY `Appointment_timeSlotId_fkey` (`timeSlotId`),
  CONSTRAINT `Appointment_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Appointment_jobApplicationId_fkey` FOREIGN KEY (`jobApplicationId`) REFERENCES `jobapplications` (`jobApplicationId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Appointment_timeSlotId_fkey` FOREIGN KEY (`timeSlotId`) REFERENCES `timeslot` (`timeSlotId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,'dEVELLOPEUR ANGULAR',2,'2024-06-08 00:00:00.000','2024-04-23 11:25:35.274','2024-04-23 11:25:35.274',1,1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracttypes`
--

DROP TABLE IF EXISTS `contracttypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracttypes` (
  `contractTypeId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`contractTypeId`),
  UNIQUE KEY `ContractTypes_title_key` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracttypes`
--

LOCK TABLES `contracttypes` WRITE;
/*!40000 ALTER TABLE `contracttypes` DISABLE KEYS */;
INSERT INTO `contracttypes` VALUES (2,'CDD'),(1,'CDI'),(8,'Contrat à temps partiel'),(7,'Contrat d\'intérim'),(6,'Contrat de consultant informatique'),(5,'Contrat de prestation de services'),(11,'Contrat de projet'),(10,'Contrat de stage'),(9,'Contrat de télétravail'),(3,'Freelance'),(4,'Intérim');
/*!40000 ALTER TABLE `contracttypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `experiences`
--

DROP TABLE IF EXISTS `experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiences` (
  `experienceId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`experienceId`),
  UNIQUE KEY `Experiences_title_key` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `experiences`
--

LOCK TABLES `experiences` WRITE;
/*!40000 ALTER TABLE `experiences` DISABLE KEYS */;
INSERT INTO `experiences` VALUES (2,'1 an'),(3,'2 ans'),(4,'3 ans'),(5,'4 ans'),(6,'5 ans et plus'),(1,'Pas d\'expérience');
/*!40000 ALTER TABLE `experiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historiques`
--

DROP TABLE IF EXISTS `historiques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historiques` (
  `historiqueId` int NOT NULL AUTO_INCREMENT,
  `publicationDate` datetime(3) DEFAULT NULL,
  `nameCompany` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nameRecruiter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobtitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contractTypetitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `JobLocation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numberOfCandidates` int NOT NULL,
  `checkUserConsultant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`historiqueId`),
  UNIQUE KEY `Historiques_jobtitle_key` (`jobtitle`),
  UNIQUE KEY `Historiques_contractTypetitle_key` (`contractTypetitle`),
  UNIQUE KEY `Historiques_JobLocation_key` (`JobLocation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historiques`
--

LOCK TABLES `historiques` WRITE;
/*!40000 ALTER TABLE `historiques` DISABLE KEYS */;
/*!40000 ALTER TABLE `historiques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobapplications`
--

DROP TABLE IF EXISTS `jobapplications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `actif` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`jobApplicationId`),
  UNIQUE KEY `JobApplications_appointmentId_key` (`appointmentId`),
  KEY `JobApplications_jobListingId_fkey` (`jobListingId`),
  KEY `JobApplications_userId_fkey` (`userId`),
  CONSTRAINT `JobApplications_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `joblistings` (`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `JobApplications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobapplications`
--

LOCK TABLES `jobapplications` WRITE;
/*!40000 ALTER TABLE `jobapplications` DISABLE KEYS */;
INSERT INTO `jobapplications` VALUES (1,2,'2024-04-23 20:09:08.732',NULL,NULL,3,'2024-04-23 20:09:08.735','2024-05-04 15:08:16.028',NULL,NULL,'CONSULTANT Moussa',NULL,1),(2,4,'2024-05-03 17:14:53.152',1,NULL,3,'2024-05-03 17:14:53.158','2024-05-04 15:33:42.703',NULL,NULL,'CONSULTANT Moussa',NULL,1),(3,1,'2024-05-03 17:19:02.272',NULL,NULL,16,'2024-05-03 17:19:02.273','2024-05-03 17:19:02.273',NULL,NULL,NULL,NULL,1),(4,4,'2024-05-03 17:19:59.344',1,NULL,16,'2024-05-03 17:19:59.345','2024-05-04 15:33:57.122',NULL,NULL,'CONSULTANT Moussa',NULL,1),(6,1,'2024-05-10 07:37:23.930',NULL,NULL,3,'2024-05-10 07:37:23.932','2024-05-10 07:37:23.932',NULL,NULL,NULL,NULL,1),(7,2,'2024-05-10 07:38:51.224',NULL,NULL,16,'2024-05-10 07:38:51.227','2024-05-10 07:38:51.227',NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `jobapplications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `joblistings`
--

DROP TABLE IF EXISTS `joblistings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `joblistings` (
  `jobListingId` int NOT NULL AUTO_INCREMENT,
  `jobLocationId` int NOT NULL,
  `jobTitleId` int NOT NULL,
  `description` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workingHours` int NOT NULL,
  `workingHoursStart` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `workingHoursEnd` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` date DEFAULT NULL,
  `salary` double DEFAULT NULL,
  `validate` tinyint(1) DEFAULT NULL,
  `deadline` date NOT NULL,
  `userId` int NOT NULL,
  `contractTypeId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `noteJoblisting` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadlineExpires` datetime(3) NOT NULL,
  `deadlineToDeleteNotConfirm` datetime(3) DEFAULT NULL,
  `invalidatyToDelete` tinyint(1) DEFAULT NULL,
  `checkJobListingByConsultant` varchar(70) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobClose` tinyint(1) DEFAULT NULL,
  `publicationDate` datetime(3) DEFAULT NULL,
  `dayAgo` int DEFAULT NULL,
  `benefits` json DEFAULT NULL,
  `requiredQualifications` json DEFAULT NULL,
  `responsibilities` json DEFAULT NULL,
  `askUpdatingToRecruiter` tinyint(1) DEFAULT NULL,
  `numberOfCandidates` int NOT NULL,
  `experienceId` int NOT NULL,
  PRIMARY KEY (`jobListingId`),
  KEY `JobListings_userId_fkey` (`userId`),
  KEY `JobListings_contractTypeId_fkey` (`contractTypeId`),
  KEY `JobListings_jobLocationId_fkey` (`jobLocationId`),
  KEY `JobListings_jobTitleId_fkey` (`jobTitleId`),
  KEY `JobListings_experienceId_fkey` (`experienceId`),
  CONSTRAINT `JobListings_contractTypeId_fkey` FOREIGN KEY (`contractTypeId`) REFERENCES `contracttypes` (`contractTypeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `JobListings_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `experiences` (`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `JobListings_jobLocationId_fkey` FOREIGN KEY (`jobLocationId`) REFERENCES `joblocation` (`jobLocationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `JobListings_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `jobtitle` (`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `JobListings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `joblistings`
--

LOCK TABLES `joblistings` WRITE;
/*!40000 ALTER TABLE `joblistings` DISABLE KEYS */;
INSERT INTO `joblistings` VALUES (1,13,2,'VALIDEE Pour un placeholder clair et concis sur un champ de saisie destiné à indiquer le nombre de candidats qu\'un recruteur souhaite embaucher, vous pourriez utiliser une formulation simple qui guide directement l\'utilisateur sur l\'information requise. Voici quelques suggestions :',40,'08:30','16:30','2024-05-29',85555,1,'2024-05-07',4,8,'2024-04-21 15:13:13.178','2024-04-29 13:35:39.192',NULL,'2024-08-05 22:00:00.000',NULL,NULL,'CONSULTANT Moussa',0,'2024-04-29 13:35:39.189',NULL,'\"[\\\"Indiquez le nombre de postes à pourvoir\\\",\\\"Indiquez le nombre de postes à pourvoir\\\"]\"','\"[\\\"Indiquez le nombre de postes à pourvoir\\\",\\\"Indiquez le nombre de postes à pourvoir\\\"]\"','\"[\\\"Indiquez le nombre de postes à pourvoir\\\",\\\"Indiquez le nombre de postes à pourvoir\\\"]\"',0,2,4),(2,2,14,'VALIDEE Nous recherchons un Développeur Angular expérimenté pour rejoindre notre équipe dynamique. Ce poste implique la conception et le développement d\'interfaces utilisateur riches et fonctionnelles pour nos projets web. Le candidat idéal sera responsable de la création de solutions front-end performantes, en assurant une expérience utilisateur optimale et en intégrant des services back-end. Ce rôle exige une forte capacité d\'adaptation à de nouveaux outils et technologies, ainsi qu\'une approche proactive de la résolution de problèmes.',40,'09:00','17:00','2024-06-01',87000,1,'2024-04-30',4,1,'2024-04-23 11:25:35.274','2024-05-09 17:12:19.597',NULL,'2024-07-29 22:00:00.000',NULL,NULL,'CONSULTANT Moussa',0,'2024-05-09 17:12:19.590',NULL,'\"[\\\"Un cadre de travail stimulant et des projets innovants.\\\\n\\\",\\\"Une rémunération attractive et des avantages compétitifs.\\\\n\\\",\\\"Des opportunités de croissance professionnelle et de formation continue.\\\\n\\\",\\\"Un environnement de travail flexible, avec possibilité de télétravail partiel.\\\"]\"','\"[\\\"Excellente maîtrise d\'Angular et expérience confirmée dans ce framework.\\\\n\\\",\\\"Bonne compréhension de TypeScript, HTML5, et CSS3.\\\\n\\\",\\\"Expérience avec les systèmes de gestion de version, en particulier Git.\\\\n\\\",\\\"Capacité à travailler de manière autonome et en équipe, avec un fort esprit d\'initiative.\\\"]\"','\"[\\\"Développer des applications web en Angular selon les spécifications.\\\\n\\\",\\\"Assurer la compatibilité des applications avec divers navigateurs et dispositifs.\\\\n\\\",\\\"Collaborer avec les équipes de design et back-end pour créer des expériences utilisateur seamless.\\\",\\\"\\\\nEffectuer des tests de performance et optimiser les applications pour une meilleure efficacité.\\\"]\"',0,2,4),(4,1,3,'VALIDEE En tant qu\'administrateur système, vous aurez la responsabilité de maintenir, d\'upgrader et de gérer notre infrastructure logicielle et matérielle. Vous serez le pilier permettant à nos systèmes de fonctionner de manière fiable et efficace, en assurant un soutien technique constant à notre équipe et à nos clients.',38,'08:30','16:30','2024-06-30',90000,1,'2024-05-30',22,11,'2024-04-29 14:04:58.736','2024-04-29 14:30:17.347',NULL,'2024-08-28 22:00:00.000',NULL,NULL,'CONSULTANT Moussa',0,'2024-04-29 14:30:17.346',NULL,'\"[\\\"Un environnement de travail technologiquement avancé et stimulant.\\\",\\\"Un package de rémunération attractif, incluant des avantages comme des assurances santé, des contributions de retraite et des bonus annuels.\\\",\\\"Opportunités de développement professionnel à travers des formations et des certifications.\\\",\\\"Flexibilité des horaires et options de télétravail pour équilibrer vie professionnelle et vie privée.\\\"]\"','\"[\\\"Diplôme en informatique, génie informatique ou domaine connexe.\\\",\\\"Expérience solide en tant qu\'administrateur système, avec une préférence pour ceux ayant travaillé avec [spécifiez les systèmes d\'exploitation, par exemple Windows Server, Linux/Unix, etc.]\\\",\\\"Compétences avérées dans la gestion de réseaux et de serveurs, y compris la configuration de pare-feu et de VPN.\\\",\\\"Bonne compréhension des protocoles réseau (TCP/IP, DNS, DHCP, SMTP, etc.) et des outils de diagnostic réseau.\\\",\\\"Certifications professionnelles (par exemple, Microsoft Certified Systems Administrator (MCSA), CompTIA Server+, Red Hat Certified System Administrator (RHCSA)) sont un plus.\\\"]\"','\"[\\\"Installer, configurer, tester et maintenir les systèmes d\'exploitation, les applications logicielles et les systèmes de gestion de réseau.\\\",\\\"Installer, configurer, tester et maintenir les systèmes d\'exploitation, les applications logicielles et les systèmes de gestion de réseau.\\\",\\\"Assurer la sécurité des serveurs, des systèmes et des fichiers, en appliquant les normes et protocoles de sécurité.\\\",\\\"Résoudre les problèmes et répondre aux requêtes liées au système et aux réseaux.\\\",\\\"Gérer les sauvegardes et la récupération de données.\\\",\\\"Documenter les processus et assurer une communication régulière avec les autres départements concernés.\\\"]\"',0,2,5),(5,14,3,'NON VALIDEE En tant qu\'administrateur système, vous aurez la responsabilité de maintenir, d\'upgrader et de gérer notre infrastructure logicielle et matérielle. Vous serez le pilier permettant à nos systèmes de fonctionner de manière fiable et efficace, en assurant un soutien technique constant à notre équipe et à nos clients.',40,'08:30','16:30','2024-06-27',100000,1,'2024-07-17',4,7,'2024-04-29 23:16:03.566','2024-05-09 13:31:57.750',NULL,'2024-10-15 22:00:00.000',NULL,NULL,'ADMINISTRATOR Koffi',0,'2024-05-09 13:31:57.744',NULL,'\"[\\\"Un environnement de travail technologiquement avancé et stimulant.\\\"]\"','\"[\\\"Diplôme en informatique, génie informatique ou domaine connexe.\\\"]\"','\"[\\\"Installer, configurer, tester et maintenir les systèmes d\'exploitation, les applications logicielles et les systèmes de gestion de réseau.\\\"]\"',0,1,4),(6,5,10,'En tant que chef de projet informatique, vous serez responsable de la planification, de l\'exécution et de la livraison de projets informatiques, en veillant à ce qu\'ils respectent les délais, les budgets et les exigences de qualité. Vous travaillerez en étroite collaboration avec les équipes techniques et les clients pour assurer le succès des projets.',40,'08:30','17:00','2024-07-31',120000,NULL,'2024-06-30',4,1,'2024-05-10 07:26:16.158','2024-05-10 07:26:16.158',NULL,'2024-09-28 22:00:00.000',NULL,NULL,NULL,NULL,NULL,NULL,'\"[\\\"Un environnement de travail dynamique avec des technologies de pointe.\\\",\\\"Un package de rémunération compétitif, comprenant des avantages sociaux complets.\\\",\\\"Opportunités de croissance professionnelle et de développement des compétences.\\\",\\\"Flexibilité des horaires et politique de télétravail adaptative.\\\"]\"','\"[\\\"Diplôme en gestion de projet, informatique ou dans un domaine connexe.\\\",\\\"Expérience significative en gestion de projet dans le secteur des technologies de l\'information.\\\",\\\"Maîtrise des méthodologies de gestion de projet (PMP, Agile, Scrum).\\\",\\\"Solides compétences en communication et en leadership.\\\",\\\"Capacité à travailler dans un environnement dynamique et à gérer plusieurs projets simultanément.\\\",\\\"Compétences analytiques et capacité à résoudre des problèmes complexes.\\\"]\"','\"[\\\"Définir les objectifs du projet, les livrables, les ressources nécessaires et le calendrier d\'exécution.\\\",\\\"Coordonner les ressources internes et externes pour une exécution sans faille des projets.\\\",\\\"Gérer la communication avec toutes les parties prenantes et résoudre les problèmes émergents.\\\",\\\"Assurer le suivi des progrès et faire des ajustements de planification si nécessaire.\\\",\\\"Préparer des rapports d\'avancement pour la direction et les clients.\\\",\\\"Gérer les risques du projet pour minimiser les impacts sur la réussite du projet.\\\"]\"',0,1,6);
/*!40000 ALTER TABLE `joblistings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `joblocation`
--

DROP TABLE IF EXISTS `joblocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `joblocation` (
  `jobLocationId` int NOT NULL AUTO_INCREMENT,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`jobLocationId`),
  UNIQUE KEY `JobLocation_location_key` (`location`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `joblocation`
--

LOCK TABLES `joblocation` WRITE;
/*!40000 ALTER TABLE `joblocation` DISABLE KEYS */;
INSERT INTO `joblocation` VALUES (10,'Anderlecht'),(11,'Anvers'),(13,'Braine-l\'Alleud'),(1,'Bruxelles'),(6,'Bruxelles-Capitale'),(5,'Charleroi'),(14,'Hainaut'),(12,'La Louvière'),(2,'Liège'),(8,'Mons'),(4,'Namur'),(9,'Nivelles'),(7,'Tournai'),(3,'Wavre');
/*!40000 ALTER TABLE `joblocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobtitle`
--

DROP TABLE IF EXISTS `jobtitle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobtitle` (
  `jobTitleId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`jobTitleId`),
  UNIQUE KEY `JobTitle_title_key` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobtitle`
--

LOCK TABLES `jobtitle` WRITE;
/*!40000 ALTER TABLE `jobtitle` DISABLE KEYS */;
INSERT INTO `jobtitle` VALUES (1,'Administrateur de bases de données'),(2,'Administrateur réseau'),(3,'Administrateur système'),(4,'Analyste de données'),(5,'Analyste de systèmes'),(6,'Analyste en récupération après sinistre'),(7,'Analyste en sécurité informatique'),(8,'Architecte cloud'),(9,'Architecte de solutions'),(10,'Chef de projet informatique'),(11,'Consultant en amélioration des processus'),(12,'Consultant en technologie de l\'information'),(13,'Designer d\'interface utilisateur (UI)'),(14,'Développeur/euse Angular'),(15,'Développeur/euse Backend'),(16,'Développeur/euse Blockchain'),(20,'Développeur/euse d\'applications mobiles'),(21,'Développeur/euse de jeux vidéo'),(22,'Développeur/euse de logiciels'),(17,'Développeur/euse Frontend'),(18,'Développeur/euse Full Stack'),(19,'Développeur/euse Python'),(23,'Développeur/euse web'),(24,'Gestionnaire de produit (Product Manager)'),(25,'Gestionnaire de réseau de distribution de contenu (CDN)'),(27,'Ingénieur de données'),(28,'Ingénieur de virtualisation'),(26,'Ingénieur DevOps'),(29,'Ingénieur en acoustique logicielle'),(30,'Ingénieur en intelligence artificielle'),(31,'Ingénieur en logiciel embarqué'),(32,'Ingénieur en sécurité des réseaux'),(33,'Ingénieur réseau'),(34,'Ingénieur système embarqué'),(35,'Scientifique des données'),(36,'Spécialiste BI (Business Intelligence)'),(37,'Spécialiste de l\'apprentissage automatique (Machine Learning Engineer)'),(38,'Spécialiste en accessibilité numérique'),(39,'Spécialiste en assurance qualité (QA Engineer)'),(40,'Spécialiste en automatisation de tests'),(41,'Spécialiste en cloud computing'),(42,'Spécialiste en cybersécurité'),(43,'Spécialiste en expérience utilisateur (UX Designer)'),(44,'Spécialiste en intégration de systèmes'),(45,'Technicien de support informatique'),(46,'Web Designer');
/*!40000 ALTER TABLE `jobtitle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `roleId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`roleId`),
  UNIQUE KEY `Roles_title_key` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrator'),(3,'Candidate'),(2,'Consultant'),(4,'Recruiter');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savejobs`
--

DROP TABLE IF EXISTS `savejobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savejobs` (
  `saveJobId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `jobListingId` int NOT NULL,
  PRIMARY KEY (`saveJobId`),
  KEY `SaveJobs_userId_fkey` (`userId`),
  KEY `SaveJobs_jobListingId_fkey` (`jobListingId`),
  CONSTRAINT `SaveJobs_jobListingId_fkey` FOREIGN KEY (`jobListingId`) REFERENCES `joblistings` (`jobListingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SaveJobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savejobs`
--

LOCK TABLES `savejobs` WRITE;
/*!40000 ALTER TABLE `savejobs` DISABLE KEYS */;
INSERT INTO `savejobs` VALUES (10,3,2),(11,1,1),(12,2,4),(13,3,1),(14,3,4),(15,16,1),(16,16,2),(17,16,4),(18,1,5),(19,2,2);
/*!40000 ALTER TABLE `savejobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeslot`
--

DROP TABLE IF EXISTS `timeslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeslot` (
  `timeSlotId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appHoursStart` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appHoursEnd` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`timeSlotId`),
  UNIQUE KEY `TimeSlot_title_key` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeslot`
--

LOCK TABLES `timeslot` WRITE;
/*!40000 ALTER TABLE `timeslot` DISABLE KEYS */;
INSERT INTO `timeslot` VALUES (1,'09:00 - 10:00','09:00','10:00'),(2,'10:15 - 11:15','10:15','11:15'),(3,'11:30 - 12:30','11:30','12:30'),(4,'13:00 - 14:30','13:00','14:30'),(5,'14:45 - 15:45','14:45','15:45'),(6,'16:00 - 17:00','16:00','17:00');
/*!40000 ALTER TABLE `timeslot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstname` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dateBirth` date NOT NULL,
  `sex` char(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobTitleId` int DEFAULT NULL,
  `cv` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nameCompany` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `addressCompany` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT NULL,
  `refreshToken` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification` tinyint(1) DEFAULT '1',
  `roleId` int NOT NULL,
  `verifiedMail` tinyint(1) DEFAULT '0',
  `confirmationMailToken` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmationMailTokenExpires` datetime(3) DEFAULT NULL,
  `tokenVersion` int NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `noteInscription` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `checkUserConsultant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experienceId` int DEFAULT NULL,
  `tvaNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descriptionCompany` varchar(1500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `Users_email_key` (`email`),
  KEY `Users_roleId_fkey` (`roleId`),
  KEY `Users_jobTitleId_fkey` (`jobTitleId`),
  KEY `Users_experienceId_fkey` (`experienceId`),
  CONSTRAINT `Users_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `experiences` (`experienceId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Users_jobTitleId_fkey` FOREIGN KEY (`jobTitleId`) REFERENCES `jobtitle` (`jobTitleId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`roleId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADMINISTRATOR','Koffi','1990-04-21','M','+32 123456789','ndrianass00@gmail.com','$2b$10$C.sYhIMp4CqvLjKv4MH7c.VMVo4v60P6oZbdlGmmUUGcqtHNydtf2',NULL,NULL,'Sur la Voie de la Reussite 100%, 4800 Verviers, BELGIQUE ',NULL,NULL,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJBRE1JTklTVFJBVE9SIiwiZmlyc3RuYW1lIjoiS29mZmkiLCJlbWFpbCI6Im5kcmlhbmFzczAwQGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwidG9rZW5WZXJzaW9uIjozMSwiaWF0IjoxNzE1MjYxNzQ1LCJleHAiOjE3MTU4NjY1NDV9.77ARSFQrIawYcmgLHADpjvkFaC1SGR5qdS7WwtdxVMI',1,1,1,NULL,NULL,31,'2024-04-21 09:45:02.009',NULL,'2024-05-09 13:35:45.533',NULL,NULL,NULL,NULL),(2,'CONSULTANT','Moussa','2000-12-10','M','+32 123456789','consultingmm2@gmail.com','$2b$10$OuxMFCRf5ydk0GLOVNVGwuMwYPO0/1kX2jqSEq7vfTiBpsZeK8Olu',NULL,NULL,'Adresse du consultant',NULL,NULL,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsIm5hbWUiOiJDT05TVUxUQU5UIiwiZmlyc3RuYW1lIjoiTW91c3NhIiwiZW1haWwiOiJjb25zdWx0aW5nbW0yQGdtYWlsLmNvbSIsInJvbGUiOiJDb25zdWx0YW50IiwidG9rZW5WZXJzaW9uIjoxMTAsImlhdCI6MTcxNTQxMTU1MCwiZXhwIjoxNzE2MDE2MzUwfQ.OXT2aXAo-UFNvh3rywO4HdNNw0yqDxIr21r0jZ7Nc5M',1,2,1,NULL,NULL,110,'2024-04-21 11:49:40.270',NULL,'2024-05-11 07:12:30.434','ADMINISTRATOR Koffi',NULL,NULL,NULL),(3,'N\'DRI','Anass','1985-06-05','M','+41 783028830','anassndri@live.fr','$2b$10$FypUXszAkoCoXDt/kx6VbOjjJym3h7LXxMEIIrH.3D3FwjJqEmnGi',14,'1714039042353-212816381.pdf','TFE  réussi à 100%, 4800 Verviers, BELGIQUE ',NULL,NULL,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsIm5hbWUiOiJOJ0RSSSIsImZpcnN0bmFtZSI6IkFuYXNzIiwiZW1haWwiOiJhbmFzc25kcmlAbGl2ZS5mciIsInJvbGUiOiJDYW5kaWRhdGUiLCJ0b2tlblZlcnNpb24iOjI3LCJpYXQiOjE3MTUzNTE1NzIsImV4cCI6MTcxNTk1NjM3Mn0.DfEQuoNL_5GN7ZTSrGVOgfNaOur9PfntiQR0eyJXOB0',1,3,1,NULL,NULL,27,'2024-04-21 10:46:24.503','De plus, le directeur de l\'entreprise se dit disposé à fournir une attestation des heures effectuées et tout autre document concernant mon stage, par courrier recommandé ou voie électronique si nécessaire. J\'ai inclus l\'école et le Directeur de Symbol SA en copie de ce courriel.','2024-05-10 14:32:52.034','Moussa CONSULTANT',1,NULL,NULL),(4,'RECRUTEUR','Marie Madeleine','2000-12-12','F','+41 784512125','marierecruteur@gmail.com','$2b$10$QzMRSYdUIn8Toj4rbIMYxexrmevTMN8NnRr13IBYV3CWl64thuRzi',NULL,NULL,NULL,'BIG WEST TECH','Rue des recruteurs 100, 1000 Bruxelles',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsIm5hbWUiOiJSRUNSVVRFVVIiLCJmaXJzdG5hbWUiOiJNYXJpZSBNYWRlbGVpbmUiLCJlbWFpbCI6Im1hcmllcmVjcnV0ZXVyQGdtYWlsLmNvbSIsInJvbGUiOiJSZWNydWl0ZXIiLCJ0b2tlblZlcnNpb24iOjQyLCJpYXQiOjE3MTUzODA1OTUsImV4cCI6MTcxNTk4NTM5NX0.Tvzay7Qf95X9jb5uS5WJXrplSAfviBPga65NSkvRf6E',1,4,1,NULL,NULL,42,'2024-04-21 11:17:13.343',NULL,'2024-05-10 22:36:35.697',NULL,NULL,'BE9999999999','Notre société, leader dans le secteur des technologies de l\'information, est dédiée à la création de solutions numériques innovantes pour une clientèle globale. Avec une équipe de professionnels talentueux et un engagement envers l\'excellence technologique, nous favorisons une culture de croissance continue et de développement professionnel. Nos projets sont variés, allant de développements internes à des collaborations avec de grandes entreprises internationales'),(16,'CANDIDAT','Candidat','1990-01-01','M','+32 4212457896','stageanass@gmail.com','$2b$10$VFJzCtQh.RZ7IXMhl26LneJ6lbhhIp0f6opCtbPR.RLuNhHqGZ8fO',3,'1714040714238-99147912.pdf','1234 Main Street',NULL,NULL,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJuYW1lIjoiQ0FORElEQVQiLCJmaXJzdG5hbWUiOiJDYW5kaWRhdCIsImVtYWlsIjoic3RhZ2VhbmFzc0BnbWFpbC5jb20iLCJyb2xlIjoiQ2FuZGlkYXRlIiwidG9rZW5WZXJzaW9uIjo2LCJpYXQiOjE3MTUzMjY3MTYsImV4cCI6MTcxNTkzMTUxNn0.Wu4MPXSEuBGvtvjy5o29UldT-l6vDojKlF46Qz73JBc',1,3,1,NULL,NULL,6,'2024-04-25 10:25:14.396',NULL,'2024-05-10 07:38:36.292','Moussa CONSULTANT',3,NULL,NULL),(17,'AMOUR','Nour','2000-05-05','F','+32 123456789','nour@gmail.com','$2b$10$H2ZPbqMW02vfMFIAiDTKueYKLP/X9cKW7UROS21WNa9vwH6JkRZmm',NULL,NULL,NULL,'SSL TECH','Rue de la réussite 99% à Ipes VEREVIERS',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3LCJuYW1lIjoiQU1PVVIiLCJmaXJzdG5hbWUiOiJOb3VyIiwiZW1haWwiOiJub3VyQGdtYWlsLmNvbSIsInJvbGUiOiJSZWNydWl0ZXIiLCJ0b2tlblZlcnNpb24iOjIsImlhdCI6MTcxNDc1ODkzMywiZXhwIjoxNzE1MzYzNzMzfQ.klXYbu5Q2bzcWlPz7kkNixHRk5HAgCCinjJsoCYKt5A',1,4,1,NULL,NULL,2,'2024-04-25 10:45:52.149',NULL,'2024-05-03 17:55:33.818','Moussa CONSULTANT',NULL,'BE9999999999','sffffsgggggggggggggggggggggggggggggggggdggssgsgsgsgsgsgsg'),(18,'Recruiter','recruteur','1985-02-05','F','+32 352152152','test@mail.com','$2b$10$xS73.QCXusitEHPU7kT.5e1aKbCBO9TXusPTyD8BgFdH7vUrpVzK.',NULL,NULL,NULL,'TEST-COMPAGNE','adrersse',NULL,NULL,1,4,1,NULL,NULL,1,'2024-04-25 21:25:33.047',NULL,'2024-04-25 21:25:33.047',NULL,NULL,'BE9855545655','afzukhvvvvvvvvvvvvvvvvvf'),(19,'KADJO','Kassi','2000-02-02','F','+32 352152152','mgo@mail.com','$2b$10$dv0uUfN4UitCW97xZnje2.P4dgwQhInoboPKLwpf/c96UFpiRgo/e',14,'1714080445711-388231572.pdf','test',NULL,NULL,1,NULL,1,3,1,NULL,NULL,1,'2024-04-25 21:27:25.968',NULL,'2024-05-09 17:06:17.758','Moussa CONSULTANT',3,NULL,NULL),(20,'CANDIDAT','Candidat','1990-01-01','M','+32 4212457896','tester@gmail.com','$2b$10$hHm74LzHJqAD/xgtSqTuveIn03Y7fH67UF4yx85AbdVZoBEaUZHOm',3,'1714080491902-999405630.pdf','1234 Main Street',NULL,NULL,1,NULL,1,3,1,NULL,NULL,1,'2024-04-25 21:28:12.064',NULL,'2024-04-29 13:41:18.156','Moussa CONSULTANT',NULL,NULL,NULL),(21,'CANDIDAT','Candidat','1990-01-01','M','+32 4212457896','testeurr@gmail.com','$2b$10$zsyB2a6pG9i7xBJrNNs29e3GcYbf4pCV2lwuhwwXYTUOHRLHC9Rye',3,'1714080497873-989049957.pdf','1234 Main Street',NULL,NULL,NULL,NULL,1,3,1,NULL,NULL,1,'2024-04-25 21:28:18.014',NULL,'2024-04-25 21:28:18.014',NULL,NULL,NULL,NULL),(22,'AMOUR','Nour','2000-05-05','F','+32 123456789','noura@gmail.com','$2b$10$LnrlX8Arlvvfni.dBrQl3e8l0YHuLFw9SniZhbB8m2jeq0dQb78/G',NULL,NULL,NULL,'CONNECT SA','Rue de la réussite 99% à Ipes VEREVIERS',1,NULL,1,4,1,NULL,NULL,1,'2024-04-25 21:28:48.173',NULL,'2024-04-25 21:28:48.173',NULL,NULL,'BE9999999999','sffffsgggggggggggggggggggggggggggggggggdggssgsgsgsgsgsgsg'),(23,'AMOUR','Nour','2000-05-05','F','+32 123456789','nouraa@gmail.com','$2b$10$r5HdeleecmAmImPk3cTFneZ81lO3DS2UKpUjA2e6HQZyOUzkbbrzm',NULL,NULL,NULL,'M&M Consulting','Rue de la réussite 99% à Ipes VEREVIERS',1,NULL,1,4,1,NULL,NULL,1,'2024-04-25 21:28:54.491',NULL,'2024-05-01 23:33:05.847','Moussa CONSULTANT',NULL,'BE9999999999','sffffsgggggggggggggggggggggggggggggggggdggssgsgsgsgsgsgsg'),(24,'Jean','Dupont','2000-05-15','M','+32 0123456789','ad@trtconseiler.info','$2b$10$JE8XrUCV2ItOZmcFr.bCcePUA2PyCdbN8d6mW1Z9zMvkzhjmAiYjW',NULL,NULL,'123 Rue de l\'Exemple, 75000 Paris',NULL,NULL,NULL,NULL,1,4,1,NULL,NULL,1,'2024-04-25 21:32:28.175',NULL,'2024-04-25 21:32:28.175','ADMINISTRATOR Koffi',NULL,NULL,NULL),(25,'Jean','Dupont','2000-05-15','M','+32 0123456789','admin@trtconseiler.info','$2b$10$AKafwH4kCPp7IpmwtvnszeW8uDrbJkk.CGk52QMd1SKiBBU4tuj0C',NULL,NULL,'123 Rue de l\'Exemple, 75000 Paris',NULL,NULL,NULL,NULL,1,3,1,NULL,NULL,1,'2024-04-25 21:32:38.218',NULL,'2024-04-25 21:32:38.218','ADMINISTRATOR Koffi',NULL,NULL,NULL),(26,'Jean','Dupont','2000-05-15','M','+32 0123456789','administrator@trtconseiler.info','$2b$10$mx/Y6mqoKuUaFt0ijpxNAeLoHd/.9vgkTtLguOxZf0Lz2g9hgU1wC',NULL,NULL,'123 Rue de l\'Exemple, 75000 Paris',NULL,NULL,NULL,NULL,1,2,1,NULL,NULL,1,'2024-04-25 21:32:56.726',NULL,'2024-04-25 21:32:56.726','ADMINISTRATOR Koffi',NULL,NULL,NULL),(27,'COLLABORATOR','Collaborator','1985-05-02','M','+32 123456789','collaborator@gmail.com','$2b$10$D.xIosBNoWwX1KvrxQ7zQOZ6a8g8qs2bfL53gUUJ8fUqPz0CV8RAq',NULL,NULL,'Test register Collaborator',NULL,NULL,NULL,NULL,1,2,1,'8e4b648f-c88f-48d1-ac51-8883a0960064','2024-04-27 00:35:04.667',1,'2024-04-26 00:35:04.669',NULL,'2024-04-26 00:35:04.669','ADMINISTRATOR Koffi',NULL,NULL,NULL),(29,'CANDIDAT','Mathias','2000-02-12','M','+32 412548788','mathiasballo82@gmail.com','$2b$10$nyNiFQjU87s/Yi8LFP63hubm5L0CAkJ1XH1lTJg/qUqIgN6aqy13m',15,'1715270777772-903174863.pdf','Rue des Candidats 3',NULL,NULL,1,NULL,1,3,1,NULL,NULL,1,'2024-05-09 16:06:17.879',NULL,'2024-05-09 16:13:14.038','Moussa CONSULTANT',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-11 23:22:17
