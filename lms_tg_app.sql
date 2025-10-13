-- Adminer 4.17.1 MySQL 11.4.8-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `lms_tg_app`;
CREATE DATABASE `lms_tg_app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `lms_tg_app`;

DROP TABLE IF EXISTS `cases`;
CREATE TABLE `cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `situation` text NOT NULL,
  `sellerLegend` text NOT NULL,
  `buyerLegend` text NOT NULL,
  `sellerTask` text NOT NULL,
  `buyerTask` text NOT NULL,
  `recommendedSellerLevel` enum('LEVEL_3','LEVEL_4') NOT NULL DEFAULT 'LEVEL_3',
  `createdByUserId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cases_createdByUserId_fkey` (`createdByUserId`),
  CONSTRAINT `cases_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cases` (`id`, `title`, `situation`, `sellerLegend`, `buyerLegend`, `sellerTask`, `buyerTask`, `recommendedSellerLevel`, `createdByUserId`, `createdAt`, `updatedAt`) VALUES
(1,	'Кейс 1',	'Какая-то ситуация для продавца',	'Какая-то легенда для продавца',	'Какая-то ситуация для покупателя',	'Какая-то легенда для продавца',	'Что-то сделать',	'LEVEL_4',	1,	'2025-10-09 17:35:07.322',	'2025-10-09 17:35:07.322');

DROP TABLE IF EXISTS `case_scenarios`;
CREATE TABLE `case_scenarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `caseId` int(11) NOT NULL,
  `scenarioId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_scenarios_caseId_scenarioId_key` (`caseId`,`scenarioId`),
  KEY `case_scenarios_caseId_idx` (`caseId`),
  KEY `case_scenarios_scenarioId_idx` (`scenarioId`),
  CONSTRAINT `case_scenarios_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `case_scenarios_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `case_scenarios` (`id`, `caseId`, `scenarioId`, `createdAt`) VALUES
(1,	1,	1,	'2025-10-09 17:35:07.327');

DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` enum('LEVEL_3','LEVEL_4') NOT NULL DEFAULT 'LEVEL_3',
  `inn` varchar(191) DEFAULT NULL,
  `activatedAt` datetime(3) DEFAULT NULL,
  `addedByAdminId` int(11) NOT NULL,
  `clientUserId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_clientUserId_key` (`clientUserId`),
  KEY `clients_addedByAdminId_fkey` (`addedByAdminId`),
  CONSTRAINT `clients_addedByAdminId_fkey` FOREIGN KEY (`addedByAdminId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `clients_clientUserId_fkey` FOREIGN KEY (`clientUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clients` (`id`, `level`, `inn`, `activatedAt`, `addedByAdminId`, `clientUserId`, `createdAt`, `updatedAt`) VALUES
(1,	'LEVEL_3',	'9012321352',	NULL,	1,	4,	'2025-10-09 17:20:49.596',	'2025-10-09 17:37:09.573'),
(2,	'LEVEL_4',	'1234567891',	NULL,	2,	9,	'2025-10-10 16:18:44.387',	'2025-10-10 16:18:44.387'),
(3,	'LEVEL_4',	'1234567891',	NULL,	3,	13,	'2025-10-13 12:14:09.933',	'2025-10-13 12:14:35.437');

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `shortDesc` text DEFAULT NULL,
  `isIntro` tinyint(1) NOT NULL DEFAULT 0,
  `accessScope` enum('ALL','CLIENTS_LIST') NOT NULL DEFAULT 'ALL',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courses_title_key` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `title`, `shortDesc`, `isIntro`, `accessScope`, `createdAt`, `updatedAt`) VALUES
(1,	'Тестовый курс',	'Описание для тестового курса',	1,	'ALL',	'2025-10-09 17:18:29.094',	'2025-10-09 17:18:29.094'),
(2,	'Какой-то курс',	'Какой-то курс описание',	0,	'ALL',	'2025-10-09 17:35:36.533',	'2025-10-09 17:35:36.533'),
(3,	'Тестовое название',	'Тестовое описание',	0,	'ALL',	'2025-10-13 08:13:07.588',	'2025-10-13 08:13:07.588');

DROP TABLE IF EXISTS `course_client_access`;
CREATE TABLE `course_client_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_client_access_courseId_clientId_key` (`courseId`,`clientId`),
  KEY `course_client_access_clientId_idx` (`clientId`),
  CONSTRAINT `course_client_access_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `course_client_access_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `evaluation_answers`;
CREATE TABLE `evaluation_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submissionId` int(11) NOT NULL,
  `blockId` int(11) NOT NULL,
  `selectedOptionId` int(11) DEFAULT NULL,
  `textAnswer` text DEFAULT NULL,
  `targetSkillId` int(11) DEFAULT NULL,
  `itemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluation_answers_submissionId_blockId_itemId_key` (`submissionId`,`blockId`,`itemId`),
  KEY `evaluation_answers_targetSkillId_idx` (`targetSkillId`),
  KEY `evaluation_answers_blockId_fkey` (`blockId`),
  KEY `evaluation_answers_selectedOptionId_fkey` (`selectedOptionId`),
  KEY `evaluation_answers_itemId_fkey` (`itemId`),
  CONSTRAINT `evaluation_answers_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `scenario_form_blocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `evaluation_answers_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `scenario_form_block_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `evaluation_answers_selectedOptionId_fkey` FOREIGN KEY (`selectedOptionId`) REFERENCES `scale_options` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `evaluation_answers_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `evaluation_submissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `evaluation_answers_targetSkillId_fkey` FOREIGN KEY (`targetSkillId`) REFERENCES `skills` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `evaluation_answers` (`id`, `submissionId`, `blockId`, `selectedOptionId`, `textAnswer`, `targetSkillId`, `itemId`) VALUES
(1,	1,	2,	5,	NULL,	1,	1),
(2,	1,	2,	4,	NULL,	2,	2),
(3,	1,	2,	5,	NULL,	3,	3),
(4,	1,	2,	5,	NULL,	4,	4),
(5,	1,	2,	5,	NULL,	5,	5),
(6,	1,	3,	8,	NULL,	2,	6),
(7,	1,	3,	8,	NULL,	2,	7),
(8,	1,	3,	8,	NULL,	2,	8),
(9,	1,	3,	7,	NULL,	2,	9),
(10,	1,	3,	7,	NULL,	2,	10),
(11,	1,	4,	NULL,	'Продавец был хорош',	NULL,	NULL),
(12,	2,	5,	10,	NULL,	6,	11),
(13,	2,	5,	10,	NULL,	7,	12),
(14,	2,	5,	10,	NULL,	8,	13),
(15,	3,	2,	5,	NULL,	1,	1),
(16,	3,	2,	5,	NULL,	2,	2),
(17,	3,	2,	4,	NULL,	3,	3),
(18,	3,	2,	5,	NULL,	4,	4),
(19,	3,	2,	5,	NULL,	5,	5),
(20,	3,	3,	8,	NULL,	2,	6),
(21,	3,	3,	8,	NULL,	2,	7),
(22,	3,	3,	8,	NULL,	2,	8),
(23,	3,	3,	6,	NULL,	2,	9),
(24,	3,	3,	9,	NULL,	2,	10),
(25,	3,	4,	NULL,	'Отличный продавец, у него есть талант',	NULL,	NULL),
(26,	4,	6,	11,	NULL,	9,	14),
(27,	4,	6,	11,	NULL,	10,	15),
(28,	4,	6,	12,	NULL,	11,	16),
(29,	5,	5,	12,	NULL,	6,	11),
(30,	5,	5,	12,	NULL,	7,	12),
(31,	5,	5,	12,	NULL,	8,	13),
(32,	6,	6,	12,	NULL,	9,	14),
(33,	6,	6,	12,	NULL,	10,	15),
(34,	6,	6,	12,	NULL,	11,	16);

DROP TABLE IF EXISTS `evaluation_submissions`;
CREATE TABLE `evaluation_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceId` int(11) NOT NULL,
  `evaluatorUserId` int(11) NOT NULL,
  `evaluatedUserId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluation_submissions_practiceId_evaluatorUserId_evaluatedU_key` (`practiceId`,`evaluatorUserId`,`evaluatedUserId`),
  KEY `evaluation_submissions_evaluatorUserId_idx` (`evaluatorUserId`),
  KEY `evaluation_submissions_evaluatedUserId_idx` (`evaluatedUserId`),
  CONSTRAINT `evaluation_submissions_evaluatedUserId_fkey` FOREIGN KEY (`evaluatedUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `evaluation_submissions_evaluatorUserId_fkey` FOREIGN KEY (`evaluatorUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `evaluation_submissions_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `evaluation_submissions` (`id`, `practiceId`, `evaluatorUserId`, `evaluatedUserId`, `createdAt`, `updatedAt`) VALUES
(1,	3,	1,	5,	'2025-10-09 18:28:46.776',	'2025-10-09 18:28:46.776'),
(2,	3,	1,	6,	'2025-10-09 18:28:46.790',	'2025-10-09 18:28:46.790'),
(3,	3,	6,	5,	'2025-10-09 18:30:12.791',	'2025-10-09 18:30:12.791'),
(4,	3,	6,	1,	'2025-10-09 18:30:12.803',	'2025-10-09 18:30:12.803'),
(5,	3,	5,	6,	'2025-10-09 18:30:35.261',	'2025-10-09 18:30:35.261'),
(6,	3,	5,	1,	'2025-10-09 18:30:35.287',	'2025-10-09 18:30:35.287');

DROP TABLE IF EXISTS `evaluation_tasks`;
CREATE TABLE `evaluation_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceId` int(11) NOT NULL,
  `evaluatorUserId` int(11) NOT NULL,
  `evaluatedUserId` int(11) NOT NULL,
  `targetRole` enum('SELLER','BUYER','MODERATOR') NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('PENDING','SUBMITTED') NOT NULL DEFAULT 'PENDING',
  `deadlineAt` datetime(3) NOT NULL,
  `submittedAt` datetime(3) DEFAULT NULL,
  `overdueAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluation_tasks_practiceId_evaluatorUserId_evaluatedUserId_key` (`practiceId`,`evaluatorUserId`,`evaluatedUserId`),
  KEY `evaluation_tasks_evaluatorUserId_idx` (`evaluatorUserId`),
  KEY `evaluation_tasks_evaluatedUserId_idx` (`evaluatedUserId`),
  KEY `evaluation_tasks_overdueAt_idx` (`overdueAt`),
  CONSTRAINT `evaluation_tasks_evaluatedUserId_fkey` FOREIGN KEY (`evaluatedUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `evaluation_tasks_evaluatorUserId_fkey` FOREIGN KEY (`evaluatorUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `evaluation_tasks_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `evaluation_tasks` (`id`, `practiceId`, `evaluatorUserId`, `evaluatedUserId`, `targetRole`, `required`, `status`, `deadlineAt`, `submittedAt`, `overdueAt`) VALUES
(1,	3,	5,	6,	'BUYER',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:30:35.267',	NULL),
(2,	3,	5,	1,	'MODERATOR',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:30:35.302',	NULL),
(3,	3,	6,	5,	'SELLER',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:30:12.797',	NULL),
(4,	3,	6,	1,	'MODERATOR',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:30:12.810',	NULL),
(5,	3,	1,	5,	'SELLER',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:28:46.784',	NULL),
(6,	3,	1,	6,	'BUYER',	1,	'SUBMITTED',	'2025-10-09 20:59:59.999',	'2025-10-09 18:28:46.797',	NULL);

DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `moduleId` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `shortDesc` text DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `quizId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lessons_quizId_key` (`quizId`),
  KEY `lessons_moduleId_idx` (`moduleId`),
  CONSTRAINT `lessons_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lessons_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lessons` (`id`, `moduleId`, `title`, `shortDesc`, `orderIndex`, `quizId`) VALUES
(3,	1,	'Урок номер 1',	'Описание для урока номер 1',	1,	6),
(4,	1,	'Урок номер два ',	'Описание для урока номер 2',	2,	8),
(5,	3,	'Первая урока для модуля 2',	'Описание для первая урока модуля 2',	1,	9),
(6,	3,	'Урока для модуля',	'Модуля для урока',	2,	10),
(8,	4,	'Урок 1',	'Тестовое описание этого урока ',	1,	13);

DROP TABLE IF EXISTS `lesson_content_blocks`;
CREATE TABLE `lesson_content_blocks` (
  `lessonId` int(11) NOT NULL,
  `orderIndex` int(11) NOT NULL,
  `type` enum('TEXT','IMAGE','VIDEO','AUDIO','FILE') NOT NULL,
  `textContent` text DEFAULT NULL,
  `storageObjectId` int(11) DEFAULT NULL,
  PRIMARY KEY (`lessonId`,`orderIndex`),
  KEY `lesson_content_blocks_storageObjectId_idx` (`storageObjectId`),
  CONSTRAINT `lesson_content_blocks_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_content_blocks_storageObjectId_fkey` FOREIGN KEY (`storageObjectId`) REFERENCES `storage_objects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lesson_content_blocks` (`lessonId`, `orderIndex`, `type`, `textContent`, `storageObjectId`) VALUES
(3,	1,	'TEXT',	'Текстовый блок с описанием материалов!',	NULL),
(3,	2,	'IMAGE',	NULL,	7),
(3,	3,	'FILE',	NULL,	8),
(5,	1,	'TEXT',	'учим что-то первая модуля урока 2',	NULL),
(6,	1,	'TEXT',	'чота учим',	NULL),
(8,	1,	'TEXT',	'ТЕкст текст текст',	NULL),
(8,	2,	'IMAGE',	NULL,	18),
(8,	3,	'VIDEO',	NULL,	14);

DROP TABLE IF EXISTS `license_slots`;
CREATE TABLE `license_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clientId` int(11) NOT NULL,
  `status` enum('ACTIVE','NOT_ACTIVE','EXPIRED') NOT NULL DEFAULT 'NOT_ACTIVE',
  `assignedMopUserId` int(11) DEFAULT NULL,
  `durationSeconds` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `license_slots_clientId_idx` (`clientId`),
  KEY `license_slots_assignedMopUserId_fkey` (`assignedMopUserId`),
  CONSTRAINT `license_slots_assignedMopUserId_fkey` FOREIGN KEY (`assignedMopUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `license_slots_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `license_slots` (`id`, `clientId`, `status`, `assignedMopUserId`, `durationSeconds`, `createdAt`, `updatedAt`) VALUES
(1,	1,	'ACTIVE',	5,	1640350,	'2025-10-09 17:20:49.608',	'2025-10-13 18:00:00.362'),
(2,	1,	'ACTIVE',	6,	1640350,	'2025-10-09 17:20:49.608',	'2025-10-13 18:00:00.362'),
(3,	2,	'NOT_ACTIVE',	NULL,	1759275,	'2025-10-10 16:18:44.392',	'2025-10-13 14:50:14.144'),
(4,	1,	'ACTIVE',	NULL,	1640395,	'2025-10-10 19:20:04.399',	'2025-10-13 18:00:00.362'),
(5,	1,	'NOT_ACTIVE',	NULL,	46416,	'2025-10-13 09:06:23.235',	'2025-10-13 09:06:23.235'),
(6,	1,	'NOT_ACTIVE',	NULL,	46416,	'2025-10-13 09:06:23.235',	'2025-10-13 09:06:23.235'),
(7,	1,	'NOT_ACTIVE',	NULL,	46406,	'2025-10-13 09:06:33.680',	'2025-10-13 09:06:33.680'),
(8,	1,	'NOT_ACTIVE',	NULL,	46406,	'2025-10-13 09:06:33.680',	'2025-10-13 09:06:33.680'),
(9,	1,	'NOT_ACTIVE',	NULL,	46406,	'2025-10-13 09:06:33.680',	'2025-10-13 09:06:33.680'),
(10,	1,	'NOT_ACTIVE',	NULL,	46406,	'2025-10-13 09:06:33.680',	'2025-10-13 09:06:33.680'),
(11,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(12,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(13,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(14,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(15,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(16,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(17,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(18,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(19,	1,	'NOT_ACTIVE',	NULL,	1515180,	'2025-10-13 09:06:59.687',	'2025-10-13 09:06:59.687'),
(20,	2,	'NOT_ACTIVE',	NULL,	6353401,	'2025-10-13 09:09:58.994',	'2025-10-13 09:09:58.994'),
(21,	2,	'NOT_ACTIVE',	NULL,	6353401,	'2025-10-13 09:09:58.994',	'2025-10-13 09:09:58.994'),
(22,	2,	'NOT_ACTIVE',	NULL,	6353401,	'2025-10-13 09:09:58.994',	'2025-10-13 09:09:58.994'),
(23,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(24,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(25,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(26,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(27,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(28,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(29,	2,	'NOT_ACTIVE',	NULL,	6353367,	'2025-10-13 09:10:32.836',	'2025-10-13 09:10:32.836'),
(30,	3,	'ACTIVE',	14,	1568750,	'2025-10-13 12:14:09.937',	'2025-10-13 18:00:00.362'),
(31,	3,	'NOT_ACTIVE',	NULL,	1590350,	'2025-10-13 12:14:09.937',	'2025-10-13 12:14:09.937'),
(32,	3,	'NOT_ACTIVE',	NULL,	1590350,	'2025-10-13 12:14:09.937',	'2025-10-13 12:14:09.937'),
(33,	3,	'NOT_ACTIVE',	NULL,	1501853,	'2025-10-13 12:49:06.586',	'2025-10-13 12:49:06.586'),
(34,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(35,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(36,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(37,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(38,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(39,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(40,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(41,	3,	'NOT_ACTIVE',	NULL,	1501829,	'2025-10-13 12:49:30.453',	'2025-10-13 12:49:30.453'),
(42,	2,	'NOT_ACTIVE',	NULL,	29540,	'2025-10-13 14:47:39.936',	'2025-10-13 14:47:39.936');

DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseId` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `shortDesc` text DEFAULT NULL,
  `testVariant` enum('NONE','QUIZ') NOT NULL DEFAULT 'NONE',
  `unlockRule` enum('ALL','AFTER_PREV_MODULE','LEVEL_3','LEVEL_4') NOT NULL DEFAULT 'ALL',
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `quizId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `modules_quizId_key` (`quizId`),
  KEY `modules_courseId_idx` (`courseId`),
  KEY `modules_quizId_idx` (`quizId`),
  CONSTRAINT `modules_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `modules_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `modules` (`id`, `courseId`, `title`, `shortDesc`, `testVariant`, `unlockRule`, `orderIndex`, `quizId`, `createdAt`, `updatedAt`) VALUES
(1,	2,	'Первый модуль!',	'Описание для первого модуля!',	'QUIZ',	'ALL',	1,	NULL,	'2025-10-10 16:16:23.340',	'2025-10-10 16:16:23.340'),
(2,	1,	'Овлвлстмт',	'Чтволаьстстс\n',	'QUIZ',	'ALL',	1,	NULL,	'2025-10-11 01:10:11.793',	'2025-10-11 01:10:11.793'),
(3,	2,	'Модуля 2',	'Описание для модуля 2',	'NONE',	'ALL',	2,	NULL,	'2025-10-12 13:38:35.859',	'2025-10-12 13:38:35.859'),
(4,	3,	'Модуль 1',	'Тестовое описание модуля 1',	'QUIZ',	'ALL',	1,	NULL,	'2025-10-13 08:13:42.329',	'2025-10-13 08:13:42.329');

DROP TABLE IF EXISTS `mop_profiles`;
CREATE TABLE `mop_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `repScore` int(11) NOT NULL DEFAULT 0,
  `level` enum('LEVEL_3','LEVEL_4') NOT NULL DEFAULT 'LEVEL_3',
  `mopUserId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `currentSlotId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mop_profiles_mopUserId_key` (`mopUserId`),
  KEY `mop_profiles_clientId_idx` (`clientId`),
  KEY `mop_profiles_currentSlotId_fkey` (`currentSlotId`),
  CONSTRAINT `mop_profiles_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `mop_profiles_currentSlotId_fkey` FOREIGN KEY (`currentSlotId`) REFERENCES `license_slots` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mop_profiles_mopUserId_fkey` FOREIGN KEY (`mopUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mop_profiles` (`id`, `repScore`, `level`, `mopUserId`, `clientId`, `currentSlotId`, `createdAt`, `updatedAt`) VALUES
(1,	3,	'LEVEL_3',	5,	1,	1,	'2025-10-09 17:57:36.991',	'2025-10-09 21:05:00.117'),
(2,	3,	'LEVEL_3',	6,	1,	2,	'2025-10-09 17:57:53.293',	'2025-10-09 21:05:00.135'),
(4,	0,	'LEVEL_3',	12,	2,	3,	'2025-10-12 13:45:26.411',	'2025-10-12 13:45:26.411'),
(5,	0,	'LEVEL_3',	14,	3,	30,	'2025-10-13 12:24:49.710',	'2025-10-13 12:24:49.710');

DROP TABLE IF EXISTS `participant_eval_summaries`;
CREATE TABLE `participant_eval_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `positivePercent` int(11) NOT NULL,
  `isPositive` tinyint(1) NOT NULL,
  `computedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `participant_eval_summaries_practiceId_userId_key` (`practiceId`,`userId`),
  KEY `participant_eval_summaries_userId_idx` (`userId`),
  CONSTRAINT `participant_eval_summaries_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `participant_eval_summaries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `participant_eval_summaries` (`id`, `practiceId`, `userId`, `positivePercent`, `isPositive`, `computedAt`) VALUES
(1,	3,	5,	0,	0,	'2025-10-09 18:28:47.858');

DROP TABLE IF EXISTS `practices`;
CREATE TABLE `practices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `scenarioId` int(11) NOT NULL,
  `scenarioVersion` int(11) NOT NULL DEFAULT 1,
  `caseId` int(11) DEFAULT NULL,
  `practiceType` enum('WITH_CASE','WITHOUT_CASE','MINI') NOT NULL,
  `createdByUserId` int(11) NOT NULL,
  `createdByRole` varchar(191) NOT NULL,
  `startAt` datetime(3) NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED') NOT NULL DEFAULT 'SCHEDULED',
  `zoomLink` varchar(191) NOT NULL,
  `autoCancelAt` datetime(3) NOT NULL,
  `evaluationState` enum('NONE','OPEN','FINAL') NOT NULL DEFAULT 'NONE',
  `evaluationFinalizedAt` datetime(3) DEFAULT NULL,
  `finishedAt` datetime(3) DEFAULT NULL,
  `sellerUserId` int(11) DEFAULT NULL,
  `buyerUserId` int(11) DEFAULT NULL,
  `moderatorUserId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `recordingObjectId` int(11) DEFAULT NULL,
  `recordingExpiresAt` datetime(3) DEFAULT NULL,
  `resultsAvailable` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `practices_autoCancelAt_idx` (`autoCancelAt`),
  KEY `practices_scenarioId_caseId_idx` (`scenarioId`,`caseId`),
  KEY `practices_caseId_fkey` (`caseId`),
  KEY `practices_sellerUserId_fkey` (`sellerUserId`),
  KEY `practices_buyerUserId_fkey` (`buyerUserId`),
  KEY `practices_moderatorUserId_fkey` (`moderatorUserId`),
  KEY `practices_recordingObjectId_fkey` (`recordingObjectId`),
  CONSTRAINT `practices_buyerUserId_fkey` FOREIGN KEY (`buyerUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `practices_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `practices_moderatorUserId_fkey` FOREIGN KEY (`moderatorUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `practices_recordingObjectId_fkey` FOREIGN KEY (`recordingObjectId`) REFERENCES `storage_objects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `practices_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `practices_sellerUserId_fkey` FOREIGN KEY (`sellerUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `practices` (`id`, `title`, `scenarioId`, `scenarioVersion`, `caseId`, `practiceType`, `createdByUserId`, `createdByRole`, `startAt`, `status`, `zoomLink`, `autoCancelAt`, `evaluationState`, `evaluationFinalizedAt`, `finishedAt`, `sellerUserId`, `buyerUserId`, `moderatorUserId`, `createdAt`, `updatedAt`, `recordingObjectId`, `recordingExpiresAt`, `resultsAvailable`) VALUES
(1,	'наблюдатель общ + выявление + презентация',	1,	1,	1,	'WITH_CASE',	1,	'ADMIN',	'2025-10-09 18:05:00.000',	'CANCELED',	'https://www.figma.com/design/oBccPFrAPAeP9ZJiAkmx76/%D0%9B%D0%B8%D0%B3%D0%B0-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6?node-id=133-2664&p=f&t=55iOeV6XiBnpwHvY-0',	'2025-10-09 17:05:00.000',	'NONE',	NULL,	NULL,	NULL,	NULL,	1,	'2025-10-09 18:00:04.850',	'2025-10-09 18:05:00.066',	NULL,	NULL,	0),
(2,	'наблюдатель общ + выявление + презентация',	1,	1,	1,	'WITH_CASE',	1,	'ADMIN',	'2025-10-10 06:15:00.000',	'CANCELED',	'https://www.figma.com/design/oBccPFrAPAeP9ZJiAkmx76/%D0%9B%D0%B8%D0%B3%D0%B0-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6?node-id=133-2664&p=f&t=55iOeV6XiBnpwHvY-0',	'2025-10-10 05:15:00.000',	'NONE',	NULL,	NULL,	5,	NULL,	1,	'2025-10-09 18:10:01.865',	'2025-10-10 05:15:00.041',	NULL,	NULL,	0),
(3,	'наблюдатель общ + выявление + презентация',	1,	1,	1,	'WITH_CASE',	1,	'ADMIN',	'2025-10-09 18:26:00.000',	'COMPLETED',	'https://www.figma.com/design/oBccPFrAPAeP9ZJiAkmx76/%D0%9B%D0%B8%D0%B3%D0%B0-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6?node-id=133-2664&p=f&t=55iOeV6XiBnpwHvY-0',	'2025-10-09 17:26:00.000',	'FINAL',	'2025-10-09 21:05:00.090',	'2025-10-09 18:27:11.557',	5,	6,	1,	'2025-10-09 18:23:46.572',	'2025-10-09 21:05:00.091',	1,	'2026-01-07 18:30:52.341',	1),
(4,	'наблюдатель общ + выявление + презентация',	1,	1,	NULL,	'WITHOUT_CASE',	1,	'ADMIN',	'2025-10-11 01:00:00.000',	'SCHEDULED',	'https://us05web.zoom.us/j/89466580917?pwd=dYSS6thbCROW4HjYvRMnLWO1ie685s.1',	'2025-10-11 00:00:00.000',	'NONE',	NULL,	NULL,	NULL,	NULL,	1,	'2025-10-11 01:09:32.375',	'2025-10-11 01:09:32.375',	NULL,	NULL,	0),
(5,	'наблюдатель общ + выявление + презентация',	1,	1,	NULL,	'WITHOUT_CASE',	1,	'ADMIN',	'2025-10-11 06:00:00.000',	'CANCELED',	'https://us05web.zoom.us/j/88570524907?pwd=z5wWx6DG8vDwgWaK12GYBkAeEbQaXw.1',	'2025-10-11 05:00:00.000',	'NONE',	NULL,	NULL,	NULL,	NULL,	1,	'2025-10-11 01:15:19.746',	'2025-10-11 05:00:00.174',	NULL,	NULL,	0),
(6,	'наблюдатель общ + выявление + презентация',	1,	1,	1,	'WITH_CASE',	17,	'ADMIN',	'2025-10-13 18:00:00.000',	'IN_PROGRESS',	'https://us05web.zoom.us/j/88165059316?pwd=V1wxjbovy6MzdwdKZTQ6bUywGoaX0M.1',	'2025-10-13 17:00:00.000',	'NONE',	NULL,	NULL,	6,	5,	17,	'2025-10-13 17:42:14.134',	'2025-10-13 18:00:00.284',	NULL,	NULL,	0);

DROP TABLE IF EXISTS `practice_observers`;
CREATE TABLE `practice_observers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `practice_observers_practiceId_userId_key` (`practiceId`,`userId`),
  KEY `practice_observers_userId_idx` (`userId`),
  CONSTRAINT `practice_observers_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `practice_observers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `practice_observers` (`id`, `practiceId`, `userId`, `joinedAt`) VALUES
(1,	2,	6,	'2025-10-09 21:43:59.852');

DROP TABLE IF EXISTS `practice_skills`;
CREATE TABLE `practice_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceId` int(11) NOT NULL,
  `skillId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `practice_skills_practiceId_skillId_key` (`practiceId`,`skillId`),
  KEY `practice_skills_skillId_idx` (`skillId`),
  CONSTRAINT `practice_skills_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `practice_skills_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `practice_skills` (`id`, `practiceId`, `skillId`) VALUES
(1,	1,	1),
(2,	1,	2),
(3,	1,	3),
(4,	1,	4),
(5,	1,	5),
(6,	1,	6),
(7,	1,	7),
(8,	1,	8),
(9,	1,	9),
(10,	1,	10),
(11,	1,	11),
(12,	2,	1),
(13,	2,	2),
(14,	2,	3),
(15,	2,	4),
(16,	2,	5),
(17,	2,	6),
(18,	2,	7),
(19,	2,	8),
(20,	2,	9),
(21,	2,	10),
(22,	2,	11),
(23,	3,	1),
(24,	3,	2),
(25,	3,	3),
(26,	3,	4),
(27,	3,	5),
(28,	3,	6),
(29,	3,	7),
(30,	3,	8),
(31,	3,	9),
(32,	3,	10),
(33,	3,	11),
(34,	4,	1),
(35,	4,	2),
(36,	4,	3),
(37,	4,	4),
(38,	4,	5),
(39,	4,	6),
(40,	4,	7),
(41,	4,	8),
(42,	4,	9),
(43,	4,	10),
(44,	4,	11),
(45,	5,	1),
(46,	5,	2),
(47,	5,	3),
(48,	5,	4),
(49,	5,	5),
(50,	5,	6),
(51,	5,	7),
(52,	5,	8),
(53,	5,	9),
(54,	5,	10),
(55,	5,	11),
(56,	6,	1),
(57,	6,	2),
(58,	6,	3),
(59,	6,	4),
(60,	6,	5),
(61,	6,	6),
(62,	6,	7),
(63,	6,	8),
(64,	6,	9),
(65,	6,	10),
(66,	6,	11);

DROP TABLE IF EXISTS `practice_zoom`;
CREATE TABLE `practice_zoom` (
  `practiceId` int(11) NOT NULL,
  `meetingId` varchar(191) NOT NULL,
  `joinUrl` varchar(191) NOT NULL,
  `startUrl` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`practiceId`),
  CONSTRAINT `practice_zoom_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `passThresholdPercent` int(11) NOT NULL DEFAULT 75,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quizzes` (`id`, `passThresholdPercent`) VALUES
(1,	75),
(2,	70),
(3,	70),
(4,	75),
(5,	70),
(6,	50),
(7,	75),
(8,	70),
(9,	75),
(10,	75),
(11,	75),
(12,	75),
(13,	70);

DROP TABLE IF EXISTS `quiz_answer_options`;
CREATE TABLE `quiz_answer_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `questionId` int(11) NOT NULL,
  `text` text NOT NULL,
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_answer_options_questionId_idx` (`questionId`),
  CONSTRAINT `quiz_answer_options_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_answer_options` (`id`, `questionId`, `text`, `isCorrect`) VALUES
(1,	1,	'Выбери это',	0),
(2,	1,	'Нет, это',	0),
(3,	1,	'Выбери точно это!',	1),
(4,	2,	'Выбирай второй вариант',	0),
(5,	2,	'Да, меня',	1),
(6,	2,	'Выбери второй',	0),
(7,	3,	'1',	0),
(8,	3,	'2',	0),
(9,	3,	'3',	1),
(16,	6,	'1',	0),
(17,	6,	'2',	0),
(18,	6,	'3',	1),
(19,	7,	'Вогамга',	0),
(20,	7,	'Таосгилк',	1),
(21,	8,	'Это правильно',	1),
(22,	8,	'это нет',	0),
(23,	8,	'это нет',	0),
(24,	9,	'это нет',	0),
(25,	9,	'это да',	1),
(26,	9,	'это нет',	0),
(27,	10,	'Нет',	0),
(28,	10,	'Нет',	0),
(29,	10,	'Да',	1),
(30,	11,	'нет',	0),
(31,	11,	'Нет',	0),
(32,	11,	'Нет',	0),
(33,	11,	'Да',	1),
(34,	12,	'нет',	0),
(35,	12,	'Нет',	0),
(36,	12,	'нет',	0),
(37,	12,	'Нет',	0),
(38,	12,	'Да',	1),
(39,	13,	'Один ответ',	1),
(40,	13,	'я не ответ',	0),
(41,	14,	'Не я',	0),
(42,	14,	'Да я',	1),
(43,	15,	'вариант 1',	0),
(44,	15,	'Вариант 2',	1),
(45,	16,	'Вариант 1 ',	0),
(46,	16,	'Вариант 2',	0),
(47,	16,	'Вариант 3',	1);

DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quizId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `startedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `finishedAt` datetime(3) DEFAULT NULL,
  `scorePercent` int(11) NOT NULL DEFAULT 0,
  `passed` tinyint(1) NOT NULL DEFAULT 0,
  `shuffleSeed` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_attempts_quizId_idx` (`quizId`),
  KEY `quiz_attempts_userId_idx` (`userId`),
  CONSTRAINT `quiz_attempts_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_attempts` (`id`, `quizId`, `userId`, `startedAt`, `finishedAt`, `scorePercent`, `passed`, `shuffleSeed`) VALUES
(1,	1,	2,	'2025-10-10 16:33:37.488',	NULL,	0,	0,	706676113),
(2,	3,	2,	'2025-10-10 19:30:50.543',	NULL,	0,	0,	785362518),
(3,	6,	2,	'2025-10-12 13:28:14.162',	NULL,	0,	0,	114836481),
(4,	6,	12,	'2025-10-12 14:13:40.424',	'2025-10-12 14:16:10.121',	80,	1,	663919849),
(5,	13,	14,	'2025-10-13 12:36:11.754',	'2025-10-13 12:36:17.211',	100,	1,	730486052),
(6,	13,	12,	'2025-10-13 14:28:59.595',	'2025-10-13 14:29:04.985',	0,	0,	109050050),
(7,	13,	12,	'2025-10-13 14:29:04.991',	'2025-10-13 14:29:35.320',	50,	0,	471918624),
(8,	13,	12,	'2025-10-13 14:29:35.325',	'2025-10-13 14:29:41.818',	100,	1,	1563137423),
(9,	6,	6,	'2025-10-13 17:57:51.426',	'2025-10-13 17:57:58.354',	20,	0,	1031252281),
(10,	6,	6,	'2025-10-13 17:57:58.365',	NULL,	0,	0,	361749209);

DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quizId` int(11) NOT NULL,
  `text` text NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_questions_quizId_idx` (`quizId`),
  CONSTRAINT `quiz_questions_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_questions` (`id`, `quizId`, `text`, `order`) VALUES
(1,	2,	'Первый вопрос',	1),
(2,	2,	'Второй вопрос',	2),
(3,	3,	'Что за',	1),
(6,	1,	'Что?',	1),
(7,	5,	'Сллаосос',	1),
(8,	6,	'Первый вопрос',	1),
(9,	6,	'второй вопрос',	2),
(10,	6,	'Третий',	3),
(11,	6,	'я четвёртый',	4),
(12,	6,	'я пятый',	5),
(13,	8,	'Один вопрос',	1),
(14,	8,	'Второй вопрос для второго ответа',	2),
(15,	13,	'ВОпрос 1 ?',	1),
(16,	13,	'ВОпрос 2 ',	2);

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `jti` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `tokenHash` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`jti`),
  KEY `refresh_tokens_userId_idx` (`userId`),
  CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `refresh_tokens` (`jti`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `createdAt`) VALUES
('00df7187-df9b-4e73-87e1-8b31d28a07a3',	4,	'd93d68bcf4a6488372c0dc84e8060a7589316c09266bf23ae10339380edeb0f6',	'2025-11-09 18:31:53.690',	'2025-10-10 18:32:41.163',	'2025-10-10 18:31:53.695'),
('017fc201-3247-4ad9-bf55-ef1dd5a615ef',	4,	'472541d2261e9b414fc098c38008a87d19503df6cfede8da22d54111405cb227',	'2025-11-12 13:27:37.944',	NULL,	'2025-10-13 13:27:37.948'),
('01e6f50d-cbdc-4bfd-b2a2-37b038e5ca32',	1,	'69f5e01be4a6d98030717d1d82213049c6d87f57dab877ceafe92f50dcae3aad',	'2025-11-12 13:39:12.281',	'2025-10-13 13:39:17.063',	'2025-10-13 13:39:12.285'),
('02152a71-9a16-4575-a770-e65b7c7594a6',	6,	'1cf6896fbe5b07b5ba9e2230c93de46de8c5053be8baca12cf88ce9621f69832',	'2025-11-12 17:57:30.130',	NULL,	'2025-10-13 17:57:30.139'),
('035ed891-8634-452a-bdd0-6d370a78d554',	4,	'0b355ddc1da9a56b50c9099d76c47832a752ed3aecf176786cf7e4c41d12aa2e',	'2025-11-12 13:27:37.946',	'2025-10-13 13:27:38.142',	'2025-10-13 13:27:37.953'),
('03af389e-4cea-4f22-8548-005fcddfa1b2',	1,	'9e9f326847906395b5475f92fce276d7bec0c195dd2a70bb5e2ead6de92b5482',	'2025-11-09 23:04:45.238',	NULL,	'2025-10-10 23:04:45.242'),
('057d81de-c588-422d-aa8c-d038936a0c3e',	15,	'61e1c1abd82c572f93f5317a2f145d6b6b4952feb2c59b9884b28a43896bc3b3',	'2025-11-12 15:45:02.821',	'2025-10-13 15:45:03.191',	'2025-10-13 15:45:02.823'),
('05f813fd-9269-4110-8047-157870483291',	1,	'777d86e6a89ced2add5642af6fbea20eaebcf58654596163141a153b552a1197',	'2025-11-11 18:11:05.588',	NULL,	'2025-10-12 18:11:05.591'),
('063e36e5-4f75-4845-8bc8-4bed62dd27b8',	1,	'9e0cee953a9444f395a7bdd7f32b1357f36be7ebc987d2e060cc065de0d67e96',	'2025-11-09 18:21:52.001',	'2025-10-10 18:34:12.510',	'2025-10-10 18:21:52.004'),
('06a4cd1d-a837-44e3-be95-652a03941f4b',	2,	'4b6682549fdb9d835c3d23661fea02ac879b39b231f8595ab0ea52fe44358e34',	'2025-11-12 13:58:04.638',	NULL,	'2025-10-13 13:58:04.641'),
('07a0f824-167c-4055-aeee-1eeaa038192a',	2,	'7d7b0891a259a2c0e623e98306f2103df053541e6e4607bc5a9d9c26740768d7',	'2025-11-12 14:47:45.684',	NULL,	'2025-10-13 14:47:45.692'),
('0837ed2a-f735-41c5-a44c-142d9d921803',	4,	'6893ef95232455afed79cea0a5d44957a9707492241a41da4197a51aa1c57fd9',	'2025-11-08 17:55:41.435',	NULL,	'2025-10-09 17:55:41.439'),
('08434c6c-fee5-41bc-b4a2-6a8258656744',	4,	'b5f45b9f9cd68a2d95a97bb9b1410d88f8aa5b6bd70abcb60163b51566dd58a1',	'2025-11-08 17:43:27.446',	'2025-10-09 17:43:27.733',	'2025-10-09 17:43:27.449'),
('093cbb70-1e27-423f-8c06-f1a6e4faf274',	1,	'b6658f8400888f7ee719313d688082598a1db355b3b6c095bfe90a03c9dc3541',	'2025-11-09 16:30:07.235',	'2025-10-10 16:46:42.237',	'2025-10-10 16:30:07.239'),
('09918403-1966-4bed-a28b-852d313acf07',	4,	'f8299810a0228f8d2b4a205333d31f068c451572802a128082ede7acdc34302a',	'2025-11-08 18:38:19.985',	'2025-10-09 18:38:20.887',	'2025-10-09 18:38:19.987'),
('09b5ceba-4dde-4aaa-98bf-c8f20c911046',	1,	'8169b52ab782a0da5ae2b9933301a4b28da8beaa872228871377354a8f08ec65',	'2025-11-09 18:55:26.581',	NULL,	'2025-10-10 18:55:26.587'),
('0ac3ac88-f8ce-4ad1-8c12-4d12e7e5ca90',	2,	'd11676b8d8da45f6c6363ac55975a49f6b09d346bfaf9bf9d7b2a8ad80e1b42c',	'2025-11-09 17:15:16.989',	'2025-10-10 17:20:10.425',	'2025-10-10 17:15:16.993'),
('0ac8fd51-ad78-4da6-a544-d86795f41438',	3,	'f13d227de5929ffce56c113ea60abcf227841c45d6bea7cc5b9275bef293eaba',	'2025-11-12 12:21:40.690',	'2025-10-13 12:47:44.118',	'2025-10-13 12:21:40.692'),
('0ae791a5-55a1-4333-a11c-2a0846d41f99',	2,	'57fdfcb8c1a0447f687a1d64dac2dbe8b8d776de22e76d053af09f87aeb73b35',	'2025-11-11 13:37:54.589',	NULL,	'2025-10-12 13:37:54.593'),
('0ae86c11-ab0f-4482-beba-ec741f600574',	3,	'c90f7e2d108ca4144c82f6d85cb0ab77ba84f1ec9585258cba97481fcff37748',	'2025-11-12 12:20:18.555',	'2025-10-13 12:21:40.658',	'2025-10-13 12:20:18.561'),
('0b0206b2-46b8-49f4-ba2e-ae09d71db2b2',	9,	'd51a34d325956a8b3037d926977f9d5505c516a02eb3b595e7d2d2974292b701',	'2025-11-12 14:48:29.032',	NULL,	'2025-10-13 14:48:29.036'),
('0b05979a-b591-4b1e-8ece-ce22b559b6da',	12,	'2725b907fab906b724b5d23ff14136ca6578e4c4bd8f7b928711fb18c612a4e3',	'2025-11-12 14:16:08.722',	NULL,	'2025-10-13 14:16:08.727'),
('0b467ed4-0334-417a-889b-6e22f60f3a1c',	1,	'ea87f0fcd54e49278f78d33b849763e6e0b1f130fac2e08d37443707d1b71fe1',	'2025-11-09 19:07:13.966',	NULL,	'2025-10-10 19:07:13.968'),
('0b7b892e-47b7-4ed6-b878-b6731f03ac49',	1,	'f1227f942143638dd6bc9141d18067912782d62ae015a37b8fe862c6da9ddca1',	'2025-11-11 18:03:26.722',	NULL,	'2025-10-12 18:03:26.743'),
('0bb6e80d-c8bb-4ade-a427-492995031299',	6,	'f13f2b19c41d20ca83344c2d66070aae22092be2cae36afb359d7638c4c13e86',	'2025-11-08 19:13:46.715',	'2025-10-09 21:43:12.079',	'2025-10-09 19:13:46.719'),
('0c941bfb-521e-4b10-a91f-fd15142d76f7',	1,	'7d0a68657f728e9b99cf8c0195150a90e7c6e4b221d314a3af3e9b84895743a3',	'2025-11-09 18:47:57.153',	NULL,	'2025-10-10 18:47:57.155'),
('0d00cf45-cb5b-4775-b206-5a73b7574934',	16,	'2bec244f267000e8f6a7017343ab9c35a4c5f58de2a85e7da244ca528aa74145',	'2025-11-12 15:52:15.477',	'2025-10-13 16:06:09.916',	'2025-10-13 15:52:15.480'),
('0d16af71-c1e0-4b16-b156-c361aaf53d71',	17,	'33782b55a75abe123a7841a289af72aa57cc8056048779394febdb7987b1d6ac',	'2025-11-12 16:26:21.693',	'2025-10-13 16:26:38.617',	'2025-10-13 16:26:21.702'),
('0efc6368-6a3e-4e9a-b239-1f490acb2397',	5,	'6a1657195ee3e349d8958fb533c6fbac3de9f0e2a886bf9d8a6ecd2cf8702800',	'2025-11-08 18:09:10.161',	'2025-10-09 18:09:19.273',	'2025-10-09 18:09:10.164'),
('10d54ba2-1764-426a-804e-2c9a2eefd8d1',	1,	'089817fe08f22b031bf722b9237762e6dee02be5c36b9ad66f3b2c84f1946799',	'2025-11-09 21:56:48.591',	NULL,	'2025-10-10 21:56:48.596'),
('10ef847f-e0ba-4eae-89fd-8bdb108df750',	9,	'1f08759e0b3196da1d21aed0078ebd342dfbee83c28520e856eb4fdc092b2c48',	'2025-11-12 14:48:38.396',	'2025-10-13 14:49:12.831',	'2025-10-13 14:48:38.398'),
('11347ddb-fd78-4d8c-871c-a9d287c24595',	9,	'5556dbb617c51e52939b96e0784798313f339c05ef9d33239b798fdf7b3526d0',	'2025-11-12 14:48:07.772',	NULL,	'2025-10-13 14:48:07.777'),
('11c5f2ba-d364-4a90-8313-6f5b4fca629f',	1,	'3ea534cdb76d2bcaed2cd119e4e58a69acaa1ee3f837f93471fd1ecfa8ae4ec0',	'2025-11-09 23:02:02.142',	NULL,	'2025-10-10 23:02:02.146'),
('1256bd6d-3700-4435-9dbb-577db99ce543',	6,	'a36b0bfcd2f9e5d488cfb140aa468f4313ddf31b95aad77828ccde929e5a7a70',	'2025-11-08 18:10:12.583',	'2025-10-09 18:12:35.253',	'2025-10-09 18:10:12.586'),
('12cea2c9-f58c-4783-97db-38d411bf23e9',	1,	'e84f9b496061bb548c68231930c90f8b354123a01d07e58c57d7547355c3f9d2',	'2025-11-09 17:50:05.196',	NULL,	'2025-10-10 17:50:05.198'),
('144993c2-8438-4bf7-83ef-27642ab86182',	17,	'a4d35fb30a7c0386f09c5f984c5e3d0725d4145b7cad2fbfca689981b60723d6',	'2025-11-12 15:59:30.213',	'2025-10-13 16:06:07.011',	'2025-10-13 15:59:30.217'),
('148cc910-1818-452c-b899-873a9e054a66',	2,	'e3e930a3d05ab32f79499094a84d58d499ec20f95925606141010ff130a6a387',	'2025-11-09 17:20:10.425',	NULL,	'2025-10-10 17:20:10.428'),
('160c0db9-97c4-42a5-b8ff-ad19ff9adc6c',	5,	'793efe08ad2f0c7babd5186ba7638e824fca281ed89a08a31e3a856dac23b3cd',	'2025-11-12 13:27:51.569',	NULL,	'2025-10-13 13:27:51.572'),
('16110cdc-141a-4571-9c2b-69109fba20ef',	6,	'0f41b089118513484745c813a58880fcf27b07c076e578e87d20cef6e7adb4ce',	'2025-11-08 17:58:26.612',	'2025-10-09 18:00:16.557',	'2025-10-09 17:58:26.615'),
('17de6cb2-e8e5-4308-bb77-fbd60b805d0c',	6,	'd8932c4dcc9ec5e4d40367a45980786b03c6f29d109ed39cfbcef5ca3b9ace2a',	'2025-11-08 18:09:07.545',	'2025-10-09 18:10:12.584',	'2025-10-09 18:09:07.549'),
('1852b380-e6a0-4b05-9e68-c38552e1c596',	2,	'dba745827f1b1ad3c0167dd4c3cba98157c79f383cff86502922cd1222d11775',	'2025-11-11 13:40:27.783',	'2025-10-13 08:44:58.380',	'2025-10-12 13:40:27.789'),
('18b3850b-5269-4755-8b95-96cf4f3640f9',	1,	'71c99fe41edcd75359112a43fdec8e213210855bb2bce4db980646580bf25278',	'2025-11-09 17:31:48.594',	'2025-10-10 17:41:11.289',	'2025-10-10 17:31:48.600'),
('18c652a2-4821-41b6-abe6-db536944a1c5',	2,	'5b1c1a1a1fa4496cd7bc856e17807ced7b681ac53ea01c13629d59768bb48862',	'2025-11-09 17:44:16.352',	NULL,	'2025-10-10 17:44:16.356'),
('1938aec6-c749-4be1-a465-9ef87e6d03cb',	2,	'2aeb9a1c1b1d7f7f67b760ac6db9cd49b8dc5352c81cea0148c80e07b6d5e25e',	'2025-11-09 17:14:06.337',	'2025-10-10 17:14:56.128',	'2025-10-10 17:14:06.340'),
('19906719-2bf0-46f8-b941-30755ad87b0e',	12,	'b86751eb29c9074582744a8ee0d65130ce73f0fcadb820aa669c95c74eff244f',	'2025-11-11 14:00:51.905',	'2025-10-12 14:03:27.115',	'2025-10-12 14:00:51.907'),
('19b8a3c6-29a5-4ee4-a779-d2d07a1edb10',	3,	'dc3e35b8ff0e1e6dc131b6ef51d27d9a1a040c073e835e19ddab3db0ec24b045',	'2025-11-12 12:20:18.553',	NULL,	'2025-10-13 12:20:18.556'),
('19cd28cb-2d14-48c6-935c-75d02f974883',	4,	'b016b21811c6c8219aaa6cc4655e32cdc0e93c916629305d7d58a8812e456959',	'2025-11-08 17:44:08.809',	'2025-10-09 17:44:09.099',	'2025-10-09 17:44:08.812'),
('1a638141-ea44-4123-a5ed-6cbc2c434ec8',	2,	'db368a25cf401f558520045b0105ff716a588a8d89af62463f410d6a87feccc2',	'2025-11-11 13:40:27.777',	NULL,	'2025-10-12 13:40:27.781'),
('1a749f0a-ecc0-4cfd-9dad-6b5d1ad2dfac',	9,	'6aea8a3ace1e7af399a41eae17caa2835674bc338aebe51a64d01a741b108d63',	'2025-11-12 14:48:29.034',	'2025-10-13 14:48:38.328',	'2025-10-13 14:48:29.041'),
('1a9b793e-bc59-4164-8ea4-2940cea39d58',	9,	'c29216114ed754f002fe82df23cca417da7eb07f44625940c1ca24f5f4b8b271',	'2025-11-09 16:24:10.964',	NULL,	'2025-10-10 16:24:10.976'),
('1ab114ce-f1c7-4ae9-a317-0806a9f7748d',	5,	'35ac004ade8b2ecfac2f39e1a36a8ccc994d3975ac84eb64cc6db8220f9d3548',	'2025-11-08 18:16:19.101',	'2025-10-09 18:17:31.982',	'2025-10-09 18:16:19.104'),
('1d085118-528f-4bd1-90fb-bee23293d63d',	3,	'5ef1e57647ee4d96622f26ab814137f9e1cfad171442e1d1aeb613001e3b662a',	'2025-11-12 12:13:02.584',	NULL,	'2025-10-13 12:13:02.589'),
('1d65c9da-dc77-45fd-9f93-741ec3e745eb',	4,	'da616b727fbc9b32f3b4aab2950ca509083ae2e5db211d854bc7a84404cb29ec',	'2025-11-09 18:31:53.691',	NULL,	'2025-10-10 18:31:53.693'),
('1dac9e5f-cd92-4a8a-839e-46ec00acf941',	2,	'74f1afbf9045817874d85ce11f022880487e4a3f0c2693f50caea03ca9af4a04',	'2025-11-12 14:47:45.763',	'2025-10-13 15:37:50.129',	'2025-10-13 14:47:45.765'),
('1e6f304c-38e0-4bea-bd26-1ff076ffe63f',	5,	'4efdb470b3ba550fd9911ae03e8d42127510857642b77dc3ec7e4d11e79d652e',	'2025-11-08 18:34:17.669',	NULL,	'2025-10-09 18:34:17.672'),
('1eb35a9c-2c75-4cfb-a99c-d7aef07abe3a',	6,	'adafa1fe4c3bd8126e132ab0a85de685915c0f9830ebe3e6b945eb9f88846356',	'2025-11-08 19:13:46.350',	'2025-10-09 19:13:46.716',	'2025-10-09 19:13:46.352'),
('1f196a85-bd8c-4473-9476-35d4f332a822',	1,	'fa754990f1f6f86abcb812b8c700b33967370cb10231b1577028cebb7d610b6a',	'2025-11-12 12:32:38.686',	NULL,	'2025-10-13 12:32:38.692'),
('1fd8366f-758e-4abc-88b1-a8b5fa34890e',	1,	'839e1298113fe4daa189eceea7e1a2dda76d150a8a86919766eab943ca8ce33c',	'2025-11-11 11:33:13.096',	'2025-10-12 18:03:26.735',	'2025-10-12 11:33:13.099'),
('2049b885-9bdd-40ca-8d89-45749c76b960',	3,	'7e93b5c31a310a8d2b3c9c0c560cecfb0f32794a1864cf89ef1c34e5c5dae8e9',	'2025-11-12 08:10:07.162',	'2025-10-13 08:12:09.891',	'2025-10-13 08:10:07.181'),
('204aed40-f246-42a9-92b2-5e971bfd16e6',	1,	'2bbee91edda9c4a1f066fc62628c955237bed8b313c1337de067f1c09371017a',	'2025-11-08 17:20:02.738',	'2025-10-09 17:30:32.775',	'2025-10-09 17:20:02.741'),
('2142a66c-86f8-457e-a75c-00481d21063f',	4,	'eb33e01891af0a2cf777a8a2ea73cfd49bb9ffc73a41015c6e160a11ef2744a1',	'2025-11-09 18:29:44.405',	'2025-10-10 18:31:15.620',	'2025-10-10 18:29:44.414'),
('217b9d3c-f6f8-4f7d-81bc-1fe286b95df4',	2,	'f65e43f1e980a7554e1f5a8f21e0d52ed8dedaa7ec10c4785cd06741131c0ad9',	'2025-11-12 14:06:53.522',	NULL,	'2025-10-13 14:06:53.526'),
('221e3a7a-a9b6-4fc4-8eeb-4ef1f90c4b2a',	12,	'090adda734b59921689ad72e69cc0b29f0051fac4f279a1cc0c43139a2208762',	'2025-11-12 14:28:48.935',	'2025-10-13 14:29:21.992',	'2025-10-13 14:28:48.937'),
('224875e6-6bce-45b7-8549-12b180f10ce7',	15,	'8e457c6193a83983fe2a32aa78f453157e345f37753da1651ef7518aebe1b334',	'2025-11-12 15:45:03.190',	NULL,	'2025-10-13 15:45:03.197'),
('226ed5fd-f351-4ff4-8ea9-c326b3c1e20e',	6,	'01a2ae64a00cd0e21f09eca0e978b783a125e6dd2a55e1219b2ecd82d5e8d42f',	'2025-11-08 18:27:20.864',	'2025-10-09 18:33:51.683',	'2025-10-09 18:27:20.867'),
('22a8dbfa-1ce4-4a97-b8ba-ad9f118bf338',	3,	'a9a5e239923eb08a2e9f42d33e8f37e4cc5c13a07cb80e0af92074958da3374b',	'2025-11-12 09:11:40.229',	NULL,	'2025-10-13 09:11:40.232'),
('240ab53b-09ff-45b3-aa82-cba0abb78d27',	9,	'736bc6a68eaef5e59d8f54e3213d461eb2a1b20dc6af24d4ed040afcf81387b3',	'2025-11-12 13:37:47.734',	'2025-10-13 13:37:47.885',	'2025-10-13 13:37:47.736'),
('2448b3a6-b41f-4f68-b6f4-ba06873673cd',	6,	'1aed510bda2e516b864cffa65bb99022922b882ba52b07ea3a79f1c33e8a111c',	'2025-11-08 18:12:35.251',	'2025-10-09 18:17:29.193',	'2025-10-09 18:12:35.255'),
('25a70831-a04a-4d87-a9f2-236c7f8718c2',	1,	'08c5f9f6953e713443cc0f2cb5043b07b1f1db0b85631095a1ffcb969a52fc28',	'2025-11-09 18:48:36.784',	'2025-10-10 18:48:59.851',	'2025-10-10 18:48:36.788'),
('26586139-8d2e-4497-bf0d-2867aa08ab3a',	3,	'cd5a13a800969acfc87a51ae739b72b90d36394bd13e46cbcf26c346c0153231',	'2025-11-12 09:07:15.329',	NULL,	'2025-10-13 09:07:15.331'),
('27b9c001-5afe-4ea4-99c4-a05c00e95aec',	12,	'73dfb4a78fc7e7a7f9b3ea0355642a4a1a18acf4e56fa2c16d5dea746e2a114c',	'2025-11-11 14:16:21.235',	'2025-10-12 14:18:33.741',	'2025-10-12 14:16:21.237'),
('290b4866-6fe6-491f-ae83-1fcf27a4d34e',	12,	'f97c29b71863e908508113dab255ccc000a1c2d3625da1aebd65def527fc9d44',	'2025-11-11 14:32:25.653',	'2025-10-12 14:33:45.791',	'2025-10-12 14:32:25.655'),
('29746646-8064-46de-b3a8-5d2d9994ed56',	1,	'18f0c40410b48993f11ab0bf685e912aefedac932546b28f25a116ea1e60f94f',	'2025-11-09 19:07:07.927',	'2025-10-10 19:07:13.969',	'2025-10-10 19:07:07.932'),
('2a6e4848-57b7-42ca-82eb-20d2567b75dd',	1,	'9d3e1915e9c85c449f8a440179451f3c1d4bc451f8328b6283f0c4b3fc44916a',	'2025-11-09 16:59:33.590',	NULL,	'2025-10-10 16:59:33.592'),
('2aa48092-b6da-449a-9649-ca8b84a0ae4f',	1,	'5dd9ddc41798ce56eed4af57e1709627eaa1276af8ed8d73a4ee79dca80cb128',	'2025-11-12 12:34:59.902',	'2025-10-13 16:26:55.682',	'2025-10-13 12:34:59.909'),
('2aa54159-69e5-4fac-b67b-0dc36df05384',	6,	'ee8aa3df2486e4a12fcdc0cf200763a657d409e68608d4112b030fbc39ee7528',	'2025-11-08 18:26:53.149',	'2025-10-09 18:27:20.865',	'2025-10-09 18:26:53.153'),
('2b0fb105-8cbc-4737-b74c-fa52f095038d',	1,	'96608f87b57628cffd4ed249c0bc3f3055a4cd8fa623e558555a5c8867b42027',	'2025-11-10 01:15:39.463',	NULL,	'2025-10-11 01:15:39.465'),
('2b8ee002-9df1-4ca1-86d4-57d56b97fa7a',	1,	'b44fff34a4fda49e6ea680097145c7530d1d18615f59df199b3bb48dcd743c8d',	'2025-11-09 18:48:13.474',	'2025-10-10 18:48:16.260',	'2025-10-10 18:48:13.478'),
('2bc378cb-021d-4e9f-ba8b-55b360bf61cd',	1,	'26fdcae0a8ffb6158e9d6c55e50333869bd336cbf75ea33283b2c893a586e63e',	'2025-11-09 18:21:35.982',	NULL,	'2025-10-10 18:21:35.984'),
('2c010a95-9e6a-4b9f-82d7-64864b7666a6',	12,	'99f516c962067d0aa9fe4a6b4128a04f4576ef24e05692f255cf104e1984046d',	'2025-11-12 14:20:12.595',	'2025-10-13 14:28:48.863',	'2025-10-13 14:20:12.600'),
('2c691471-f9cd-4fb5-9d02-6c18db3e348b',	1,	'7d0af605bd2aede797c6fb0c41522aa5697ba0199b81a41aa599b68ca66e76a5',	'2025-11-09 22:41:54.278',	NULL,	'2025-10-10 22:41:54.281'),
('2ce252d9-4cf8-492e-a677-94bc5891f942',	1,	'b02f6ebb259dd2b5abc44540e56ee625b355b621f777cb63084d430e458185ff',	'2025-11-09 19:19:26.508',	NULL,	'2025-10-10 19:19:26.510'),
('2d3d8562-2a5d-4d53-8468-6b4f41e37229',	4,	'a795b34f30f0c5fd8eaa3f32133f78a9adefff18537335f79799d65bc1a1d92d',	'2025-11-09 18:31:15.614',	NULL,	'2025-10-10 18:31:15.619'),
('2d70332d-5b78-412c-b020-a44a19a2a9bb',	2,	'8d9386244ea3116c463031357a1f7fa20ce62369d1cd982afdfd1dcf8f6d18af',	'2025-11-09 17:15:16.986',	NULL,	'2025-10-10 17:15:16.988'),
('2dcdd90a-f257-4cd9-b784-9dc0d54c9da8',	12,	'b28b463133c7767e48aca2c65f6615b5c754782f4a0c7318f06650ed9ee6ab6e',	'2025-11-11 13:47:04.910',	'2025-10-12 13:53:30.768',	'2025-10-12 13:47:04.913'),
('2de335a4-01cb-4c82-9bfa-ce1668824c95',	12,	'33c84e762e86642d58551fa8835f15de6aedea22c9ed42ab7a875b7e8169b7ab',	'2025-11-11 14:03:27.527',	'2025-10-12 14:04:48.864',	'2025-10-12 14:03:27.545'),
('2e5a9e93-1f80-4518-b0d0-67c122943d64',	1,	'2087155c7339fa8f12e2ad317f8c3701bec23cca815af88ce6ef263826d08174',	'2025-11-09 16:29:20.984',	'2025-10-10 16:30:07.237',	'2025-10-10 16:29:20.989'),
('2ed652d6-bbe7-4484-adc9-fcfda7050334',	5,	'abe7d4553e4e567c71be0d7faf10e00fdc52e913c83b5a5a7959659f2ae45b2b',	'2025-11-08 18:24:42.506',	'2025-10-09 18:34:17.670',	'2025-10-09 18:24:42.510'),
('2f9967e2-297e-4fdb-bc5b-713eae7d09a9',	9,	'f3751982ed985398847d682155f00cc2c91147ec8d124113d03db21505141389',	'2025-11-12 14:50:12.191',	'2025-10-13 14:50:15.452',	'2025-10-13 14:50:12.193'),
('2fab5557-fbc1-460e-8d20-4cd09425da8d',	6,	'5923b2fe387004aa7c33ee89d9a6e9c52ea09bf7ea204af3ccafe18a9fccfa90',	'2025-11-08 18:00:16.556',	'2025-10-09 18:09:07.546',	'2025-10-09 18:00:16.559'),
('30ae93c6-38e4-4bd1-bede-0fcd9d0b05b5',	1,	'26d6d6cf58a31f7194804e3445693ca2b4d12235e7fe350c4ffe3be9f18e9ca2',	'2025-11-09 19:07:27.429',	NULL,	'2025-10-10 19:07:27.432'),
('316b8558-3c41-487e-85cc-fd8e0f3e7b9d',	2,	'43dbfb35389d70b1ba742db949fa308843ddf631ee845c644a74cb96ea517a07',	'2025-11-12 15:39:20.925',	NULL,	'2025-10-13 15:39:20.932'),
('31aad902-4a53-430e-8251-ead9a68a7401',	1,	'e73e06a468d261c9cb8ae478f462c38e62a90fd6c8b7bfe34fbd9c5b945e69ab',	'2025-11-09 18:21:47.455',	'2025-10-10 18:21:52.002',	'2025-10-10 18:21:47.459'),
('3253be49-e9ac-4a0a-ab85-d3dc7385bc9e',	12,	'14e7d90104cc65ffa02e7fd5fac24409e35053da56ccdf37214af6df16988081',	'2025-11-12 14:09:47.511',	NULL,	'2025-10-13 14:09:47.515'),
('3269cdd3-57bf-4842-9767-33d832be1e80',	4,	'2b7cffded532c49d0fb79ee55dd624e609eb45ddd9c55d00b7b3291b98f630eb',	'2025-11-09 18:29:44.397',	NULL,	'2025-10-10 18:29:44.406'),
('339fee0c-2abb-4717-98ab-124db0814883',	1,	'6bcf6e93c158baf00bcaf5e6bcdb6f610e65b4a4d56170dc7bd3570cb3e1f293',	'2025-11-09 18:48:16.260',	'2025-10-10 18:48:36.785',	'2025-10-10 18:48:16.263'),
('35b11810-840a-4748-bc68-74b8eb8db50e',	1,	'd4239d870892c0ba9098965d8dd64f564dcf797a395d5bf686c51427f5430461',	'2025-11-08 18:17:46.645',	'2025-10-09 18:28:58.573',	'2025-10-09 18:17:46.648'),
('37ab63fa-73b0-4d23-88f5-24559efa282a',	1,	'5108bc6efbd874c01f5ad831e78a515d9db0d5cede740b2085092cb9b596447d',	'2025-11-12 13:26:05.536',	'2025-10-13 13:39:12.282',	'2025-10-13 13:26:05.558'),
('37f7cd1d-9753-4371-bc5f-0ad19972bd0e',	9,	'8ee9231224a3270eebbe0ab1cd96d1b08fff502db7d712fc5240112bf1fae694',	'2025-11-09 16:20:00.097',	'2025-10-10 16:24:10.966',	'2025-10-10 16:20:00.099'),
('397dff8b-7203-44a2-855f-09c23791fd69',	1,	'4f003166b88f197d848d3c7052603c5286e0989f9b218dbe976e1a46ddfd4b85',	'2025-11-09 16:09:19.227',	NULL,	'2025-10-10 16:09:19.231'),
('39a287b3-6b8d-46df-9352-8424ac2bb860',	3,	'c644332675cac30bb91400b8230cda54219701ce7916adac4e26c456f68de9e7',	'2025-11-12 08:12:09.860',	NULL,	'2025-10-13 08:12:09.875'),
('39c22a1c-7794-44e6-9eda-4e74233cb929',	3,	'd9cfdab571d30aee5f3d32971146ce0e32de05e19ab7c18b99297164a721c707',	'2025-11-12 12:13:02.583',	'2025-10-13 12:19:56.692',	'2025-10-13 12:13:02.592'),
('3a1ef2bc-122b-465e-9520-fd2226c67d5f',	5,	'a0da59afee88959acd18aa28b0191a5f02763897a0e42a8ba329d3c583dd0705',	'2025-11-08 18:09:19.273',	'2025-10-09 18:10:13.612',	'2025-10-09 18:09:19.276'),
('3a388fd5-0814-467d-b300-a8e2020dbcc5',	2,	'a0570d15e168c02c04f92974399119220c0e96eb99350d6a37eaab8415115d2e',	'2025-11-09 16:36:23.153',	'2025-10-10 17:14:06.266',	'2025-10-10 16:36:23.160'),
('3a528eec-f848-4a09-b05c-d03fb58344bc',	2,	'7b28c360a76da7caae858d8ceb61342f2ac32ff26f32aa3a24f2247815cdd9d6',	'2025-11-09 17:14:56.202',	'2025-10-10 17:15:16.990',	'2025-10-10 17:14:56.204'),
('3a5caa38-88bd-479a-b520-17377f18c07d',	2,	'5926f7b2a4098666d1d54f7091170b603216bee04134b92a7842b7bd63591ef1',	'2025-11-09 17:14:56.127',	NULL,	'2025-10-10 17:14:56.135'),
('3b1812b6-8912-4b46-abd6-414babd8dd37',	5,	'388fbc74a7fe5bb3c3bf56f45bfaf5b663712fba24ea9d85d030e85599dd3d6e',	'2025-11-08 17:58:34.909',	'2025-10-09 18:00:19.147',	'2025-10-09 17:58:34.912'),
('3bb18884-3f15-4cd6-aa89-723f6c8cc574',	12,	'1905c8c4cb3c1ac1901893e43d71ee35e1b7b32d5560964934681beaee6a2488',	'2025-11-11 14:13:38.668',	'2025-10-12 14:16:21.164',	'2025-10-12 14:13:38.670'),
('3bb910aa-7b6c-41f3-9c47-0166ed988cf7',	1,	'0cb025ea366787c17598fec1743d9c14544b57795405268138a2269216582d24',	'2025-11-12 16:50:07.310',	'2025-10-13 17:05:53.397',	'2025-10-13 16:50:07.314'),
('3bc49cf7-58cf-439b-a4ab-a5fdce96bb6d',	4,	'd3ae643e8d13c97d0e80540ec2ebe9f0a4662956996929727ab4a107f5efe29b',	'2025-11-09 16:13:47.743',	NULL,	'2025-10-10 16:13:47.745'),
('3bfb5b88-9420-4836-abe0-881a70e8d46c',	1,	'425fab1499b3e8ce20c22d59eb6ac5704f0768f4c7051f9abb31891ff5b073ec',	'2025-11-09 18:48:36.782',	NULL,	'2025-10-10 18:48:36.784'),
('3d75a31e-5ce6-4390-8c48-455f6f42c512',	12,	'9c1d179aa43b5b5cf3aa96c6db08dfe81c12240ea16cffcabb0b5ddae96db5f7',	'2025-11-11 13:59:41.305',	'2025-10-12 14:00:51.836',	'2025-10-12 13:59:41.307'),
('3e500d39-f215-45d0-b5c4-d1e38887cfc8',	4,	'f765678550b75f604b44ea699571189d533cb72b76c051bef24f3e2171626233',	'2025-11-09 18:26:39.195',	'2025-10-10 18:27:50.054',	'2025-10-10 18:26:39.208'),
('3eaf168e-16d1-46d5-837b-62e15b51796e',	17,	'e74fa9dd0fe03aa3bdef74c07ff0d4ac6ae65a3d1de3988fdb5b971fac95cd76',	'2025-11-12 17:37:59.572',	'2025-10-13 17:39:14.815',	'2025-10-13 17:37:59.579'),
('3eb30e87-ad43-429c-87f3-aeb73c8d658c',	2,	'147216665f248bfbb649853a29a55ac5f7722017d9176c1e83ea6e241ef6da97',	'2025-11-12 13:48:01.674',	NULL,	'2025-10-13 13:48:01.685'),
('3f4a89b6-31dc-4a99-8df9-064e1fdd1f18',	1,	'3a384eadeb2700737a21dae7926d7b7cfd96c51be0c81edad06165a68b5fc87c',	'2025-11-09 16:30:07.233',	NULL,	'2025-10-10 16:30:07.235'),
('3fddeb9d-508d-4415-8b5d-bb8e967b17c0',	2,	'4b2b936800781cde4b693a071c060dd6fb17fe2adc7fdaccd318268ee9cf6756',	'2025-11-11 13:34:09.201',	'2025-10-12 13:37:54.590',	'2025-10-12 13:34:09.207'),
('3fe335b9-c295-477a-91d3-9c2933222b89',	3,	'36966f1e2bee16a6e2aedb908abaa9e7be37c133cc008d251520eb3ad631b440',	'2025-11-12 09:07:15.333',	'2025-10-13 09:11:40.236',	'2025-10-13 09:07:15.339'),
('4002aabb-265e-45bb-bba9-43d940b61033',	1,	'dc46b54c99efc091fa71767fc714939c91bc825b19ddd3498c10ec7a3de7ead0',	'2025-11-09 19:07:18.163',	'2025-10-10 19:07:27.430',	'2025-10-10 19:07:18.165'),
('40f79b91-9e44-40e5-a18e-6f4c10e3de9c',	12,	'c9a747345f1eccf9ddff0d47e75c1c09ec82478f326306d0229ba874fb945317',	'2025-11-12 14:28:48.862',	NULL,	'2025-10-13 14:28:48.866'),
('410d0c6f-be3e-45cd-9027-f81a2b27a182',	1,	'de283016e9b73a839270c89bfe478598d1bf1a0880d6e9ea79690b17c874b2b5',	'2025-11-09 18:49:32.563',	NULL,	'2025-10-10 18:49:32.565'),
('4112f0ee-f598-4b64-ace9-3a66bedeacdb',	12,	'1d609230ab8449596815440f68b7dc3f6bdc5bc6cdc8d511323f1856194a8059',	'2025-11-11 14:08:52.548',	NULL,	'2025-10-12 14:08:52.552'),
('4167c08d-61c2-403a-92d5-c39566179c4f',	4,	'dc0b58972ed96d515f46bef04177f84081526a0af2f9d755cbfa8c046fd44a71',	'2025-11-08 19:12:30.852',	NULL,	'2025-10-09 19:12:30.855'),
('42107600-98d1-4f0e-9a17-bd52ce9fd832',	2,	'8175f6470266b2f1b2e9192205ec682ed44b45a81430f65383b414b359faa7ec',	'2025-11-09 16:31:51.621',	NULL,	'2025-10-10 16:31:51.628'),
('429cfa9c-5937-44fd-ab2f-2118f16839ab',	2,	'5a478866f9bc4adb8df7ac81dcf706a5316c601085bb0f6169d1a36532629544',	'2025-11-10 01:20:36.946',	NULL,	'2025-10-11 01:20:36.949'),
('42d40cef-7803-4b41-96e4-5eeeb6dda4eb',	2,	'1de03566b1b57e6cb0e0e5098f86bbe60828db0c7f77a6ecad9c391d90f924d9',	'2025-11-12 14:46:56.652',	'2025-10-13 14:47:45.689',	'2025-10-13 14:46:56.653'),
('446ea7e0-bfaf-4e3a-8e3d-6b11b1f4c7e4',	2,	'b8bc0ca343271ed92889f84d08c4be8651d34b735799ffd584b4899b44f4a16a',	'2025-11-09 17:20:10.496',	'2025-10-10 17:21:06.855',	'2025-10-10 17:20:10.498'),
('44b95bed-9654-42a7-8796-dc9bb713d6ab',	1,	'03b4b67ba983ab6fba965686050cc6954f5a2276257523354f0d0b05694e7f7d',	'2025-11-09 16:29:10.440',	NULL,	'2025-10-10 16:29:10.443'),
('46763856-b309-459e-b143-6927c1092d6b',	1,	'fccb936e4087ba125680f8be8c262e05bc148534da53c3da9d21deb43a877af5',	'2025-11-09 18:21:47.454',	NULL,	'2025-10-10 18:21:47.456'),
('47226904-62c4-439e-87e3-463f0ec552c2',	9,	'77d0f657cf56f5044523d95bcbcf69a0c97f390c014130ced2dd63a76ff903ea',	'2025-11-12 15:39:29.049',	NULL,	'2025-10-13 15:39:29.053'),
('47613e16-b9f4-450e-81a0-42dd78a2e5db',	1,	'20245c45bc8ca40bff6f0da6e0d467a78cd28fd6b10b6afce70d1026c82fa7d3',	'2025-11-09 18:34:17.746',	NULL,	'2025-10-10 18:34:17.748'),
('479aafca-ddda-4e4a-97bd-acb9baf19904',	1,	'0ddac58b272327c05a7cf3a45dfad2bb3a0153bd449e917f500586540bc69388',	'2025-11-09 18:34:12.507',	NULL,	'2025-10-10 18:34:12.509'),
('48409a60-2eb9-4762-9588-628aef7a1244',	1,	'9f38d7f0d661e96549f07697f6f514e40fe2334fd8a1e765cb5eac506ed6db4a',	'2025-11-09 15:13:21.378',	'2025-10-10 15:14:51.830',	'2025-10-10 15:13:21.382'),
('48770125-f142-42ea-8455-16a751cbef0e',	7,	'fefb59585cbded092a04991fb75ae757afba7c5ebf0cca4d348e590b07cd7611',	'2025-11-09 10:39:25.355',	NULL,	'2025-10-10 10:39:25.359'),
('4b4474c1-447f-4daa-957c-c328b8b49c7a',	1,	'f16a1ca22839ea19f0ea44d97fde5cbbfc33ce42bd547ffc6eb83a0c1982bee4',	'2025-11-09 19:07:27.429',	'2025-10-10 19:07:36.226',	'2025-10-10 19:07:27.431'),
('4c486e91-02fa-41cf-93e4-7a1853df7966',	5,	'e48137e3286fbc7ac97c7e72a7f2a3903cf8c42b75ddb8602343bef53cf5fc8d',	'2025-11-09 19:30:48.592',	'2025-10-13 17:46:14.331',	'2025-10-10 19:30:48.598'),
('4d1c273f-a14b-4d69-8807-f2b999bd2a03',	2,	'f33cacc7f6aa20cbb68d4c977b05958b54a3aed85a54af2ca5b1bc6c03a7b168',	'2025-11-12 09:14:16.361',	'2025-10-13 13:44:13.123',	'2025-10-13 09:14:16.362'),
('4d502627-4bbe-4975-9236-33cfe9672bce',	4,	'e505a9cadfb5db98e180479f3ed4d2daecc7495b0ca486ed0bfaabcadc9a2d5f',	'2025-11-08 17:44:50.108',	'2025-10-09 17:44:50.396',	'2025-10-09 17:44:50.110'),
('4dfc67b8-c197-4301-97a1-115e7de73937',	1,	'8133e99bc25f097b7b1c138929d190f68858b2eb5a7353d6576278ee2f6a2fc0',	'2025-11-09 17:41:16.201',	'2025-10-10 17:41:43.186',	'2025-10-10 17:41:16.210'),
('4e54e9aa-0c8a-4c8f-b1bc-6aaeecc02c7b',	1,	'fd3374d8f95032d4f8e3a6fad180f565bc74251c24542bf901301a6b8060bcac',	'2025-11-09 18:34:17.748',	'2025-10-10 18:47:51.411',	'2025-10-10 18:34:17.752'),
('4f32983a-5368-4a28-8a77-d06f2813e317',	4,	'd6469a35ad070561d406e6c9a081b44cd23934e63c6b9c797c0e5fee02899526',	'2025-11-09 18:27:50.053',	'2025-10-10 18:29:44.406',	'2025-10-10 18:27:50.061'),
('521130b2-353c-4f9a-a35a-33c785592965',	1,	'd6740381dd4f0349ba99ba5e931bf2abb36b5a662410e3210c77c4ca08c97f84',	'2025-11-12 13:25:47.754',	NULL,	'2025-10-13 13:25:47.759'),
('535b4d34-53f0-43ac-9f42-cf64a0333b0b',	2,	'bbaa5640a9c864dd53631755eccd6f738ecfd2c3b5bc481db3edd54df1d79d28',	'2025-11-12 09:14:16.273',	NULL,	'2025-10-13 09:14:16.277'),
('53790aa6-c10e-497f-bd2d-74bb430967f6',	5,	'6d358772152c66bce19c7cb7c92e3954a7966c3177774e6f6e9e773094470560',	'2025-11-12 13:27:51.568',	'2025-10-13 13:40:12.447',	'2025-10-13 13:27:51.577'),
('5383b12c-e2a0-4d3c-ad19-9bbadb46abbf',	1,	'1074e26b72142c5918a76afd0445567783f557118e7bbafa3f76d651b7ad7ef3',	'2025-11-12 18:01:36.331',	NULL,	'2025-10-13 18:01:36.346'),
('53cc7464-1763-4f7d-ab66-a510e99c6ac8',	2,	'2bdad4392e048d0cfa6b05e048a5b5fd2207194b31b51e931434005f0ab553e2',	'2025-11-09 16:28:28.131',	'2025-10-10 16:31:51.622',	'2025-10-10 16:28:28.133'),
('53d870c1-4b4a-4812-932a-5046defe1e90',	4,	'e1c45c039b6db113dcf52c1f2afb8b8abe57e57f23c9ad181a33ffb9126bfeee',	'2025-11-08 18:14:33.345',	'2025-10-09 19:12:25.697',	'2025-10-09 18:14:33.349'),
('53f4788a-fc15-4efe-883d-adb1cbeb389d',	2,	'4408777940472e09c255e3d88aa6d40f6526f12de02f3e5c274f46dbd00e9e49',	'2025-11-09 19:25:25.718',	'2025-10-10 19:30:18.725',	'2025-10-10 19:25:25.720'),
('542f7ab4-13e8-409e-9d2c-d68e1a7cfd5f',	2,	'99ee624b7c145a1a7b784a26fe4602861b0d1de93b49e502a9c17bdfddfff3f7',	'2025-11-12 09:04:43.421',	NULL,	'2025-10-13 09:04:43.428'),
('543e9ac0-2cb1-4313-ba89-0e4aea5b0729',	6,	'c1ff8321f38056dc67091d7595983e4a89c8f4d0bdaf7afbf33bce164558e76f',	'2025-11-12 17:50:39.157',	'2025-10-13 17:52:35.391',	'2025-10-13 17:50:39.174'),
('543ff4b7-56c3-4421-bc05-bef3ea4104a9',	12,	'1ef8319dbe7e75895a59572b47c0f26e4d355848e12916aedab369cf0c428d47',	'2025-11-11 14:00:51.835',	NULL,	'2025-10-12 14:00:51.839'),
('54af782f-4b86-4621-ad13-4b428760272d',	2,	'f03b67b8fc438a4f3ce7e0b4574cee75ed5a53f2b85ef5f35c33149aba7d329c',	'2025-11-12 14:46:56.571',	NULL,	'2025-10-13 14:46:56.575'),
('55389933-c8ec-4767-b0e3-8ac789d76218',	5,	'8ce9bfbcd045dd98e4f82afa404e1bc11672385fc2e94aca0922afab1f7d1e3e',	'2025-11-09 19:30:48.590',	NULL,	'2025-10-10 19:30:48.592'),
('562492a9-8aa3-4265-a918-b955876f1d3a',	1,	'1a6e1b8229e978f873017bcaea7a749e766bfbc03e306f1f637abd205275ca52',	'2025-11-12 17:38:02.274',	'2025-10-13 18:01:08.396',	'2025-10-13 17:38:02.278'),
('5632a2e7-b699-4695-ab3e-190f9f8e8061',	1,	'7d90e180a7bd23e6afee0079ddef5553e054bf5382ab8149265aba887b589d7d',	'2025-11-09 18:47:57.152',	'2025-10-10 18:48:13.475',	'2025-10-10 18:47:57.158'),
('566773be-cfb9-421a-adbd-ce1b562d59ef',	1,	'04db93d5b9efc664516a5ace42bd7cdad0b8612fefad139454fc4da2e1bea525',	'2025-11-12 13:42:27.849',	'2025-10-13 15:39:59.583',	'2025-10-13 13:42:27.855'),
('56c1f10c-302e-4324-9fca-49228f475480',	1,	'4559d2113422a2efb5758c2df0b3e5b5474fb3c6e6a16f6d25b747e7487b6a3e',	'2025-11-08 17:30:32.774',	'2025-10-09 17:44:39.133',	'2025-10-09 17:30:32.778'),
('56d77703-a8b1-4662-a75c-654722390c06',	4,	'c52c9efe5019aa75357239c24034db98eda616af078405504a8deb1a1c6f9723',	'2025-11-08 17:56:59.635',	'2025-10-09 18:09:04.848',	'2025-10-09 17:56:59.638'),
('580df84a-3da8-4237-9809-4d25dc21ecff',	1,	'e4817453dc07ceef4dc4099d82b66a9c7660e97770426eb413a3fcbec27734bd',	'2025-11-09 19:07:18.163',	NULL,	'2025-10-10 19:07:18.166'),
('588931da-f699-44a1-ab71-6389cf2125cf',	1,	'f2401aa2d1023bf68a166a0486d39e7b2de1c15c67c37b8c970f1bc4034ec261',	'2025-11-09 18:49:04.476',	NULL,	'2025-10-10 18:49:04.477'),
('59a8b8a3-6fd7-49fe-a132-3a764e9b0765',	1,	'f4053a2e84a9774b9b7529efa86bb9ab631a2d9ee9791510c8a2ff703055a603',	'2025-11-10 01:09:38.317',	NULL,	'2025-10-11 01:09:38.320'),
('5ba0b4df-fa5f-4363-be27-87ffb927ad53',	1,	'4c2d9699e1713e172bd74eca20adf66ec9d02c3d4a2d00deb65937c53218d8f7',	'2025-11-09 17:41:11.277',	NULL,	'2025-10-10 17:41:11.286'),
('5c0c7aa3-7864-4dd1-9d1b-d4c118fdcd52',	12,	'5ea282f9e8cb387e8734f7beabda8598dd46b2c442cfe7991f84d6eefb0ded27',	'2025-11-12 14:16:08.793',	'2025-10-13 14:19:16.303',	'2025-10-13 14:16:08.795'),
('5c859848-3522-4f93-87b6-4edfd96fe9b3',	1,	'e13fd863342fa5dc02e810b33745fcb00b34ee5fae68a1e715d2f66674cf26bf',	'2025-11-09 19:07:07.927',	NULL,	'2025-10-10 19:07:07.929'),
('5d1f4016-5c74-4d41-a68d-27e46c69e4fc',	1,	'f72ded490125bd4b8606fc3d23beaad934579aa7f3d6a16d50016d141e391a55',	'2025-11-12 13:25:47.757',	'2025-10-13 13:26:05.544',	'2025-10-13 13:25:47.766'),
('5ddb97ba-8fac-42fb-9e12-175aab57c6f5',	2,	'f974eb380593d49ca488f68225d32e321d4ef0298713f4c458c57dea1d859bfb',	'2025-11-12 09:04:43.425',	'2025-10-13 09:05:43.607',	'2025-10-13 09:04:43.430'),
('5e17753f-0a57-4169-8e47-604fd7a89cbe',	12,	'45aa99660639d0464697b8fd7f0380f3cabbf940a1c437db0989f2ef559571d3',	'2025-11-11 14:18:33.740',	NULL,	'2025-10-12 14:18:33.745'),
('5ee3ebf1-bd81-4b1b-9095-7ba16c7ad148',	1,	'b0c81990e865d54ca713837c92548644e52f23dce69d286c53327a3363389956',	'2025-11-09 19:03:33.560',	'2025-10-10 19:03:47.082',	'2025-10-10 19:03:33.563'),
('5efdff2e-103f-4293-b657-b5ec12d3d1f2',	3,	'325fd69e37bc368a561d5bf429c735af9b4d8b7546cc6606b04d886ac65e8f78',	'2025-11-12 12:19:56.681',	NULL,	'2025-10-13 12:19:56.687'),
('5fb6c6c5-8015-4cb7-abca-c55949234389',	1,	'1501aac92b5a3d835c168197fb22cad4d0c146205e314cf9a982dae5b191e2dc',	'2025-11-09 16:46:42.236',	'2025-10-10 16:59:33.594',	'2025-10-10 16:46:42.241'),
('602aeb03-88de-4a0f-bda0-e4af6615b4d8',	2,	'f9f534fa0c9960fc9cb462d08e21de0615220b7c9906e97b144aa344cdf13f8a',	'2025-11-12 14:06:53.594',	'2025-10-13 14:08:34.798',	'2025-10-13 14:06:53.595'),
('6071107b-fa59-441c-9ae7-356c89201292',	1,	'518130cdeadb81be1fd6d03570f04145e7d13cf40acbd12d6f839f1c3063ea27',	'2025-11-09 16:08:28.399',	'2025-10-10 16:09:19.228',	'2025-10-10 16:08:28.401'),
('61ecae2e-22c5-4f47-874c-54e28d3c9206',	4,	'd89932608abe151157d0144b4fd085235b6ef84e1f4f9c0a479ab9c403be66af',	'2025-11-12 13:27:38.142',	NULL,	'2025-10-13 13:27:38.145'),
('63577c02-37ba-44ee-83d4-8fb58945d021',	12,	'59c94f3192105d85ac9d7f0e1acb2dc8e511338ffab2f3d6eebd462deca428ad',	'2025-11-11 13:53:30.840',	'2025-10-12 13:53:34.685',	'2025-10-12 13:53:30.842'),
('635fd249-6301-4a30-bc74-74ed3b63bbdf',	2,	'51792327c69170aa590eb5dfff6b1464a5a46a115f14808f9d60eea90481e694',	'2025-11-09 16:16:02.942',	'2025-10-10 16:28:28.054',	'2025-10-10 16:16:02.945'),
('637263a5-bf88-4496-a092-caf9f2737752',	9,	'b5227b6cf2ad41e0208b5776be9343f9b9739b814210f09c2ce2350fd049abbc',	'2025-11-12 13:37:57.793',	'2025-10-13 14:48:07.773',	'2025-10-13 13:37:57.799'),
('6459f604-1293-4316-98c1-f9a5db906bab',	2,	'73fc95820df2a76c07e41d274639469d9f1b7d806d51023ceaf3db1c36ac3029',	'2025-11-09 19:17:38.388',	NULL,	'2025-10-10 19:17:38.392'),
('64937989-9ac6-4b61-a0b3-5280bca602e7',	2,	'57b38b71ba99d82e8c9c34b87bf76364a6b4c325c44217148ed430274f3a597a',	'2025-11-09 17:14:06.265',	NULL,	'2025-10-10 17:14:06.269'),
('65c9ab29-07d7-4781-8963-5aec43630501',	2,	'eee09d8a6faee7ce1285b41086957709f72d9bbe10c8bab213ae41968abac2f1',	'2025-11-11 13:37:54.661',	'2025-10-12 13:40:27.784',	'2025-10-12 13:37:54.663'),
('65f0a763-7af7-4400-b2ba-e229f801c8a9',	12,	'0db491f7445f713513e918f38b8d761e8a368a93278620342e09e5c15f0c3286',	'2025-11-11 14:03:27.113',	NULL,	'2025-10-12 14:03:27.118'),
('66346bc5-1d20-41df-8356-8d4a3e8d5179',	1,	'7935885951fc8b7bd608386b78cea44fccfacb0b081399ee3be97721465f5bec',	'2025-11-09 19:07:36.224',	NULL,	'2025-10-10 19:07:36.226'),
('66bee175-930d-4ec7-afcd-f1ead974b6b6',	15,	'fc360b1288ff621abf99c38e2f35f2034f2159a4870d8a6796d1314da6636f16',	'2025-11-12 16:08:32.379',	NULL,	'2025-10-13 16:08:32.382'),
('67a64dca-89d3-4792-9538-22df7aa85f32',	1,	'a4a7bb5ada7b04604002544f42f1fbffd9d37407bde211df460a511c18f3c8dc',	'2025-11-09 18:49:28.254',	'2025-10-10 18:49:32.566',	'2025-10-10 18:49:28.257'),
('6818af2d-8057-46c0-b9d2-6e7ca00424c4',	1,	'3f909d70830fc9ac4da074315639e31d6e6e0f0904651b7a82453b72e2bd663a',	'2025-11-11 18:37:09.536',	'2025-10-13 12:32:38.687',	'2025-10-12 18:37:09.538'),
('691899eb-bf43-4cf0-95cb-78d807cb00a7',	3,	'3ed4dd259352fb8122e1f1bac5111f0ef794a75ad3e13e98a82d3a44ff1f0bf0',	'2025-11-12 12:20:02.143',	NULL,	'2025-10-13 12:20:02.147'),
('697b5f8c-9b76-4df0-950b-0f1b6363c7ed',	1,	'b88bb9a7444872860df9bb2d76f5c190418aca07b1550ed298817f4eb367aadd',	'2025-11-08 18:09:12.862',	'2025-10-09 18:17:46.646',	'2025-10-09 18:09:12.866'),
('6a9f4276-5d5c-4fc0-97ff-51813d63dc0d',	1,	'cd81873ec0351d59d3de30737f98ba5a9dd565252d8bd17db4a6d92b8535947a',	'2025-11-08 17:45:19.395',	'2025-10-09 18:09:12.863',	'2025-10-09 17:45:19.398'),
('6acbcd00-852a-4416-8469-ace1d5649531',	3,	'1b0c8e64a08b841427dac9e35f135f0219c8d5211204b2cf055b99ec086c7b83',	'2025-11-12 13:33:31.167',	NULL,	'2025-10-13 13:33:31.175'),
('6b52f659-fafe-48a8-a9b3-a39531d8285d',	1,	'2d01aa3d428b0154feb9a6101a9ce1299efac058f5ee8b82f76efa08b6451b3e',	'2025-11-09 18:48:13.471',	NULL,	'2025-10-10 18:48:13.473'),
('6bc4f1cc-242c-4789-8c9c-ba0e64de7b8d',	12,	'12881502bc71e3351f06f2f727e0eaf92838fdfcbbc85a7dcebe2d4da9c00200',	'2025-11-12 14:19:16.302',	'2025-10-13 14:20:12.598',	'2025-10-13 14:19:16.305'),
('6bdecfb7-0c8c-46ba-9ab3-941d183f241c',	3,	'9e235eecb6fc9a377a6657aaf1ebba45218f940e5c058e8f3e2e2d7fe718408d',	'2025-11-12 08:12:09.890',	'2025-10-13 09:07:15.335',	'2025-10-13 08:12:09.893'),
('6be883c4-15af-4113-84d5-beaf5c27ac0a',	1,	'58b549c72278a680633f98840b9d01e8ca8ed8d8d65c8bbf52f2531d2e378011',	'2025-11-09 19:03:47.078',	NULL,	'2025-10-10 19:03:47.081'),
('6cf540bd-c6ba-4185-9a9d-47f9d3a3522a',	1,	'aa55a71baa545775ddc8d2695b6025f0e34104a2d710cb53393472b4580b14e0',	'2025-11-09 18:34:12.509',	'2025-10-10 18:34:17.749',	'2025-10-10 18:34:12.512'),
('6d1284a6-9bc8-4701-8794-a34eb42f6a37',	5,	'cac38ba7bd392732f3be6e0058bc299909bed2ec494046d07260a200218ef982',	'2025-11-08 18:17:31.981',	'2025-10-09 18:24:42.507',	'2025-10-09 18:17:31.985'),
('6dafb4dc-8dec-492a-b640-bdcd11cda799',	1,	'ecb09934fdb57dd65a899711bca55da06cf184f95c330ff6e0dfc1cab05fe5b9',	'2025-11-12 16:26:55.678',	'2025-10-13 17:03:01.999',	'2025-10-13 16:26:55.689'),
('6e086197-ea03-43f3-9abe-44043dd4dc30',	2,	'58d64f83f6e1b731edf6c4870962a1a338aab103ee3caa4b87cdfdbc5970bfcd',	'2025-11-09 17:29:49.327',	'2025-10-10 17:37:44.059',	'2025-10-10 17:29:49.329'),
('6e7c72f2-4287-4d2b-98ad-6b948057fbbf',	1,	'962f1a1906475b8a41a9c6e43760f09823c0b503c51a518907c3cbf115327808',	'2025-11-11 09:54:22.500',	NULL,	'2025-10-12 09:54:22.507'),
('6ee91a61-09e4-49ba-a155-5e4a96db15bb',	1,	'1849aa097a24425a6339f2dd86c6ecd429b5fc101b3b3760eec96e919b2e50a5',	'2025-11-08 17:20:02.453',	'2025-10-09 17:20:02.739',	'2025-10-09 17:20:02.455'),
('6f006eed-cd25-46c9-8631-541ed011d44b',	1,	'74c07a944dba52079dd25f4a1f957feb5f82d8b80fe11dac0fa7973e71d7de51',	'2025-11-09 16:24:15.529',	'2025-10-10 16:29:10.448',	'2025-10-10 16:24:15.533'),
('70a57f82-7b61-47ab-8143-ef3532bd0626',	4,	'02d484e5f786474d9a78605f78d28b0a88526b4bf3ea4a4392fb5d8eea6bc1ee',	'2025-11-09 18:27:50.052',	NULL,	'2025-10-10 18:27:50.055'),
('7320b3d8-6740-4fd4-9963-59b8fa9cb0fb',	2,	'99a27b1b698a7cee2331d379f5a59c0014822b869b9eb6e89f6c7e82f7bec7f3',	'2025-11-12 14:45:20.345',	'2025-10-13 14:46:56.571',	'2025-10-13 14:45:20.349'),
('7336c364-df31-4b84-b98a-9e96a5a22087',	2,	'98736448e2aff6a91cd95ea92876c3e9adc936f07ec77f0f0bc223ae8ce94cb5',	'2025-11-11 13:27:28.718',	NULL,	'2025-10-12 13:27:28.722'),
('7389c500-ab7b-41bd-b426-02db49aad6e8',	1,	'e5ea97c8d7acd58b1af6c1e9dbb4ef7969dab7dc3b251f97f60d24d7dfeecbe6',	'2025-11-09 17:41:11.288',	'2025-10-10 17:41:16.203',	'2025-10-10 17:41:11.295'),
('74364550-0c22-4a6c-b964-ec13f95c88bf',	12,	'8a55cae541c715f2b1d21b397f4c9ce3d0222af34c0f7ccf6f0444b697580ce1',	'2025-11-11 14:16:21.163',	NULL,	'2025-10-12 14:16:21.168'),
('743cbb29-7eec-4395-9fd7-816bcaf94f68',	12,	'b5db377c886c4df1a7c32ad02a3cf50f6326245d60d938f2e00438fa1b068f2a',	'2025-11-11 14:32:25.577',	NULL,	'2025-10-12 14:32:25.583'),
('7442c2a3-48e9-48cd-b1c1-882b5a47f01b',	12,	'5440e439f0983bc4a520b28e412acba048f1a2d2c3cb92eb98c362c49654ed06',	'2025-11-11 14:07:15.518',	'2025-10-12 14:08:52.549',	'2025-10-12 14:07:15.524'),
('74656b40-7f1d-4050-8717-871c5ce30735',	6,	'7bdb4ca89bc4952dc179b1a8c6c0fc2c7ff76617622534a15f1a44d110c48e6d',	'2025-11-08 18:17:29.192',	NULL,	'2025-10-09 18:17:29.196'),
('7479df24-5571-4e75-8787-5a91fc0c6f11',	5,	'a4e392f5c2c363cd0d4f2a483b2fbf3b7618d7cba5f54b71a5f08e4a2bc86ab0',	'2025-11-09 18:32:54.833',	'2025-10-10 19:30:48.593',	'2025-10-10 18:32:54.837'),
('757cedaf-b804-4448-be4d-b4a0ba6f1d66',	1,	'33b5f010f54b502b291246b9f0f24ec71e421b37323aa6b60cee7cad3e1d74ae',	'2025-11-09 16:19:37.244',	NULL,	'2025-10-10 16:19:37.246'),
('76b540ad-1d5d-4420-bc2a-9ec9f40d3d9d',	1,	'07969930c63997c70eef070b101d19efb48f22297e958ba10a9ddbf7c9af6c93',	'2025-11-09 18:55:26.580',	NULL,	'2025-10-10 18:55:26.583'),
('783f9cdc-bdc7-42be-818b-fa3aa13fb118',	2,	'8a8c795f08a596afd4bacb6c01e47b63512214306c993b2cd372195cb51bd443',	'2025-11-11 13:24:21.912',	'2025-10-12 13:27:28.719',	'2025-10-12 13:24:21.914'),
('79a106ee-cbd0-4b60-b5dc-d448a2ca1621',	4,	'51740b490f36fb6bed5101de5ee429bbe0aa813395464b0eb2c7aeed18c95e7f',	'2025-11-08 17:45:09.714',	NULL,	'2025-10-09 17:45:09.718'),
('79ae5caf-ee6b-46ac-933a-0585faa284ab',	2,	'066310dfbb8053edf443509872e3fcb69e58cc4169ddb74259ec0e47235377ad',	'2025-11-12 13:58:04.708',	'2025-10-13 14:05:14.595',	'2025-10-13 13:58:04.710'),
('7a70437c-a014-4314-8015-749572d02c1a',	2,	'a107019995370bfd619d3751540f930a98edccb2ec8fb0c1c963b31a31169dd7',	'2025-11-12 14:45:20.331',	NULL,	'2025-10-13 14:45:20.333'),
('7ae663ca-aaa6-4a93-9969-3711614559b9',	3,	'11b2c2adf4504943a0a01b382b9eb76d73422a692db5b1ddaefe83805f3c7065',	'2025-11-12 13:33:31.163',	NULL,	'2025-10-13 13:33:31.166'),
('7b0dfe8e-9502-426e-8ec5-3f2168884689',	2,	'10d9b8e77e68193f30a22a11a077484da0e25649e3063eab38e0e975368f8a97',	'2025-11-12 08:44:58.350',	NULL,	'2025-10-13 08:44:58.363'),
('7bbdf986-eb15-4d3b-ab7f-575956799ef2',	3,	'd5ff94a67ba0655f2e8a9f16eeda63882428a726b222f5f5cdf62fc0adde3930',	'2025-11-12 12:21:40.657',	NULL,	'2025-10-13 12:21:40.660'),
('7bda06a1-4c7d-4a76-8cea-9ead88badf44',	4,	'e88a2f000032a94661bd2b5b9aee6792186be9740e6ca58e9c285f3b54aa728d',	'2025-11-08 17:39:07.328',	NULL,	'2025-10-09 17:39:07.332'),
('7c96ce52-0f55-4c9a-a800-eb83c71d001d',	4,	'9d1220e6e9e0ce6a1be35a78a59d6e58e7295df03e58d3f1096b1b8d2f504f69',	'2025-11-08 17:55:41.152',	'2025-10-09 17:55:41.436',	'2025-10-09 17:55:41.154'),
('7cc4a31c-de00-41f0-97a2-475c885cb49e',	7,	'0f3d82f80a4a202fae69492e49e7d146edfcfbe53b08491edf2a39ceb8adc8a9',	'2025-11-09 10:33:28.503',	'2025-10-10 10:33:28.581',	'2025-10-10 10:33:28.504'),
('7d3b9049-8a63-4924-9ae2-5ac695e6bbc3',	2,	'1f1f6c5a8570c5f89cc98194fecbea4b2b0e9843d6faddbcbfb14074d9d8d293',	'2025-11-09 17:29:49.254',	NULL,	'2025-10-10 17:29:49.258'),
('7d475b84-b434-4958-b93e-4215f6a02b3f',	2,	'45de1547ed73fab7081be318403bea9499ead713e86319b85b76eb53889c16cd',	'2025-11-08 17:27:25.212',	NULL,	'2025-10-09 17:27:25.216'),
('7d6feb35-f283-4062-a134-1c59a963cbf3',	15,	'a82af0eee75a7217a033387719a67c95763274432fd0d88463f87f9e361d402f',	'2025-11-12 16:08:32.020',	'2025-10-13 16:08:32.380',	'2025-10-13 16:08:32.022'),
('7d722b61-b681-4e06-ac2c-d8deaa4c66da',	1,	'912c82f6ff07f58ca945181b1c46d1f3bf3570698e880fd15a597baf15f926f4',	'2025-11-09 18:48:16.257',	NULL,	'2025-10-10 18:48:16.260'),
('7dc4ebd7-dee9-465b-b2ac-930d4ce45cc2',	2,	'7cc3f0b3e467aeda8c599ea67b6a1d2a03df02b91980542615f8a69fd312d1bc',	'2025-11-12 13:56:25.760',	NULL,	'2025-10-13 13:56:25.780'),
('7e024aec-1bbb-410d-821e-edb086ca1348',	2,	'4ca2c8eee22f02623cd5ced04aac42d2d937e86ba70e6e49e3542938e5167d2e',	'2025-11-12 13:44:13.122',	NULL,	'2025-10-13 13:44:13.125'),
('7f525f02-1304-46bb-83df-706184f3f3b1',	1,	'a625311ad0cd92ed71a3a007d37883dfc7d26132c1eb53ec1e2dd2f751bcd843',	'2025-11-09 16:11:58.325',	NULL,	'2025-10-10 16:11:58.326'),
('7fd6cc51-a7d2-4af7-835b-5ecf67db0339',	5,	'd90fe47c995271a9b213e5049353438a951728b51aa4810875a7f603a6372680',	'2025-11-09 16:13:36.641',	NULL,	'2025-10-10 16:13:36.643'),
('806d5f22-7818-4308-81e6-4415ab75551e',	2,	'7a789cc175cd230e7df570c37e332ff7b342ccc22c0b74232131eba579f1be77',	'2025-11-12 14:08:34.867',	'2025-10-13 14:45:20.346',	'2025-10-13 14:08:34.870'),
('809f32e4-c92e-4da3-b82a-a6bf7a890b23',	2,	'ae75f3481f5ded968f6f61f1ed3905b00bf5141d0b4fe88697f68f8389ab4172',	'2025-11-12 09:06:36.456',	'2025-10-13 09:14:16.274',	'2025-10-13 09:06:36.465'),
('80a0d067-b9c5-4e95-a2c8-ee55424430cc',	1,	'44ac5ced5be9618d78813e1349bb21e865bf7775c348cbdbe4abba37460bc078',	'2025-11-08 18:28:58.572',	'2025-10-09 18:31:00.550',	'2025-10-09 18:28:58.576'),
('8103c22b-78dc-4350-83d5-2fc849f7b124',	12,	'a4c8f78065c96fcad9d40b7279bfc48fb092fe66a4d17a73bca092fa7cf62f02',	'2025-11-11 14:04:48.863',	NULL,	'2025-10-12 14:04:48.867'),
('81e3388f-37ba-49cb-bd15-52187b040c61',	17,	'2e0f079d5b3a7581121949832b316286e5efa7f3c7a15fd155b9486679996f90',	'2025-11-12 16:27:29.402',	'2025-10-13 17:37:59.574',	'2025-10-13 16:27:29.420'),
('82efc526-bfbc-413e-8852-16dced2f328f',	16,	'f1c8701c8fcd46fd3877efc08d857a0164e46e6710aac1499e3758a3f579ed08',	'2025-11-12 16:26:13.113',	NULL,	'2025-10-13 16:26:13.119'),
('837c89a3-750b-476f-95e5-2962623e7b9a',	5,	'7c7db0f93880320d51153cfe40f784667386d8d1a5dd2f00dd2651ebe7e3e868',	'2025-11-12 13:27:49.357',	'2025-10-13 13:27:51.570',	'2025-10-13 13:27:49.359'),
('8384b77a-7a8f-4dc4-aa1e-0635e160c7ec',	2,	'4b0f6a273c8676ada5f1076434bf35ba121781b5c10b7430b55fe392c6e8ed76',	'2025-11-08 17:18:16.333',	'2025-10-09 17:18:17.749',	'2025-10-09 17:18:16.335'),
('83d45760-fbb0-46ca-bc6d-f1e25a693c7b',	2,	'84e0f88c93cd50d52af609279f84d61c0ea1317264bc09f03c3ecf5a19d2a2a8',	'2025-11-11 13:34:05.977',	NULL,	'2025-10-12 13:34:05.982'),
('84adcc59-b741-42f8-adb2-cea0afbaa1b8',	2,	'f490232f44b99d30509e5df8c2b9678e60af867bb1cc8a71f32e142e5dcb1453',	'2025-11-09 19:30:18.714',	NULL,	'2025-10-10 19:30:18.717'),
('8588231e-7721-43e9-9461-ec22fadf74f0',	1,	'5168c391ca781bbaa305acc06b78644f796915d19ccd1b7583f14f4d22542f71',	'2025-11-10 01:07:24.916',	NULL,	'2025-10-11 01:07:24.918'),
('87151e9c-da8e-4fed-a2f1-227481e33b56',	2,	'7db132682c566f80f2b1d8553c828558d307bf88d91e128339400aec8e660e7e',	'2025-11-09 16:28:28.052',	NULL,	'2025-10-10 16:28:28.057'),
('87d1ef66-356a-4034-b5a0-6e460e416d53',	1,	'339de8ac45e1e9cb61d73ebf15bb4bec5f161ec3bfd22382c878b85e5e599cb8',	'2025-11-09 19:03:47.081',	'2025-10-10 19:07:07.928',	'2025-10-10 19:03:47.086'),
('883904c5-307f-4f78-b087-9f6ad015ad48',	4,	'8f2ae6e1ac4c32ca96f5112ec55cc87a7f5066d365b3866376811b89e9e7a5ca',	'2025-11-08 18:10:11.367',	'2025-10-09 18:14:33.346',	'2025-10-09 18:10:11.370'),
('88bea1a9-fee3-440c-857d-c671ca03005e',	2,	'367c42852e33de2f0b78c32c090a819d2f7db9c5acceec295b8ba4687961024c',	'2025-11-09 17:21:06.854',	NULL,	'2025-10-10 17:21:06.857'),
('892b9983-d953-4c1e-827c-b2cc72c09ddd',	1,	'8d09b72ee23990b201ac66933e69aac11419945931c554dd2954285239fba795',	'2025-11-09 18:21:32.197',	'2025-10-10 18:21:35.987',	'2025-10-10 18:21:32.202'),
('897041aa-949c-4b67-b85e-5f25b8532bac',	1,	'b911ca394bcdc4263937cd2702de8e6e1bda542f79bd29bad88fb6d58014b551',	'2025-11-09 16:06:51.207',	NULL,	'2025-10-10 16:06:51.209'),
('8a115a4a-c97c-4c8a-8ca0-a652db612184',	4,	'6b4f43ea59f0facbb8822859d893d2a8d29647710f2e4c7961205d2c17b9061f',	'2025-11-09 19:31:11.662',	NULL,	'2025-10-10 19:31:11.664'),
('8a957058-ff61-4b29-9ad9-4cc9d5b9b72b',	4,	'72e4318e174ecb1325c88434e25293edddcfa60e1281ffa572258843f207dd34',	'2025-11-08 18:09:04.847',	'2025-10-09 18:10:11.368',	'2025-10-09 18:09:04.852'),
('8ae2d9ce-7b41-4899-b24d-9b66f44abe1e',	1,	'd474730c0411d93cd2e2fef3185683a7a09588211e8fbd63f6864f63c9febcc9',	'2025-11-09 18:49:28.254',	NULL,	'2025-10-10 18:49:28.256'),
('8bcad4fe-c421-4fb8-a274-6c2f5bb8eef0',	1,	'de64ccf6c6727730108bfaaf0d4ffddabf6edae3d4d1820213f0332ba3182bcc',	'2025-11-10 01:12:15.056',	'2025-10-12 18:37:09.532',	'2025-10-11 01:12:15.058'),
('8c078978-0506-4ed5-b0bd-448a234baf75',	17,	'20d539c5247782254b80abfa6e13b06eac47cb04b0339aec6c26980dc604c2bb',	'2025-11-12 17:39:14.813',	'2025-10-13 17:41:52.851',	'2025-10-13 17:39:14.818'),
('8f0f4283-7bb5-4093-a89d-02a66ef0c499',	2,	'a9a25aa6950db7722f506238242018b288620d3e9c4e6099886bbefe5bb4e8d1',	'2025-11-09 23:09:53.613',	'2025-10-11 01:20:36.947',	'2025-10-10 23:09:53.619'),
('8fce069a-af88-4d7d-8abd-90421291bea2',	16,	'dd1e1d4dfb1dfd2ca8bbbececa972e3d8a461aa957a81e733a20fe820b2a7d2d',	'2025-11-12 16:16:30.491',	'2025-10-13 16:26:13.115',	'2025-10-13 16:16:30.497'),
('9023eda7-db82-44b1-829e-81ab7abc80ff',	12,	'c9e83defcc892380d33adcd189787dad8160caaa9367823700b4ff5ae464e07d',	'2025-11-12 14:09:47.588',	'2025-10-13 14:16:08.724',	'2025-10-13 14:09:47.589'),
('90819b42-0c67-42cc-b2c9-5c3529855126',	1,	'a5ace118c5792270531e2c6f03ed2b10cb1d6e02a9ed424ee201a34c36027315',	'2025-11-11 18:04:49.896',	NULL,	'2025-10-12 18:04:49.902'),
('90ec6218-b4c5-493a-9846-d72ba5813531',	17,	'3483718ac2a1e39a8292b7d8c0ad9442cf36ff8c22bfa132564aa26ddb5e940b',	'2025-11-12 15:55:19.891',	'2025-10-13 15:59:30.214',	'2025-10-13 15:55:19.895'),
('90fecc8e-dc34-49e6-9a19-36d1d6f46e05',	9,	'9bbb9f4a870876da61db72048fb842d0efc4db2700cebc42d5b5014f7753b121',	'2025-11-12 14:49:12.829',	NULL,	'2025-10-13 14:49:12.833'),
('91a5dc2e-232e-482f-a5ec-003c55448aeb',	1,	'3a3e452d733694ccf206815f6903a858b297af43e30c576b33344962f57a0833',	'2025-11-09 17:41:43.182',	'2025-10-10 17:50:04.822',	'2025-10-10 17:41:43.189'),
('925ad2c4-1285-4350-bd46-741b8afe92ff',	1,	'13a202ef96c20891d1efb1b3cf9643fd087e2e5fcd665d6c41389c3abf9b4341',	'2025-11-09 19:31:13.724',	NULL,	'2025-10-10 19:31:13.726'),
('93b081d6-ca3d-45f8-b2ac-a1de3c9a2836',	12,	'18cc5cf5487bfe3b248fae83d99d182bc2f6ca9bcc90319090d119154904c9a5',	'2025-11-11 14:31:20.991',	'2025-10-12 14:32:25.578',	'2025-10-12 14:31:20.993'),
('9420224e-a135-471c-9081-ea1221653ae2',	1,	'4d51e16a00d39ff3b58869fe863dc3c5e11d118cf4b680c31277c34c8d3e1bd0',	'2025-11-09 23:25:50.190',	NULL,	'2025-10-10 23:25:50.193'),
('94cdbe72-f5cf-4dfb-9f02-63abf80d40e3',	9,	'3bb5a022492596f867ffd9fc65e8a03133d1160e2d793a6c0145d547f6dd901a',	'2025-11-12 14:50:15.450',	NULL,	'2025-10-13 14:50:15.455'),
('94f0ebab-ecac-4bee-9369-5b84be55ef18',	13,	'853601baf643ddad8525015fb1de4e7b5bf355aba3c9d20a8c3ef15bcf89d05a',	'2025-11-12 12:20:28.059',	NULL,	'2025-10-13 12:20:28.066'),
('95356d33-c3a7-4ea2-9646-7979d7736bd6',	2,	'76550cfba90a8ed6a7dcaa34eafa6db96d17e06532e114215bb18d4fd9e2b4ec',	'2025-11-12 15:37:50.126',	'2025-10-13 15:39:20.928',	'2025-10-13 15:37:50.131'),
('95ea2244-7259-4d0f-9f3a-e97cf3ea13da',	1,	'5b70549ea6f039312d7a50cb7b0ef4d687c45f1ea1eda3500ed60bd5b9d6b4d7',	'2025-11-09 16:29:10.446',	'2025-10-10 16:29:20.985',	'2025-10-10 16:29:10.452'),
('967d200c-87e6-4953-ac39-db03f16789cf',	4,	'95877edc86f2dc4608c27b85c4cbd2ecc2763a11e533e785622912884b8d0693',	'2025-11-08 17:44:09.098',	NULL,	'2025-10-09 17:44:09.101'),
('96e196bf-a902-4350-bd86-4ddcaa43009f',	2,	'21846c83921ce6e0f09c3eba47f71902b85e1fc05b3921c9a37bf9cc24884830',	'2025-11-11 13:34:06.053',	'2025-10-12 13:34:09.203',	'2025-10-12 13:34:06.055'),
('973ba555-f346-4dad-b0ca-260d1e5d0898',	12,	'e5883c8f7fc016bd30f705d4d00cbaf5c35d883d82a970544ae9af95747d275f',	'2025-11-11 14:13:38.594',	NULL,	'2025-10-12 14:13:38.597'),
('97643076-6faa-49bc-b084-67086410672d',	3,	'6214bb06e7d40e245eac61d2b00ae7016712c61671763eabcaeaac3ff7d1db5c',	'2025-11-09 10:31:48.665',	'2025-10-10 10:31:48.902',	'2025-10-10 10:31:48.667'),
('97f16457-3943-4bbe-a47c-9053e532eaf9',	12,	'145c931bd5ce7fadc4d9b00858c4832922f00aa60f5e80acb8f675b60245deeb',	'2025-11-11 14:31:20.919',	NULL,	'2025-10-12 14:31:20.923'),
('9970c304-ef2f-4cd5-8233-4dd9d84b9ab8',	2,	'bb08e6d3937d70614d7a558cf5533e62023be967513a99e7f77400e9be25c224',	'2025-11-09 16:31:51.700',	'2025-10-10 16:33:23.231',	'2025-10-10 16:31:51.702'),
('99a339b4-35ea-4f0a-8f2a-db87cc5bb68a',	4,	'9d3d025897691781283543c26247a0ec58d4269bdd134cb0f559c15d9e30e6e1',	'2025-11-09 18:32:41.162',	NULL,	'2025-10-10 18:32:41.164'),
('9c411cec-8a09-4702-bc38-e7a37907382c',	6,	'c31288c5f268aba44c2cfc77f6fed9055f3a4f11daa60bc8712b591cf6bc8fc9',	'2025-11-08 21:43:12.078',	'2025-10-13 17:50:39.158',	'2025-10-09 21:43:12.081'),
('9d6e080e-925e-4eaa-a4e4-ea7ae0fbe0a9',	1,	'364af28fd447f26c8c0aff655e320e95cbbaba3a4d8250c36e22a8135bfba4df',	'2025-11-09 16:59:33.592',	'2025-10-10 17:31:48.595',	'2025-10-10 16:59:33.597'),
('9ee8ca97-fdb2-468f-af4e-6436921c30bf',	5,	'41ec70ac54711585bc9f679a898131d0e2ce898f6d8b800fba0577d03854a6aa',	'2025-11-12 13:40:12.444',	NULL,	'2025-10-13 13:40:12.450'),
('9f0ea931-b533-45ae-88c0-cf5527a518b6',	2,	'6cfa577c2e1310ca1b2a77e1d2ddd24d36c506662c2af005439609d8f110ff43',	'2025-11-09 16:36:23.149',	NULL,	'2025-10-10 16:36:23.151'),
('a025268a-b324-4b8a-bbfb-1827bc0e2c1c',	12,	'2565606655e67ee3969b48fe77a8b17a23bacd0b76a0b3aa8961c75e07356607',	'2025-11-12 14:20:12.587',	NULL,	'2025-10-13 14:20:12.593'),
('a12f2a4b-d67a-45f9-97cb-deec86ce02c5',	1,	'7fdf433bcb07f814f501450a848835f35fbe56177eea6f784adaa846717ece78',	'2025-11-10 01:07:07.200',	NULL,	'2025-10-11 01:07:07.202'),
('a2b7b95f-ddce-4016-b69e-423290b5d359',	2,	'6ce85407a58f20f33905872b630e9be94423184203f009850d504fca575094f6',	'2025-11-09 19:17:38.467',	'2025-10-10 19:25:25.644',	'2025-10-10 19:17:38.469'),
('a2bb12e4-77d6-47e1-8ccd-a51364b61c4d',	2,	'd6cc4dcb0a1998e6fc6b1a009bf65927773bb62aac456b7eee5e11aba9450d19',	'2025-11-09 17:37:44.028',	'2025-10-10 17:44:16.353',	'2025-10-10 17:37:44.062'),
('a33582b0-2a0b-4e1d-8f45-302259bebb97',	13,	'e6802f70ea98ebed7712b5866e815b46e5421716b4350cb719a1ca3131ae8196',	'2025-11-12 12:16:04.949',	NULL,	'2025-10-13 12:16:04.951'),
('a3619ec5-751c-447c-860b-9e6cbb2d16a7',	4,	'dfc9e5b6bc86702cec8a90604cde75fffe60936e924899a272cefcce85e5cc33',	'2025-11-08 17:45:09.436',	'2025-10-09 17:45:09.716',	'2025-10-09 17:45:09.439'),
('a3b6c44f-17d6-4380-9552-b83aac38eee9',	1,	'79d3f6697775b249264afd39f9bf0159f746ace47ac63845146817c5ee0f345a',	'2025-11-09 15:14:51.829',	'2025-10-10 15:18:13.761',	'2025-10-10 15:14:51.833'),
('a3dbe726-7848-49e1-a27c-5da6e5714a47',	5,	'61b58f1b3e9c6834c3e8650675169da806685ce54da2e8dbab9f8e926946aa7a',	'2025-11-09 18:32:53.244',	'2025-10-10 18:32:54.835',	'2025-10-10 18:32:53.246'),
('a40ef908-ef7b-4757-a1b9-121ddb232505',	1,	'fbd546c15befd5ddd77c9b874525459192192e9d58da954b311e323071a939ea',	'2025-11-09 18:21:52.001',	NULL,	'2025-10-10 18:21:52.003'),
('a43067dc-95a7-413e-9b47-fc498faf4181',	9,	'1b825f24acc53f465b4837de473069c6de829122b7c4da2bd88a71d4fbd82bf2',	'2025-11-12 13:37:47.884',	'2025-10-13 13:37:57.796',	'2025-10-13 13:37:47.890'),
('a4ac3126-f41d-4055-b4bb-8b427c5e56f9',	1,	'7d4367fa8919c13398f800a82abed24b55df29ee32668e4d2f46d3d3194dc01a',	'2025-11-12 17:03:01.998',	'2025-10-13 17:26:40.862',	'2025-10-13 17:03:02.005'),
('a4d1406f-645f-4682-b7dd-896005ad3342',	2,	'cc5821178403396accc58c2ac672466d60919585a3a568b264a6ede9c534efbe',	'2025-11-12 13:44:13.196',	'2025-10-13 13:48:01.682',	'2025-10-13 13:44:13.198'),
('a7bb8e7c-df75-40d2-8328-804102ee3725',	1,	'ca05fdd917674abe820f2ab23bdef338a4d14e7d45fae89c4db3263a9acc9625',	'2025-11-09 15:32:47.251',	'2025-10-10 16:06:22.034',	'2025-10-10 15:32:47.255'),
('a7cdc307-a74c-405c-aedd-2b1ccbc1614e',	1,	'755bfca53da3a2dcb75afd86863ac489188fe6f061a5ee276bb41501221faf0c',	'2025-11-11 18:03:26.736',	'2025-10-12 18:04:49.898',	'2025-10-12 18:03:26.738'),
('a8f3577a-cd01-4724-9ed4-35231b3cf477',	5,	'54186c00d68bcc4b805506d95f1254f1e886f3385a5160544754329f8e77e838',	'2025-11-08 17:58:34.624',	'2025-10-09 17:58:34.909',	'2025-10-09 17:58:34.626'),
('aa856e9e-bc32-49bb-8f35-87410a5f5b88',	2,	'ac3d5ee80f9b4a09de5742977bfdd384cc0e9410fa68a126c118d2fc99b7e589',	'2025-11-12 13:48:01.671',	'2025-10-13 13:56:25.766',	'2025-10-13 13:48:01.682'),
('abab3576-16b2-40ee-994a-1451da467d7d',	16,	'f94dea62c2a3746d6bc391e75ab01a0441507b13b2350e5c0f85ec96cab816d7',	'2025-11-12 15:52:15.067',	'2025-10-13 15:52:15.477',	'2025-10-13 15:52:15.069'),
('ac5f67d5-e7b3-4402-9b59-b249bbb116f7',	12,	'c6096ebb644c1e331ba4bc73cd2c2d760601b566275e4d1412828071c8dbafbf',	'2025-11-11 14:08:52.618',	'2025-10-12 14:13:38.595',	'2025-10-12 14:08:52.619'),
('ad048b79-7aed-44fe-ab06-fe0764a9f6d8',	17,	'fd8f125ee60a5ecbc6346e671fac59fafb0abbdb3b397e2e0654c3c5582caa6c',	'2025-11-12 16:26:38.616',	'2025-10-13 16:27:29.414',	'2025-10-13 16:26:38.621'),
('addc9fbe-5f4f-4e52-8933-e447d8c29220',	5,	'7cd1ce16f8168afdfb2b5d58e585180eb3da7b2186eb42960b2a344eb6334aad',	'2025-11-12 17:46:14.330',	NULL,	'2025-10-13 17:46:14.335'),
('af1984a0-9879-4338-a732-511019ed565c',	1,	'22ea1c777cf889cb9c866062b3a6a9ccb8b1a758b89ab4506fd32d44ba67f909',	'2025-11-09 19:07:36.224',	NULL,	'2025-10-10 19:07:36.228'),
('af8d9f94-43c6-4a49-908c-06021ee034cc',	1,	'93dade31e279039ac3558c4232c5234457e34051d4e38602c9cca0078ea3afba',	'2025-11-09 16:46:42.236',	NULL,	'2025-10-10 16:46:42.238'),
('b03d2f29-18a2-43cc-91c1-4846c3f286fb',	5,	'1b0a130d98817e6b9f18effce84872acf339883403d8b16002d54ee4163a8caa',	'2025-11-09 18:32:54.833',	NULL,	'2025-10-10 18:32:54.836'),
('b07705d2-b34f-4373-91e3-1ca2a15c72dc',	1,	'98677fee808771c1715b925297ac9410c364e8b4066b2d912a4e865adab7bbc8',	'2025-11-09 18:48:59.848',	NULL,	'2025-10-10 18:48:59.849'),
('b083f659-96a1-4c57-8918-d6c4df72b073',	5,	'46376c2c2d04a9617a24dafbb614c3b6cbc542ccc1136909c0cb9fd6b3ca0fdc',	'2025-11-08 18:10:13.612',	'2025-10-09 18:11:59.842',	'2025-10-09 18:10:13.615'),
('b2253286-46e7-44e0-a045-5e1b5561999b',	1,	'5929f72348410649c862b82d39ae67aaae9fb2e9235ac019444e8e2b41435d4d',	'2025-11-12 13:26:05.534',	NULL,	'2025-10-13 13:26:05.542'),
('b37e98ed-a3e6-4712-864f-387304b7a7c7',	1,	'3b233b94105e75a5f3e2135d1058bb6ffc1b5aceefe5fce93905c29e9a3108d0',	'2025-11-09 19:22:30.274',	NULL,	'2025-10-10 19:22:30.276'),
('b3939490-8a8a-4185-970d-675b33091888',	14,	'7a3357382b041d862fd46bbdd557a5b98223ff807e5e2dbb1b8606e355327d74',	'2025-11-12 12:24:56.076',	NULL,	'2025-10-13 12:24:56.080'),
('b5e23cc7-98ed-4f95-9e0b-5d44369882fe',	1,	'e20ddb3aeaef4a53f5925b0de77656bbf9ff89c7901217197f728862523308c3',	'2025-11-12 13:24:53.373',	NULL,	'2025-10-13 13:24:53.392'),
('b6083d66-0008-4aef-963c-1e18c6338feb',	9,	'be0721073002c9327330420976851767f148e5e117b4638ecf2b815f02cb5de6',	'2025-11-11 13:45:01.213',	'2025-10-13 14:48:29.036',	'2025-10-12 13:45:01.214'),
('b737ca63-d23e-4c44-85f8-c7b7bfb71154',	2,	'f098d5c6010cb09f4a39a1b7bd2e551ddc8a6f13b23bceb8255f8311880f0314',	'2025-11-09 16:33:23.304',	'2025-10-10 16:36:23.155',	'2025-10-10 16:33:23.307'),
('b7f1fab5-cb34-4fd7-bee4-97e1f41f8032',	1,	'000374679ea0ae8982867c3aff236a09d08816a57f525c77299732e3707866f3',	'2025-11-09 16:06:38.141',	NULL,	'2025-10-10 16:06:38.143'),
('b9de8175-a42a-420e-ace6-5d9b4765950b',	3,	'ca4cc2da2081a41e3dd7ab5d70b2866d2db77abf42625057bdd982bdabdb38ab',	'2025-11-09 10:31:48.901',	'2025-10-13 08:10:07.177',	'2025-10-10 10:31:48.905'),
('ba815f25-9590-428d-b0a7-089072037d8a',	1,	'ccacb591aea54753c3e8df58966b4a097e533d12a5ea94d0da6c790b4400fcc3',	'2025-11-09 17:31:48.587',	NULL,	'2025-10-10 17:31:48.591'),
('bab18e79-8350-47d2-a6e1-55a7352eb85b',	2,	'f20b46486a4b83c89395eab587038c598ac0ea0c1833f9bff0dc2a8dcb4b0ea6',	'2025-11-08 17:18:17.748',	'2025-10-09 17:18:41.798',	'2025-10-09 17:18:17.753'),
('bdce81ae-dc40-44df-ba8d-0420f550e6b0',	1,	'34ed0106f0aa9162b19cdbe2514e2cfd52e1e0fa1d146bba72a7ae9be2bb2d1d',	'2025-11-09 15:18:43.276',	NULL,	'2025-10-10 15:18:43.280'),
('be8f2413-78c8-4883-baab-173abd71d3fa',	4,	'a57b66fd9e5d6cc4a047ee7a4615cd5625079fe044b634f1189732da602d3ed8',	'2025-11-09 18:26:39.195',	NULL,	'2025-10-10 18:26:39.198'),
('c087748a-8a82-42a2-81e3-040de253d9b3',	6,	'7eb055fecc68b2e68221aabfda1cda5ea4030f0c161c0f4e65b6b2f118aec9fd',	'2025-11-08 18:33:51.682',	'2025-10-09 18:35:08.282',	'2025-10-09 18:33:51.687'),
('c09817d5-99a8-47bd-b731-beeea860d637',	2,	'3eafa56c65362911a43a054b9d600b317e529dbbe8cb6d55d1534f85ec9d40eb',	'2025-11-09 17:44:16.428',	'2025-10-10 19:17:38.389',	'2025-10-10 17:44:16.430'),
('c100837b-4461-4d27-9cb7-8f1b5f59a311',	9,	'fb66366038b2298547e217e5352d5a28672fb40065fbd3852705a5d96b1aba84',	'2025-11-12 14:50:15.452',	'2025-10-13 15:37:54.947',	'2025-10-13 14:50:15.457'),
('c156e195-c518-4475-af15-f7298dbd3f59',	1,	'b9d7439f357a1787cd622a76f58b45bca0bbc064d71f39ec47d885ac83e19f71',	'2025-11-12 13:39:12.275',	NULL,	'2025-10-13 13:39:12.279'),
('c15b8dde-e3fb-462f-99ed-26fac89b664d',	1,	'4cb56d713989f15efe33de67b725eea31fac1d72b1c4b2a95fdb0608543e1855',	'2025-11-09 22:42:09.125',	NULL,	'2025-10-10 22:42:09.126'),
('c18803b5-3a82-48a7-83e0-ba2ff16a1572',	2,	'd37d96e32d62ff5f0eca235ad4b46109b9280a7652e8feb99c458b0a2a82a222',	'2025-11-12 14:08:34.798',	NULL,	'2025-10-13 14:08:34.801'),
('c29ce9e8-6579-4cf8-ba9c-06069ca1b8a9',	2,	'18e902eb6278421a598f379ba2c6c07ecd052f37b3daa9daf275fa0280ab34d3',	'2025-11-12 09:04:41.931',	'2025-10-13 09:04:43.426',	'2025-10-13 09:04:41.947'),
('c2cf78af-96e6-4cc0-bd99-b9929914982d',	2,	'2a626f98580436571e3993e3c2f2f903599b606c6097feb739e7f2ed2335a6bb',	'2025-11-12 13:37:57.789',	NULL,	'2025-10-13 13:37:57.791'),
('c2d3ff69-9dac-4577-a09a-b7fedb297951',	14,	'e413fff83e27e6203c63572f3c4327a0221c2fc3ad6083cdf07917fa3dd2f0d2',	'2025-11-12 12:24:55.834',	'2025-10-13 12:24:56.077',	'2025-10-13 12:24:55.842'),
('c32f173e-7ce9-47f7-8dae-393de523c9a0',	2,	'adcc5ace5f9b5f9465dbcf1e50aa21e36d77142b564924c826ace53dbde49be2',	'2025-11-08 17:18:41.797',	'2025-10-09 17:23:55.297',	'2025-10-09 17:18:41.801'),
('c3727870-92a2-439d-84ac-14d81d40a86c',	12,	'bea72de7d7b7d0f32707ad91878017f9a9e732ff4a3fd502c50a5ab9533f1656',	'2025-11-11 13:53:34.759',	'2025-10-12 13:59:41.235',	'2025-10-12 13:53:34.761'),
('c373fda0-a406-45b7-94e3-f426ddbe26fe',	9,	'1ba2c75e47848a4140f8f2f5d34b3cef1a3aeac07ddf1ca2fbe67ed72558ed99',	'2025-11-12 13:37:47.726',	NULL,	'2025-10-13 13:37:47.733'),
('c3af049c-0d4c-48dc-9d3a-7ce6f64b971e',	4,	'fcd496330c962c95ab50482269e38913b4bd120607e3eb1bd33afd7208ee6e88',	'2025-11-08 17:44:50.395',	NULL,	'2025-10-09 17:44:50.399'),
('c461f548-4045-4f39-a6b3-74787b70a9b7',	1,	'1dbeecc5227d69095386680cabb6c3c733e4c9e14be0cd8bdd24b289bd1ee723',	'2025-11-09 18:49:04.475',	'2025-10-10 18:49:22.608',	'2025-10-10 18:49:04.479'),
('c4684721-f155-4104-b56b-d9cfab3d1e95',	12,	'37eaa5be0b0e9ac2520020dedf582422856e0d2f28032253aec73ce91299627e',	'2025-11-11 14:18:33.813',	'2025-10-12 14:31:20.920',	'2025-10-12 14:18:33.816'),
('c48205d0-4e4e-43e9-8861-a797846476cb',	2,	'363576df79c3ffd1a54e8a09cc9d6508d8ae2c4716cc3ab16c766651c3e01dc0',	'2025-11-09 19:30:18.716',	'2025-10-10 23:09:53.616',	'2025-10-10 19:30:18.729'),
('c68f2514-31a6-4c64-bc45-8980cd4496e3',	12,	'84fcc8f055040e458bffff45a15d004d93a6ce91941dbae1e9f32851d037f212',	'2025-11-12 14:29:21.986',	NULL,	'2025-10-13 14:29:21.990'),
('c6da1483-cfff-4049-bdde-7d5f05c478b2',	4,	'7388b2c298ec1c41a91a1d5f0cc2e7d7798d51e3ad33b40771bbbedd6d909cf5',	'2025-11-08 17:56:59.357',	'2025-10-09 17:56:59.636',	'2025-10-09 17:56:59.359'),
('c73234d6-7724-495a-a973-24436d5dc4ef',	9,	'3cffca653be760780b23dbb8e162d2af1e797ef076c36f40e7c6245b14d420db',	'2025-11-09 16:24:11.048',	'2025-10-12 13:45:01.130',	'2025-10-10 16:24:11.050'),
('c7506cf1-2d83-409e-98dc-303906fd6f49',	2,	'9fd6fb0beabed812e60a54551041eb610b7831e419d15b82144fa4c434428504',	'2025-11-12 14:05:14.594',	'2025-10-13 14:06:53.523',	'2025-10-13 14:05:14.598'),
('c820868a-394b-4f4f-8854-f6e50a271cda',	1,	'21befbdeba1f060136a019ac05c7603a7285345ead82a11d4fd418d8d887ca82',	'2025-11-09 17:50:05.197',	'2025-10-10 18:21:32.198',	'2025-10-10 17:50:05.200'),
('c836247d-f164-49af-bd39-0149cd59bf55',	2,	'b955b1f1baa5f3cc626fdff878fdac23501c2d70a1b6194157f637875ac0ca05',	'2025-11-12 14:05:14.595',	NULL,	'2025-10-13 14:05:14.602'),
('c83739cd-3d31-456e-9cd8-83a2d70cb417',	9,	'0798bef39763a9237257acc3a30909fac31fb0fa8ac7b600043fdf64d83e1cd7',	'2025-11-12 14:49:12.903',	'2025-10-13 14:50:12.098',	'2025-10-13 14:49:12.905'),
('c8a82717-5a63-46a6-8c44-a6dd1da97264',	12,	'34a0f707389665d7953634715b7ba416d93d6602e507a1aab0b076a35de8d098',	'2025-11-11 13:47:04.814',	NULL,	'2025-10-12 13:47:04.816'),
('c8bcacb8-185f-4681-880f-40d6e0cd7355',	12,	'35e7ffbddfad0acf46f1c728a95aa72610c92a9d106de047a65affcc921cc0c0',	'2025-11-11 14:33:45.862',	'2025-10-13 14:09:47.512',	'2025-10-12 14:33:45.864'),
('c900d509-8c8c-4dd3-aa39-c50084a5580d',	1,	'ad7ed58f694cc9b0dfc3d5ecf48ee84bbf7a58ac99b92cd2aed96ae46cb3f25a',	'2025-11-09 17:41:43.182',	NULL,	'2025-10-10 17:41:43.184'),
('c95b83bf-2158-4165-bcdb-449231823cfb',	14,	'459ac8cffa721425db5eaff59b6658ca64336f77e2f90d831f971b1aeb8fc338',	'2025-11-12 12:24:55.819',	NULL,	'2025-10-13 12:24:55.825'),
('c9860bab-bd3b-420b-8ac9-260c804fa69c',	1,	'a64938d788af6b6a2f8ae7d0de113c86d6ff1485af65f35520e3060e2170ec0f',	'2025-11-09 18:47:51.408',	NULL,	'2025-10-10 18:47:51.411'),
('cafe0d13-7f06-493f-9be9-2945dde410c7',	13,	'b86e2f2eac445af171d6ff509abd12acb2eb764fcf5e7d7894a8f9122498b79c',	'2025-11-12 12:20:28.062',	NULL,	'2025-10-13 12:20:28.074'),
('cb1f8b94-644d-4ea4-bf83-d4c6799f589d',	4,	'd565a010b74c834b29b468f7db74e6eda07d87e6e082e057571cbdd1342c8c99',	'2025-11-08 18:38:20.886',	'2025-10-10 18:26:39.198',	'2025-10-09 18:38:20.890'),
('cbbf94a8-fdcc-472a-9bac-01db28ca593e',	1,	'63779af781848093ebabc547bbd6c28ca03b7792ef42981b236a54c5de1b9e8c',	'2025-11-09 17:59:50.712',	NULL,	'2025-10-10 17:59:50.715'),
('cc2ade37-c8ad-4ef9-a75b-0254f0e2d037',	12,	'7e51bd08ea6b3d8c2433ddeae11ead2f1aa3713a4f4a7c30b625738973852137',	'2025-11-11 13:47:04.816',	'2025-10-12 13:47:04.911',	'2025-10-12 13:47:04.819'),
('cc31c00d-56cd-4f36-89d0-587f8ce94072',	12,	'1e3c34903ccf7b42154165d27d2d2d00e1a297d1894a227660f982ae30cfa8c3',	'2025-11-11 14:07:15.517',	NULL,	'2025-10-12 14:07:15.520'),
('cc57c42f-795b-4917-89ed-76730736552b',	1,	'4ec3db029bac6ff6c770a002b2ad2d2b9730cf410ede5901f9ea911adc99ee9a',	'2025-11-09 18:49:22.606',	NULL,	'2025-10-10 18:49:22.609'),
('ccd51b1d-8730-4df5-ace1-5e3eb79994da',	1,	'259f593ecfb58cedce8fb0844fc6bbf4b9bde0bae1dec105e3a0f3b454d250b5',	'2025-11-10 01:06:15.061',	NULL,	'2025-10-11 01:06:15.063'),
('ccebf31d-5114-4821-b6c5-0f7f864edc4e',	1,	'efd43a956b6bc8f59c8c5c672a7ac520de44b16deb6502c67356a592a0bf59ea',	'2025-11-12 17:05:53.394',	'2025-10-13 18:01:36.332',	'2025-10-13 17:05:53.404'),
('cd4162e7-a640-404d-a1fa-f019ec3645c9',	4,	'50d537e98672de6fe1098ff8467d05b8286c59d94e704c6170ef3d53a7674497',	'2025-11-09 18:32:41.161',	NULL,	'2025-10-10 18:32:41.165'),
('cd5e36c5-89d0-4728-869e-12631503210a',	3,	'b3ba6247f15001c4ed64516f957da0e49f357ce33cd80555ea41945551aade07',	'2025-11-12 12:19:56.682',	'2025-10-13 12:20:02.153',	'2025-10-13 12:19:56.700'),
('cdb3d993-7b9f-4b11-abd7-b29edf5ba7a7',	3,	'78bb076236dc19f86f9dc150af04afefe17c1a25ef4c23fad54088f025849d95',	'2025-11-12 09:11:40.234',	'2025-10-13 12:13:02.585',	'2025-10-13 09:11:40.245'),
('cdd9cf09-0322-4f5d-a4d2-5d2f009c2e2c',	16,	'4c8c14d22018237f20d61963bcaf38ac5203467e68560bfcc6ae4c701b16c039',	'2025-11-12 16:06:09.915',	'2025-10-13 16:16:30.493',	'2025-10-13 16:06:09.919'),
('cdfab3c8-ee14-4470-b668-5f682456b171',	5,	'1af4f5fb3830b9ae603d109ce45d08d9eb420ceaff292dd0817db33981d39036',	'2025-11-12 13:40:12.442',	NULL,	'2025-10-13 13:40:12.446'),
('ce227bf9-b775-435d-83eb-7d3403e4b20d',	4,	'f9dc850d7c13a229e120754e8a9da0e7fb174d679c45595e90210f0ce1f5eea1',	'2025-11-08 17:43:56.627',	NULL,	'2025-10-09 17:43:56.630'),
('ce499f64-ce05-48f8-b2a9-76be7eb33ad7',	1,	'4f3a6455360d39867f29a5caa4d5db40701772bb7db1b0c1896a480f9bb99bee',	'2025-11-09 17:41:16.200',	NULL,	'2025-10-10 17:41:16.203'),
('d11b9323-a987-4608-b283-804af23f8e37',	2,	'c2d8b88bbeb73b04436d52da1aa0fd0240baa5ba9915a7bdb028bfce8277a1cd',	'2025-11-12 13:56:25.830',	'2025-10-13 13:58:04.639',	'2025-10-13 13:56:25.832'),
('d1db5cce-3a82-48dd-8ca7-d6ea86702801',	1,	'1faefe7e1c257ddf48dcd4a1afd7dc58dd374b2b7530003f53759bb32f7f468f',	'2025-11-12 18:01:08.394',	'2025-10-13 18:01:22.963',	'2025-10-13 18:01:08.401'),
('d26043ee-2529-4706-bd6d-3a8a786970af',	1,	'60ab92287a2349063d1d105e81cc745779b5ccaae5a6772cca82fda75d0f568c',	'2025-11-10 01:08:40.294',	NULL,	'2025-10-11 01:08:40.296'),
('d33972f7-820c-45bb-8f23-7206f3345fa1',	9,	'f447684222a1798c1612c057077c101a314a867f965654f428985455f12a76e7',	'2025-11-11 13:45:01.129',	NULL,	'2025-10-12 13:45:01.133'),
('d3bdcf1c-55dd-4dee-949b-7532c932dad9',	2,	'65bfdddc3e57cc714acf3ae28ad60a32a82a00ff2c88f1cc9943e8c585dd8e39',	'2025-11-12 14:48:07.789',	NULL,	'2025-10-13 14:48:07.796'),
('d3ce4fcc-bac8-4a2d-b905-bf2aa35776cf',	1,	'11c703eb1d00ed26a578826ec036e7de3e895035f8a2216fa4d1e8652e724cd6',	'2025-11-12 13:24:53.371',	'2025-10-13 13:25:47.763',	'2025-10-13 13:24:53.379'),
('d3e50bc4-2932-42f8-a0aa-d8df99ed64af',	6,	'5aed41d61e067fbac2d8c8c9f6a20c40dc864af43d148b193c8762e4959e91b1',	'2025-11-12 17:52:35.390',	'2025-10-13 17:57:30.132',	'2025-10-13 17:52:35.394'),
('d4890f37-04d6-44ae-84c6-a706e1f989b2',	3,	'b379c46ff96754e0b47d8b399c2a3d55f43e3cdf8ef6dfa25642119c49556486',	'2025-11-12 12:20:02.150',	'2025-10-13 12:20:18.557',	'2025-10-13 12:20:02.158'),
('d535d581-3bba-4452-a6c6-58fd7fd58c44',	1,	'40b59436dd8255cf7aa3dfc8482cd6ec06baa27fdc1c3b3a8f7d492dcd271f3c',	'2025-11-09 18:21:35.986',	'2025-10-10 18:21:47.456',	'2025-10-10 18:21:35.990'),
('d5886e74-c759-4be9-be97-bba29186352f',	1,	'c464cd0a0402cf0f862d2dcadc930714ce34b400b8134f9d26b574a86e2bf339',	'2025-11-09 23:18:36.402',	NULL,	'2025-10-10 23:18:36.404'),
('d65df988-d3fe-4f0c-9bc3-1f8eaddc729c',	1,	'07628edbc60b3c13adb869b22c926781e4f1cb9684db35b923fec6b995053f2b',	'2025-11-12 18:01:22.962',	NULL,	'2025-10-13 18:01:22.965'),
('d73957e6-3a2c-490c-b18f-80524dc10714',	2,	'f448303511c78e206d05f7d6d643e410a8726c5323cb7c5415d80019ff841d2c',	'2025-11-09 17:37:44.025',	NULL,	'2025-10-10 17:37:44.027'),
('d83206aa-b218-4b35-9cee-38784c5a8c2c',	12,	'1a5e52ba5b5a1e03b495a63f4a2337f646e91fba5556a1e0b25f6a4c4eeecfe2',	'2025-11-11 14:04:48.863',	'2025-10-12 14:07:15.521',	'2025-10-12 14:04:48.868'),
('d8782a7e-8b03-47a3-9950-2134d7e5c7da',	17,	'72dd0a56914f7f3587508140dd561e6c1d0caff25d07922497e53459ecd28679',	'2025-11-12 17:41:52.850',	NULL,	'2025-10-13 17:41:52.856'),
('d8dfacc7-9ad5-4a2b-98b6-cc89c46456fd',	1,	'f62799363e6d4d73be7795fc855f75a53ad4d740b898bec948f0119d869f81de',	'2025-11-09 16:06:22.032',	NULL,	'2025-10-10 16:06:22.037'),
('d918a2d8-38cc-40ec-a922-a9910bc3a526',	2,	'053b29bf2b8ce82f69a23cae291beea67cce6f33862d2046c7f60169a6d2a471',	'2025-11-08 17:23:55.296',	'2025-10-09 17:27:25.213',	'2025-10-09 17:23:55.300'),
('d9dfdd47-2310-4a77-8bed-259cc7f2211e',	6,	'0a2e9fc1d053f9313ff0ebe496cdb29bc1026a6089aeff1d7e244573f1726c30',	'2025-11-08 17:58:26.335',	'2025-10-09 17:58:26.613',	'2025-10-09 17:58:26.337'),
('da422e83-1b15-4980-9517-ae362cbb8c09',	1,	'41f72ce40377cccbc3b1d4344b7fc5c71a3ac615ceb4481056ef7f68481fedf5',	'2025-11-11 18:04:49.895',	'2025-10-12 18:11:05.591',	'2025-10-12 18:04:49.898'),
('da44440d-0554-44ac-97a5-7c53fd6cb0c6',	2,	'9c47938eca99401511da5d3ea7d4b30503c929ac1b5db59445e24f2ffe1214e5',	'2025-11-12 09:06:36.453',	NULL,	'2025-10-13 09:06:36.460'),
('daa892e5-8fdf-4219-8b1e-a2f95a0c2a79',	17,	'12f652261d51de049935afca14b5f05ba90136e57724be29daec7c4ab4715632',	'2025-11-12 15:54:34.334',	'2025-10-13 15:54:34.675',	'2025-10-13 15:54:34.336'),
('dab78ce5-5c39-4208-9215-17c566376bf2',	1,	'7732d42ce2653e006fa7a2a6884a4620130e4b31a01aa9b9c1b87cc62dcb6cbc',	'2025-11-09 17:50:04.820',	'2025-10-10 17:50:05.198',	'2025-10-10 17:50:04.826'),
('dabc0aaa-128c-4c62-907a-5c2a8997a579',	3,	'28544cadfdb509396a84187e9f1c4d09eb00b3cfd69f0513825a69aaa0dcf550',	'2025-11-12 12:47:44.111',	NULL,	'2025-10-13 12:47:44.115'),
('dcf8fba8-9ad1-4947-87dc-a5d1dc3dc3b2',	1,	'044b5f620e45ed69cca037a8f1ffd159daf11d3b3697c0e006fda84d810628a5',	'2025-11-09 18:49:32.566',	'2025-10-10 18:55:26.583',	'2025-10-10 18:49:32.569'),
('dd553448-f6db-4872-a442-6025d21b4cf1',	2,	'0192cb8519f90dc7162eabcf03b541bfb0ecc84cbc7751ab1a3431892aeae4e7',	'2025-11-11 13:34:09.200',	NULL,	'2025-10-12 13:34:09.202'),
('dda73529-fea3-46ec-88fe-74d0756cba7d',	1,	'9560e15aaf98a330b914b4bcbf663e9fd548f4c534bf76033cae5db11d231cc8',	'2025-11-09 17:50:04.819',	NULL,	'2025-10-10 17:50:04.823'),
('deb6cfc7-0c47-4108-b1d4-acc69c04fd35',	3,	'914d6296adbf380dbdcc13179ca716cc88307a0276c5db789b1499a84dd1a31e',	'2025-11-12 08:10:07.169',	NULL,	'2025-10-13 08:10:07.173'),
('df34f888-d991-4b83-88ca-1cd8c0314601',	13,	'9baa4e2718382fed061d4aa5435fd03d7a4d7ff24f32a508be0f37de82af65d2',	'2025-11-12 12:16:05.184',	'2025-10-13 12:20:28.068',	'2025-10-13 12:16:05.188'),
('dfcac50a-b545-4ef1-8819-06bb95753adb',	12,	'38ae493b8d7193dba1462b90096e43387058a4f08475041e7141900dc4ea0d60',	'2025-11-12 14:19:16.274',	NULL,	'2025-10-13 14:19:16.288'),
('e069c4b2-13ca-464b-aead-06dbbd0b86f8',	6,	'2d96de2d1bffad24674b7fe626c5d9ee9ff9190bdef9cbc78b36fd022cb16046',	'2025-11-08 18:35:08.281',	NULL,	'2025-10-09 18:35:08.285'),
('e0b171ed-6ca9-4c7a-bc19-5531dbb90807',	1,	'ccefb55ccbb17133e97f2992a7cd2edf386d0648734478711957f64b3d917594',	'2025-11-11 18:11:05.589',	'2025-10-13 12:34:59.904',	'2025-10-12 18:11:05.595'),
('e177d3e5-6369-4d88-84e9-f193832bd431',	1,	'26838cb76e33f3087a2c36d4b029b02b767adf0695f3aa9286aa3779652b7550',	'2025-11-09 16:19:53.495',	'2025-10-10 16:24:15.531',	'2025-10-10 16:19:53.497'),
('e1888565-3186-4d05-9c18-fc5f3b4f7bd5',	12,	'1351403cb05e1f8c2c81e338cad96c7aa0ae5da01122cc1b4e440cd987f24653',	'2025-11-12 14:29:21.990',	NULL,	'2025-10-13 14:29:21.995'),
('e1bb8142-0fc0-40d1-a2d9-ddbbdfc9b7c0',	1,	'053301b98f8e5575f8b2a1ec44d821734d3a9be04c68c5665640fdef259eec72',	'2025-11-10 01:07:29.627',	NULL,	'2025-10-11 01:07:29.629'),
('e2144598-d68c-4073-8e2c-9f06899ab4e1',	5,	'c41489e33e2c8db9afd773767ebb8a1504893591233a548ed57329f48a18790f',	'2025-11-08 18:16:06.345',	'2025-10-09 18:16:19.102',	'2025-10-09 18:16:06.349'),
('e2352b7e-0c32-4c07-bf2c-0a8d9fb686af',	1,	'9f386af98095ad7fa2bc7ebd2a95944737f21b0ed6987be4efaf387d10158ce2',	'2025-11-09 15:18:13.760',	'2025-10-10 15:18:43.277',	'2025-10-10 15:18:13.764'),
('e28ff22f-424f-4e27-b3a9-8eef5e89206e',	1,	'0e3085fbfe6b1a6c5ea754b914baffa0be037b738d1edb1c49f7eb78ef3bfe50',	'2025-11-09 19:07:13.968',	'2025-10-10 19:07:18.164',	'2025-10-10 19:07:13.975'),
('e2bad4db-11ef-4b29-8fd3-61aa1c90f0de',	12,	'64e4ff903f77187c9bbbfe995ac7e20f4576c4e5026bd4fa0a60e4709428d77b',	'2025-11-11 13:53:34.684',	NULL,	'2025-10-12 13:53:34.688'),
('e39a6e85-db11-4ce9-a336-237cface5613',	13,	'1be8c5b0c9d6ffec041efe37a4133ae11589460cc2c4d2c148f1977a92e98845',	'2025-11-12 12:16:04.954',	'2025-10-13 12:16:05.185',	'2025-10-13 12:16:04.958'),
('e459c0a2-7c88-4097-857f-e6413a5d971d',	1,	'ed001825d7cb7866366cae46d522b387cbcb204ca38278e3fd4c0f8a61772e0f',	'2025-11-09 18:49:22.607',	'2025-10-10 18:49:28.255',	'2025-10-10 18:49:22.611'),
('e462fecf-5cdd-4979-afd8-d6a8d1b37e7f',	4,	'0b3209118cbcc8283805a458c1fdbdde9ba4cba60f5afcd96f1bb008d3a0b813',	'2025-11-09 18:31:15.619',	'2025-10-10 18:31:53.691',	'2025-10-10 18:31:15.624'),
('e49f5723-cae1-42b1-b817-01adbf7cd1bf',	9,	'ff6921dec959a122aa31c8c2e15614939befe96f2c10ce5b1bbdc9cdaae617b3',	'2025-11-12 14:50:12.095',	NULL,	'2025-10-13 14:50:12.101'),
('e4a8a6ff-9f52-41e1-af18-c59c109d7de0',	12,	'4727779e8f61b0d146c78754eeb1f7da7d9e6d32fa4ce706ab37a446b1b648f3',	'2025-11-11 13:59:41.234',	NULL,	'2025-10-12 13:59:41.238'),
('e4e33bf2-fee2-47a8-89ac-6aad031b4e05',	1,	'a5fc1506ed1e5c907f56ad910ff7866e83a9ad0a51ee49a38a65353dafc394d3',	'2025-11-12 12:32:38.697',	'2025-10-13 13:24:53.379',	'2025-10-13 12:32:38.703'),
('e5259144-a9db-45a0-832f-2cfe7f808253',	17,	'51317fdddd9b9eb4ad249c120217472b9dcb14cade86cbed30f4e324948b31d8',	'2025-11-12 15:54:34.674',	'2025-10-13 15:55:19.892',	'2025-10-13 15:54:34.678'),
('e5b959e9-0328-4731-87d2-591606ead28d',	2,	'42752ad547ea2bbab567446b2de89745a90e6c7ebee7f0dd3346e03a6560acc6',	'2025-11-12 08:44:58.379',	'2025-10-13 09:04:41.811',	'2025-10-13 08:44:58.416'),
('e8855e16-5cfe-43e2-b920-538d73fa824c',	2,	'f895bde41ecc5fbe4982bc3ebbfe6454b6a8ce8792ba088a148f53c118f0897a',	'2025-11-12 09:05:43.688',	'2025-10-13 09:06:36.460',	'2025-10-13 09:05:43.690'),
('e8efc158-5f69-4d11-8b4e-8cd05abccec6',	1,	'96884661a4363fb40153909d9fe8add81b7e4d2b5f209b17a385aa03e8bec76e',	'2025-11-12 12:34:59.903',	NULL,	'2025-10-13 12:34:59.907'),
('e913165d-2490-4a22-be72-db8323495a83',	1,	'6612c9413d999bad71e857fb083f9d32f95f568763c1330b7c16c5fd6b6a4bde',	'2025-11-09 16:11:13.368',	NULL,	'2025-10-10 16:11:13.371'),
('e980027e-e4c1-4841-bb36-a479fec20eca',	9,	'619e4a3f3a055fd0b367301fbc9f91c79e4ef0f6e35c10b0d93faa41db4785f3',	'2025-11-09 16:19:06.609',	NULL,	'2025-10-10 16:19:06.612'),
('ea491801-9b30-4870-bad5-7e2895b84deb',	1,	'd196783ccf3d383ffaf43c93b29ec38181db94f2fcc1a408841329b534ce58dd',	'2025-11-12 13:39:17.062',	NULL,	'2025-10-13 13:39:17.068'),
('eac238d2-5778-4a2b-86e4-a90809e59047',	1,	'f88d1fbf08902ba0bb3dd9b1ecc39aa50c3cfff524cb5427e4be37d493fc81e8',	'2025-11-09 20:29:33.634',	NULL,	'2025-10-10 20:29:33.637'),
('ec4601fe-16cc-4362-a536-5c8599aae77a',	4,	'6c86b71b74d6a9a20feefe9396df898373e5a7946bf1391ccd75ac0beb0393ba',	'2025-11-08 17:43:27.732',	'2025-10-09 17:43:56.628',	'2025-10-09 17:43:27.737'),
('ed8e3e4f-a004-4196-b856-c1200ace65c3',	7,	'a125a1f70bddd33811999c80414daf25c31e9a8387753be7eb1960c28b09ef45',	'2025-11-09 10:33:28.580',	'2025-10-10 10:37:00.342',	'2025-10-10 10:33:28.584'),
('ee0a5de7-9f18-4ffd-9d21-80771e569b25',	1,	'2c6635b5d671771003dfe7607680c1bc0304b984bacbca19deb62c0c611582df',	'2025-11-11 18:37:09.530',	NULL,	'2025-10-12 18:37:09.537'),
('ee3190af-f4ee-4820-a8eb-af3f0a130325',	12,	'4fafe0d78057176480674fbe8aee2aac3885f1dd44d7e37f12d86500734ba0f2',	'2025-11-11 13:53:30.766',	NULL,	'2025-10-12 13:53:30.771'),
('ef989df3-cd9e-44a8-af79-5ca138737dab',	4,	'27298113a22dfb119df4e7322d3e2dc62c04ee199bc74432adc421345e568f6a',	'2025-11-08 19:12:25.696',	'2025-10-09 19:12:30.853',	'2025-10-09 19:12:25.700'),
('efce0706-3e37-4c9e-adbd-c0221e908292',	6,	'c8d902f5bd5423d88934b569bfe26ce8e5289cb1470cbc87e426ae2e8235b945',	'2025-11-08 18:26:52.868',	'2025-10-09 18:26:53.150',	'2025-10-09 18:26:52.870'),
('eff39133-08df-48ba-8595-72625d635b99',	9,	'05cf2bc777956de528f7ffcd17f363b5018fcccddf4a1dd013336283b28b5d14',	'2025-11-12 14:48:38.327',	NULL,	'2025-10-13 14:48:38.330'),
('f02146e7-57cf-46cd-8d18-c30a6089d6ba',	1,	'0c1486f71570877cbbfa02257573922182b436ca61cb3181c1e8556f700af167',	'2025-11-09 22:40:49.554',	NULL,	'2025-10-10 22:40:49.558'),
('f0c580da-9948-462c-8341-fc67abcaa8a6',	5,	'8879a69b739d4ae37f9430816a428d6f3e1e1f7bc6fbb72c9aef2e007053dec1',	'2025-11-08 18:00:19.146',	'2025-10-09 18:09:10.162',	'2025-10-09 18:00:19.150'),
('f1301137-8ea4-466f-a3b0-43280e4df140',	2,	'd0ef45a092c58bef436009ffbf0590fcb4e7ac19032e4f9927b54b2118b7cc37',	'2025-11-11 13:27:28.794',	'2025-10-12 13:34:05.978',	'2025-10-12 13:27:28.796'),
('f156cdd5-acd8-4d72-9808-5fd29c783616',	7,	'c07cf31ee475a4f04f4483b428fd692715ceb2f2707ef2e6f1b2ae4602249296',	'2025-11-09 10:37:00.341',	'2025-10-10 10:39:25.356',	'2025-10-10 10:37:00.345'),
('f1ff2d0b-7260-4fdd-8f69-f5e36437d25a',	12,	'12949c1b89d09c9894db2f800d2e15b497cdb49a7b2162c174e086810f23f519',	'2025-11-11 14:33:45.790',	NULL,	'2025-10-12 14:33:45.795'),
('f2685112-6438-4a3c-ab70-28f97fb9e25e',	1,	'4c8a5670c8408bdeac464bc88935841a0479ab0200adec8a0e0c64b58d70867b',	'2025-11-09 18:21:32.191',	NULL,	'2025-10-10 18:21:32.195'),
('f3cc671c-14b3-4fd9-a3cf-81d7623aed85',	2,	'd43270574db9d1a4f8ca3ba9e391783ba0d83b0752e9573ad2116b879af5bd6f',	'2025-11-12 09:04:41.811',	NULL,	'2025-10-13 09:04:41.817'),
('f52d085f-2109-4372-b7d5-74df7d6c2c2a',	5,	'2f1816e8d4f59ca52f5122216e1e12a0643db4950f8bebc40dc63ac7200c8252',	'2025-11-08 18:11:59.841',	'2025-10-09 18:16:06.346',	'2025-10-09 18:11:59.844'),
('f59629b2-c5dd-401a-a197-6f3d17544eea',	1,	'7a26d328654bae150dd53d23f9e1072428ce1d85c3dba7922b92961237d6cd8b',	'2025-11-12 15:39:59.581',	'2025-10-13 16:50:07.311',	'2025-10-13 15:39:59.585'),
('f6b27e15-ae16-4c0e-9d9d-4f708f882ebf',	1,	'96c9dae3baa90cbb5721f491ab37ffec05d8d5960fc89ad682716298b0230953',	'2025-11-12 17:26:40.860',	'2025-10-13 17:38:02.275',	'2025-10-13 17:26:40.868'),
('f6d27266-162d-4c3d-a37f-342ac3b35547',	1,	'49d2003804112bd8f3aae6c2080808cb4415fa99cdb143196eb23a8250c7dad8',	'2025-11-12 13:42:27.848',	NULL,	'2025-10-13 13:42:27.851'),
('f79a89af-764b-4c60-b4bd-3475879f9992',	17,	'af34dbdcf0bdd22a6b99861e0160bc7c48244161c14ab8e291aea09091779435',	'2025-11-12 16:06:07.003',	'2025-10-13 16:26:21.695',	'2025-10-13 16:06:07.015'),
('f7d92ecc-c23b-42a4-980d-fee3693f20e8',	2,	'78b6971b8881d97bba58c43c6a3d196b5ad11ab772ff863a841cd358ae32293a',	'2025-11-09 17:21:06.927',	'2025-10-10 17:29:49.255',	'2025-10-10 17:21:06.929'),
('f8500c97-583c-4ed0-bb1a-9b39bd732ead',	1,	'83ed50227be4dd5dcacc5d131375c31416189022d4d772f1736e3fd715cc5149',	'2025-11-10 01:02:54.530',	NULL,	'2025-10-11 01:02:54.532'),
('f8aea600-0619-423d-94e4-053e48485a1e',	1,	'14a1f42e81a7160d185777cf9f7421de234460ae03bb7fb95403baab5292f720',	'2025-11-12 13:39:17.067',	'2025-10-13 13:42:27.852',	'2025-10-13 13:39:17.076'),
('f907eccd-6fde-4823-8dd5-98a1197932bb',	1,	'7f86a34620808f6aef73d727c08ab9aeed11743a6e06d547d430bee5e3b788fc',	'2025-11-09 22:41:00.384',	NULL,	'2025-10-10 22:41:00.387'),
('f9e0f226-5ca6-45ff-bdf8-52e8c5e47a46',	1,	'201aaa2c8d3e3961fd3c42282247423703f43e2c79e59d1bcb1c6103ec847486',	'2025-11-08 19:10:31.879',	'2025-10-10 15:13:21.379',	'2025-10-09 19:10:31.883'),
('fa56c915-a8fd-4ced-b4fd-b0770938e3f8',	1,	'51f4d782c27c5e226c291475364c730f30e165714933185ed4ccd49c283db3ce',	'2025-11-10 00:55:26.966',	NULL,	'2025-10-11 00:55:26.970'),
('faaec45e-b08b-4ac9-b89c-c206098517e4',	2,	'21f3058f05f092255eaf858047bb9a65c11510d171ba7869cb16cb183bb0dcf2',	'2025-11-09 16:33:23.230',	NULL,	'2025-10-10 16:33:23.234'),
('fad02343-9a86-491c-a0cb-597504cab9ee',	1,	'54742004bee7ea41c6aa93588285442de714e6df609bad57cf3aacfd763b000f',	'2025-11-08 18:31:00.549',	'2025-10-09 19:10:31.880',	'2025-10-09 18:31:00.552'),
('fbb44804-dfa8-4d7a-8a84-8a47a8ca6f17',	1,	'dcf2cb9bccb7890e4d47f724a526169c8bcacfbcacba5b9e2cc8f8b9ba283587',	'2025-11-09 18:48:59.850',	'2025-10-10 18:49:04.476',	'2025-10-10 18:48:59.854'),
('fbcb40c6-7073-4a49-bec5-9a8b89754574',	1,	'21165d975d36b06a0d5e69d203f04f0d4187c12b491c0e85e19bc6b10e960ea3',	'2025-11-09 18:47:51.409',	'2025-10-10 18:47:57.154',	'2025-10-10 18:47:51.417'),
('fc1efa14-0b3e-43e0-98d7-5cc084e9db56',	1,	'a00d262bd8e97df633d2eb08dab181c0167bd5ddb1f68133bc35b6c0f2f88b00',	'2025-11-08 17:44:39.131',	'2025-10-09 17:45:19.396',	'2025-10-09 17:44:39.135'),
('fcb973b9-ef5b-45cd-813d-d0b063acb807',	3,	'dd070eac56754ffebc5bdfc51aac02aa0b48cf6a155b71288ee54a0f7d2662f1',	'2025-11-12 12:47:44.116',	'2025-10-13 13:33:31.168',	'2025-10-13 12:47:44.126'),
('fd0c423a-267b-4e46-aa24-bb4ff98f72f2',	4,	'ebc258a7e3dc1a4da5d1a97775632a034b2e910d6c3ac2a9044d3c504ced892c',	'2025-11-08 17:39:07.029',	'2025-10-09 17:39:07.329',	'2025-10-09 17:39:07.031'),
('fd33f697-9158-4669-ae15-39cdbb0dd0fa',	9,	'5d2dc77c7febafdcbd9bc87f0c013631e75a2760842e8fffe1694f698ce94103',	'2025-11-12 15:37:54.947',	'2025-10-13 15:39:29.050',	'2025-10-13 15:37:54.949'),
('fd45b089-571d-4a11-a246-bffcdb07c7b1',	2,	'12f0226c8486fcef526b1473bf9ee8ec4d35eb755ea5d4e4874def155065a5f7',	'2025-11-09 19:25:25.643',	NULL,	'2025-10-10 19:25:25.647'),
('ff578aa0-9ffa-4144-bbc0-ce2a86867478',	2,	'7e7480230a64073b7acd5c3c7eecc9a905bf6212ba1c86858a4c8995a36a6f7a',	'2025-11-12 09:05:43.607',	NULL,	'2025-10-13 09:05:43.612');

DROP TABLE IF EXISTS `rep_events`;
CREATE TABLE `rep_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `practiceId` int(11) DEFAULT NULL,
  `delta` int(11) NOT NULL,
  `reasonCode` varchar(191) NOT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rep_events_userId_practiceId_reasonCode_key` (`userId`,`practiceId`,`reasonCode`),
  KEY `rep_events_userId_idx` (`userId`),
  KEY `rep_events_practiceId_idx` (`practiceId`),
  CONSTRAINT `rep_events_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rep_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rep_events` (`id`, `userId`, `practiceId`, `delta`, `reasonCode`, `comment`, `createdAt`) VALUES
(1,	5,	3,	-1,	'REP_FROM_PRACTICE',	'Шаг к целевому значению REP = 0',	'2025-10-09 21:05:00.121'),
(2,	6,	3,	-1,	'REP_FROM_PRACTICE',	'Шаг к целевому значению REP = 0',	'2025-10-09 21:05:00.137');

DROP TABLE IF EXISTS `scales`;
CREATE TABLE `scales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fingerprint` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `scales_fingerprint_key` (`fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scales` (`id`, `fingerprint`) VALUES
(2,	'2fb183cf331e625415ec9cf19ac97469bedfbfd1080cf43156fe50b774f21643'),
(1,	'6585bba7604672f450f06bbe7bcec40847ad6eee7dc7028d7e9e3a6c904f310f'),
(3,	'933e8d87cb2a68aa5c7b20da593a5082eb2d647e25b541c9121a1f7d9e01dfd9');

DROP TABLE IF EXISTS `scale_options`;
CREATE TABLE `scale_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scaleId` int(11) NOT NULL,
  `label` varchar(191) NOT NULL,
  `value` int(11) NOT NULL,
  `ord` int(11) NOT NULL DEFAULT 0,
  `countsTowardsScore` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `scale_options_scaleId_ord_key` (`scaleId`,`ord`),
  CONSTRAINT `scale_options_scaleId_fkey` FOREIGN KEY (`scaleId`) REFERENCES `scales` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scale_options` (`id`, `scaleId`, `label`, `value`, `ord`, `countsTowardsScore`) VALUES
(1,	1,	'Очень плохо',	-2,	0,	1),
(2,	1,	'Скорее плохо',	-1,	1,	1),
(3,	1,	'Средне',	0,	2,	1),
(4,	1,	'Хорошо',	1,	3,	1),
(5,	1,	'Отлично',	2,	4,	1),
(6,	2,	'НЕТ',	-2,	0,	1),
(7,	2,	'50/50',	-1,	1,	1),
(8,	2,	'ДА',	1,	2,	1),
(9,	2,	'?',	2,	3,	0),
(10,	3,	'плохо',	-1,	0,	1),
(11,	3,	'хорошо',	0,	1,	1),
(12,	3,	'отлично',	1,	2,	1);

DROP TABLE IF EXISTS `scenarios`;
CREATE TABLE `scenarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdByUserId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `scenarios_createdByUserId_fkey` (`createdByUserId`),
  CONSTRAINT `scenarios_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scenarios` (`id`, `title`, `version`, `createdAt`, `updatedAt`, `createdByUserId`) VALUES
(1,	'наблюдатель общ + выявление + презентация',	1,	'2025-10-09 17:33:56.926',	'2025-10-09 17:33:56.926',	1);

DROP TABLE IF EXISTS `scenario_forms`;
CREATE TABLE `scenario_forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scenarioId` int(11) NOT NULL,
  `role` enum('SELLER','BUYER','MODERATOR') NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `descr` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `scenario_forms_scenarioId_role_key` (`scenarioId`,`role`),
  CONSTRAINT `scenario_forms_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scenario_forms` (`id`, `scenarioId`, `role`, `title`, `descr`, `createdAt`, `updatedAt`) VALUES
(1,	1,	'SELLER',	'Форма продавца',	'Сценарий для продавца',	'2025-10-09 17:33:56.929',	'2025-10-09 17:33:56.929'),
(2,	1,	'BUYER',	'Форма покупателя',	'Сценарий для покупателя',	'2025-10-09 17:33:56.973',	'2025-10-09 17:33:56.973'),
(3,	1,	'MODERATOR',	'Форма модератора',	'Сценарий для модератора',	'2025-10-09 17:33:56.986',	'2025-10-09 17:33:56.986');

DROP TABLE IF EXISTS `scenario_form_blocks`;
CREATE TABLE `scenario_form_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formId` int(11) NOT NULL,
  `type` enum('TEXT','QA','SCALE_SKILL_SINGLE','SCALE_SKILL_MULTI') NOT NULL,
  `title` text DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `position` int(11) NOT NULL,
  `scaleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scenario_form_blocks_formId_position_idx` (`formId`,`position`),
  KEY `scenario_form_blocks_scaleId_idx` (`scaleId`),
  CONSTRAINT `scenario_form_blocks_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `scenario_forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scenario_form_blocks_scaleId_fkey` FOREIGN KEY (`scaleId`) REFERENCES `scales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scenario_form_blocks` (`id`, `formId`, `type`, `title`, `required`, `position`, `scaleId`) VALUES
(1,	1,	'TEXT',	'Теперь проставим оценки продавцу\nДоверие\n1 Может навредить. 2 что-то не то. 3. Обычный продавец 4. Вроде, разбирается. 5 эксперт.\n\nВыявление потребности\n1 совсем не понял что надо. 2 важное не понял. 3 частично. 4. Вважное – понял, нюансы - нет. 5. Точно понял, что клиенту надо. \n\nПрезентация на основе потребности\n1 предложение вызвало негатив или не было сделано. 2 совсем не интересно 3 как у всех 4 интересно, но есть сомнения 5 надо брать! \n\nРабота с возражениями        \n1 это продавец не смог понять возражений. 2 выявил, но  не смог снять важные . 3 частично их снял. 4 возражения были поняты и сняты, хотя у клиента остались сомнения. 5 возражений не было или они были полностью сняты.\n\nСделка заключена или нет Либо \"очень плохо\" либо \"отлично\"',	1,	0,	NULL),
(2,	1,	'SCALE_SKILL_MULTI',	'',	1,	1,	1),
(3,	1,	'SCALE_SKILL_SINGLE',	'',	1,	2,	2),
(4,	1,	'QA',	'Оцените продавца',	1,	3,	NULL),
(5,	2,	'SCALE_SKILL_MULTI',	'',	1,	0,	3),
(6,	3,	'SCALE_SKILL_MULTI',	'',	1,	0,	3);

DROP TABLE IF EXISTS `scenario_form_block_items`;
CREATE TABLE `scenario_form_block_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blockId` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `position` int(11) NOT NULL,
  `skillId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `scenario_form_block_items_blockId_position_key` (`blockId`,`position`),
  KEY `scenario_form_block_items_skillId_idx` (`skillId`),
  CONSTRAINT `scenario_form_block_items_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `scenario_form_blocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scenario_form_block_items_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scenario_form_block_items` (`id`, `blockId`, `title`, `position`, `skillId`) VALUES
(1,	2,	'Доверие',	0,	1),
(2,	2,	'Выявление потребности',	1,	2),
(3,	2,	'Презентация',	2,	3),
(4,	2,	'Работа с возражениями',	3,	4),
(5,	2,	'Закрытие сделки',	4,	5),
(6,	3,	'Продал важность ответы на вопросы',	0,	2),
(7,	3,	'Задает открытые вопросы',	1,	2),
(8,	3,	'Вопросы понимания и полноты',	2,	2),
(9,	3,	'Наводящие вопросы',	3,	2),
(10,	3,	'Понимает потребительский опыт (позитив/негатив)',	4,	2),
(11,	5,	'Логичность поведения',	0,	6),
(12,	5,	'Эмоциональная достоверность',	1,	7),
(13,	5,	'Цельность образа',	2,	8),
(14,	6,	'Управление процессом',	0,	9),
(15,	6,	'Тайминг',	1,	10),
(16,	6,	'Обаяние',	2,	11);

DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skills_code_key` (`code`),
  KEY `skills_name_id_idx` (`name`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `skills` (`id`, `name`, `code`) VALUES
(1,	'Доверие',	'TRUST'),
(2,	'Выявление потребности',	'NEEDS_DISCOVERY'),
(3,	'Презентация',	'PRESENTATION'),
(4,	'Работа с возражениями',	'OBJECTION_HANDLING'),
(5,	'Закрытие сделки',	'CLOSING'),
(6,	'Логичность поведения',	'LOGICAL_BEHAVIOR'),
(7,	'Эмоциональная достоверность',	'EMOTIONAL_AUTHENTICITY'),
(8,	'Цельность образа',	'PERSONAL_INTEGRITY'),
(9,	'Управление процессом',	'PROCESS_MANAGEMENT'),
(10,	'Тайминг',	'TIMING'),
(11,	'Обаяние',	'CHARISMA'),
(12,	'Активное слушание',	'ACTIVE_LISTENING'),
(13,	'Подстройка под клиента',	'MIRRORING_AND_PACING'),
(14,	'Уточняющие вопросы',	'PROBING_QUESTIONS'),
(15,	'Выгоды vs характеристики',	'BENEFITS_NOT_FEATURES'),
(16,	'Демонстрация продукта',	'PRODUCT_DEMO'),
(17,	'Создание ценности',	'VALUE_CREATION'),
(18,	'Переговоры о цене',	'PRICE_NEGOTIATION'),
(19,	'Апселл и кросс-селл',	'CROSS_UP_SELL'),
(20,	'Последующее сопровождение',	'POST_SALE_FOLLOW_UP');

DROP TABLE IF EXISTS `storage_objects`;
CREATE TABLE `storage_objects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` enum('MINIO','EXTERNAL_S3') NOT NULL DEFAULT 'MINIO',
  `bucket` varchar(191) NOT NULL,
  `objectKey` varchar(191) NOT NULL,
  `contentType` varchar(191) DEFAULT NULL,
  `sizeBytes` int(11) DEFAULT NULL,
  `etag` varchar(191) DEFAULT NULL,
  `publicUrl` varchar(1024) NOT NULL,
  `visibility` enum('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `storage_objects_provider_bucket_objectKey_key` (`provider`,`bucket`,`objectKey`),
  KEY `storage_objects_bucket_idx` (`bucket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `storage_objects` (`id`, `provider`, `bucket`, `objectKey`, `contentType`, `sizeBytes`, `etag`, `publicUrl`, `visibility`, `createdAt`) VALUES
(1,	'EXTERNAL_S3',	'lms-tg-app',	'practices/3/recordings/7088b578-82e1-4c27-afac-d171c9feca0d.webm',	'video/webm',	14996679,	'7ca9c5c62fe1e8ace732ee3f8eedadba',	'https://d94341d1-4c43-49b5-b291-b632ac8592dd.selstorage.ru/practices/3/recordings/7088b578-82e1-4c27-afac-d171c9feca0d.webm',	'PUBLIC',	'2025-10-09 18:30:52.334'),
(6,	'MINIO',	'lms-storage',	'559574c1-3b02-47b6-9b7e-c690bfff4660.png',	'image/png',	63812,	'1c3f13fa5fff38bc8d84977d3db40704-1',	'https://s3.bitwiresys.ru/lms-storage/559574c1-3b02-47b6-9b7e-c690bfff4660.png',	'PUBLIC',	'2025-10-12 10:06:42.280'),
(7,	'MINIO',	'lms-storage',	'96a00c9f-8a40-4e24-bbbc-351d6fa784c1.svg',	'image/svg+xml',	9488,	'e649185236044dd8409a2a7f18c711c3-1',	'https://s3.bitwiresys.ru/lms-storage/96a00c9f-8a40-4e24-bbbc-351d6fa784c1.svg',	'PUBLIC',	'2025-10-12 13:28:43.498'),
(8,	'MINIO',	'lms-storage',	'a5990e78-48a5-4f50-8cb9-6f216a8acb0d.pdf',	'application/pdf',	61046,	'6eb70513f3be436f19241848a8b23396-1',	'https://s3.bitwiresys.ru/lms-storage/a5990e78-48a5-4f50-8cb9-6f216a8acb0d.pdf',	'PUBLIC',	'2025-10-12 13:30:12.585'),
(9,	'MINIO',	'lms-storage',	'729d2fc9-3f30-48d5-a131-f9b954405f5b.png',	'image/png',	15937,	'4a4014fd2c127b34980b71289643021d-1',	'https://s3.bitwiresys.ru/lms-storage/729d2fc9-3f30-48d5-a131-f9b954405f5b.png',	'PUBLIC',	'2025-10-13 08:45:23.159'),
(10,	'MINIO',	'lms-storage',	'979c785c-27dd-438c-aa0b-cce71c54921a.jpg',	'image/jpeg',	2558501,	'334894df306935d60189c55bc5e186bc-1',	'https://s3.bitwiresys.ru/lms-storage/979c785c-27dd-438c-aa0b-cce71c54921a.jpg',	'PUBLIC',	'2025-10-13 09:08:54.791'),
(11,	'MINIO',	'lms-storage',	'f41409fc-ce9c-4e43-a117-3e3d4a05056d.png',	'image/png',	964381,	'08b1299c3931574a5b64218493c1702d-1',	'https://s3.bitwiresys.ru/lms-storage/f41409fc-ce9c-4e43-a117-3e3d4a05056d.png',	'PUBLIC',	'2025-10-13 09:12:23.771'),
(12,	'MINIO',	'lms-storage',	'e004a3a5-2f30-48dd-bc03-8c3405ca565a.mp4',	'video/mp4',	12943120,	'245776c89321e67520290cf0f3c57b36-1',	'https://s3.bitwiresys.ru/lms-storage/e004a3a5-2f30-48dd-bc03-8c3405ca565a.mp4',	'PUBLIC',	'2025-10-13 09:12:41.675'),
(13,	'MINIO',	'lms-storage',	'24c8bbb2-8ad3-4b0b-befe-d853aebc2c17.png',	'image/png',	964381,	'08b1299c3931574a5b64218493c1702d-1',	'https://s3.bitwiresys.ru/lms-storage/24c8bbb2-8ad3-4b0b-befe-d853aebc2c17.png',	'PUBLIC',	'2025-10-13 09:13:56.308'),
(14,	'MINIO',	'lms-storage',	'8125d4d5-930e-4963-bfd3-1b45d2e4e993.mp4',	'video/mp4',	12711058,	'ac2b69fdc03c8106828b46f638689fd5-1',	'https://s3.bitwiresys.ru/lms-storage/8125d4d5-930e-4963-bfd3-1b45d2e4e993.mp4',	'PUBLIC',	'2025-10-13 09:14:23.201'),
(15,	'MINIO',	'lms-storage',	'62ed3545-b8aa-4c42-b616-b7135612136e.jpg',	'image/jpeg',	2558501,	'334894df306935d60189c55bc5e186bc-1',	'https://s3.bitwiresys.ru/lms-storage/62ed3545-b8aa-4c42-b616-b7135612136e.jpg',	'PUBLIC',	'2025-10-13 13:48:25.790'),
(16,	'MINIO',	'lms-storage',	'01501634-0cc5-4ea7-a667-f4e7016de8b9.jpg',	'image/jpeg',	2558501,	'334894df306935d60189c55bc5e186bc-1',	'https://s3.bitwiresys.ru/lms-storage/01501634-0cc5-4ea7-a667-f4e7016de8b9.jpg',	'PUBLIC',	'2025-10-13 13:58:41.174'),
(17,	'MINIO',	'lms-storage',	'6cc6c0c6-857c-4011-81c0-3ba4c861fab0.jpg',	'image/jpeg',	2558501,	'334894df306935d60189c55bc5e186bc-1',	'https://s3.bitwiresys.ru/lms-storage/6cc6c0c6-857c-4011-81c0-3ba4c861fab0.jpg',	'PUBLIC',	'2025-10-13 14:07:10.563'),
(18,	'MINIO',	'lms-storage',	'823d4854-4d46-4078-8b54-8709f313590a.jpg',	'image/jpeg',	2558501,	'334894df306935d60189c55bc5e186bc-1',	'https://s3.bitwiresys.ru/lms-storage/823d4854-4d46-4078-8b54-8709f313590a.jpg',	'PUBLIC',	'2025-10-13 14:08:49.106');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegramId` bigint(20) DEFAULT NULL,
  `telegramUsername` varchar(64) NOT NULL,
  `displayName` varchar(191) DEFAULT NULL,
  `role` enum('ADMIN','CLIENT','MOP') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `hasAccess` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_telegramUsername_key` (`telegramUsername`),
  UNIQUE KEY `users_telegramId_key` (`telegramId`),
  KEY `users_telegramUsername_idx` (`telegramUsername`),
  KEY `users_telegramId_idx` (`telegramId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `telegramId`, `telegramUsername`, `displayName`, `role`, `createdAt`, `updatedAt`, `hasAccess`) VALUES
(1,	1027947243,	'nutonflash',	'Aleksei Kislitsin',	'ADMIN',	'2025-10-10 02:17:51.000',	'2025-10-09 17:20:02.449',	1),
(2,	845165899,	'kwinkich_dev',	'kwinkich ',	'ADMIN',	'2025-10-10 02:18:12.000',	'2025-10-09 17:18:16.327',	1),
(3,	616305943,	'distortionnn',	'Андрей ',	'ADMIN',	'2025-10-10 02:18:30.000',	'2025-10-10 10:31:48.660',	1),
(4,	6911932009,	'sady12354',	'ООО Маркет-Лидерс',	'CLIENT',	'2025-10-09 17:20:49.593',	'2025-10-09 17:39:07.023',	1),
(5,	7002182792,	'sadykovalish12354',	'Sadykov Alisher',	'MOP',	'2025-10-09 17:57:36.985',	'2025-10-09 17:58:34.619',	1),
(6,	6795035224,	'lm_manager_of',	'LM_Manager_Of',	'MOP',	'2025-10-09 17:57:53.290',	'2025-10-09 17:58:26.316',	1),
(7,	1756747942,	'elusive_max',	'Maxim Menshikov',	'ADMIN',	'2025-10-10 10:32:26.721',	'2025-10-10 10:33:28.498',	1),
(8,	NULL,	'adsasdasdsad',	NULL,	'ADMIN',	'2025-10-10 15:15:26.246',	'2025-10-10 16:29:31.010',	0),
(9,	8134838904,	'swoaga',	'ООО Тестовая',	'CLIENT',	'2025-10-10 16:18:44.384',	'2025-10-10 16:19:06.603',	1),
(10,	NULL,	'asdsadasdsadsad',	NULL,	'ADMIN',	'2025-10-10 19:02:44.883',	'2025-10-10 19:02:47.674',	0),
(12,	8356876575,	'gvchjklop',	'первый моп',	'MOP',	'2025-10-12 13:45:26.403',	'2025-10-13 14:50:14.133',	0),
(13,	7378099001,	'onem_manager',	'Тестирование предфинал',	'CLIENT',	'2025-10-13 12:14:09.927',	'2025-10-13 12:16:04.943',	1),
(14,	8242144482,	'testovoevse1',	'Тестовое имя',	'MOP',	'2025-10-13 12:24:49.702',	'2025-10-13 12:24:55.817',	1),
(15,	929973626,	'delggada',	'Andrei Laptev',	'ADMIN',	'2025-10-13 15:43:11.219',	'2025-10-13 15:45:02.784',	1),
(16,	7114247620,	'hamiak10',	'Hamster Master',	'ADMIN',	'2025-10-13 15:47:32.605',	'2025-10-13 15:52:15.063',	1),
(17,	282912905,	'sadykovalish',	'Alisher Sadykov',	'ADMIN',	'2025-10-13 15:50:26.521',	'2025-10-13 15:54:34.328',	1);

DROP TABLE IF EXISTS `user_course_progress`;
CREATE TABLE `user_course_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `completedModules` int(11) NOT NULL DEFAULT 0,
  `progressPercent` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_course_progress_userId_courseId_key` (`userId`,`courseId`),
  KEY `user_course_progress_courseId_idx` (`courseId`),
  CONSTRAINT `user_course_progress_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_course_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_course_progress` (`id`, `userId`, `courseId`, `completedModules`, `progressPercent`) VALUES
(1,	12,	2,	0,	25),
(2,	14,	3,	0,	99),
(3,	12,	3,	0,	99);

DROP TABLE IF EXISTS `user_lesson_statuses`;
CREATE TABLE `user_lesson_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `lessonId` int(11) NOT NULL,
  `completedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lesson_statuses_userId_lessonId_key` (`userId`,`lessonId`),
  KEY `user_lesson_statuses_lessonId_idx` (`lessonId`),
  CONSTRAINT `user_lesson_statuses_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_lesson_statuses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_lesson_statuses` (`id`, `userId`, `lessonId`, `completedAt`) VALUES
(1,	12,	3,	'2025-10-12 14:16:10.130'),
(2,	14,	8,	'2025-10-13 12:36:17.244'),
(3,	12,	8,	'2025-10-13 14:29:41.828');

DROP TABLE IF EXISTS `user_module_progress`;
CREATE TABLE `user_module_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `moduleId` int(11) NOT NULL,
  `completedLessons` int(11) NOT NULL DEFAULT 0,
  `progressPercent` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_module_progress_userId_moduleId_key` (`userId`,`moduleId`),
  KEY `user_module_progress_moduleId_idx` (`moduleId`),
  CONSTRAINT `user_module_progress_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_module_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_module_progress` (`id`, `userId`, `moduleId`, `completedLessons`, `progressPercent`) VALUES
(1,	12,	1,	1,	50),
(2,	14,	4,	1,	99),
(3,	12,	4,	1,	99);

DROP TABLE IF EXISTS `user_skill_events`;
CREATE TABLE `user_skill_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `skillId` int(11) NOT NULL,
  `practiceId` int(11) NOT NULL,
  `result` enum('POSITIVE','NEGATIVE','NEUTRAL') NOT NULL,
  `posAnswers` int(11) NOT NULL DEFAULT 0,
  `negAnswers` int(11) NOT NULL DEFAULT 0,
  `neuAnswers` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_skill_events_userId_skillId_practiceId_key` (`userId`,`skillId`,`practiceId`),
  KEY `user_skill_events_skillId_idx` (`skillId`),
  KEY `user_skill_events_practiceId_idx` (`practiceId`),
  CONSTRAINT `user_skill_events_practiceId_fkey` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_skill_events_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_skill_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_skill_events` (`id`, `userId`, `skillId`, `practiceId`, `result`, `posAnswers`, `negAnswers`, `neuAnswers`, `createdAt`) VALUES
(1,	5,	1,	3,	'POSITIVE',	1,	0,	0,	'2025-10-09 18:28:47.818'),
(2,	5,	2,	3,	'POSITIVE',	4,	2,	0,	'2025-10-09 18:28:47.828'),
(3,	5,	3,	3,	'POSITIVE',	1,	0,	0,	'2025-10-09 18:28:47.834'),
(4,	5,	4,	3,	'POSITIVE',	1,	0,	0,	'2025-10-09 18:28:47.842'),
(5,	5,	5,	3,	'POSITIVE',	1,	0,	0,	'2025-10-09 18:28:47.849');

DROP TABLE IF EXISTS `user_skill_summaries`;
CREATE TABLE `user_skill_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `skillId` int(11) NOT NULL,
  `posCount` int(11) NOT NULL DEFAULT 0,
  `negCount` int(11) NOT NULL DEFAULT 0,
  `status` enum('YES','NO','HALF') NOT NULL DEFAULT 'HALF',
  `updatedAt` datetime(3) NOT NULL,
  `negCountPreview` int(11) DEFAULT 0,
  `posCountPreview` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_skill_summaries_userId_skillId_key` (`userId`,`skillId`),
  KEY `user_skill_summaries_skillId_idx` (`skillId`),
  CONSTRAINT `user_skill_summaries_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_skill_summaries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_skill_summaries` (`id`, `userId`, `skillId`, `posCount`, `negCount`, `status`, `updatedAt`, `negCountPreview`, `posCountPreview`) VALUES
(1,	5,	1,	1,	0,	'HALF',	'2025-10-09 21:05:00.066',	NULL,	NULL),
(2,	5,	2,	1,	0,	'HALF',	'2025-10-09 21:05:00.072',	NULL,	NULL),
(3,	5,	3,	1,	0,	'HALF',	'2025-10-09 21:05:00.076',	NULL,	NULL),
(4,	5,	4,	1,	0,	'HALF',	'2025-10-09 21:05:00.081',	NULL,	NULL),
(5,	5,	5,	1,	0,	'HALF',	'2025-10-09 21:05:00.085',	NULL,	NULL);

DROP TABLE IF EXISTS `zoom_credentials`;
CREATE TABLE `zoom_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adminUserId` int(11) NOT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `tokenType` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `accessTokenEnc` text NOT NULL,
  `refreshTokenEnc` text NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zoom_credentials_adminUserId_key` (`adminUserId`),
  KEY `zoom_credentials_adminUserId_idx` (`adminUserId`),
  CONSTRAINT `zoom_credentials_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `zoom_credentials` (`id`, `adminUserId`, `accountId`, `tokenType`, `scope`, `accessTokenEnc`, `refreshTokenEnc`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
(3,	1,	NULL,	'bearer',	'meeting:write:meeting',	'YyInBI2FYN8oKmuBwtZXn1ZZNBZrQc5ajapWbgcCpzXWqsaSUclPa+GnFSjVsQHCBUCXQpT8XMbIflz/VyMFiOAS0icK9rG4+qt5WB7uNeO3LqSYkjXI4N3xXny9W2vqE+IW4WzX4JqIdTbahqj8jZrZErCYBwxq0MinTH8heaErrWP+vXIYI8WZhM0WWWXG+cphM0jnaSoPIocOpxVseHMER469B0T/HQzelGsvhku/SfIgSUu3EWgKhZi4cUUV8BDCIM09NKtqvPJFqLsS+r8LRguznUMfxr29VuFMZG89g0stw5bitEfbb5aWRUteXqF4MBlWnU+VZGkySbHH7ZKHjuyFDcHebGPPKem9xEeqnchcd1JlbihZs7p4Ku40uZAuQQYfv30fjpze83m3EejAl/HcoUBpUwELICnsMrZtuidfKlWvLPz/D3xvQh0DikSKGmktv3/KPIrCuyixB9TnBYPVfHvRCsynhO+0gXIrQT7Q+liM9mX+M9oV35Yw9KB97PHf8xDB2NZATRdRolZGfjK7djoOhH5eul1ROfPNTno/jUMLK1MTTd6VbVvpp754d4k/sxFrLdfbj3FMrMp+jJYtqlH0tWJ5cqyHF7A8rbhfYs5uwTR2EC2TcsPr6Qi8lY7x4ZmR3XF5NLr9vJOo3xITarghJBPMhorbj7i4BH7wE2msTR8f7fLDcMXxjbUlJmydKAqV9LUW1FALcpF4wy1qsuLACLfzvp0Ndinp1F1rAS30wLuti3F4n4tT9YVerPmWHswYUh+1+yA1VYWF3+lXU5/YXO9wjVQBWJ1WJZMtBUglz5qg1+TwJ4iX/PbONm26QqAxs0gevbqbH6xKKxMLc2nl8doDqZiH4T60ECAAg9o=',	'8gNWfXCFrWoolIhYfML7REctJf4qpIfZvHnvnSs6CbKM4ZCgy2VC7jlQK7oknls2g50/DU/b+tDsmPcEPFtU6E0G8saTRnE4gnIhZiASHlAtBp2Bfn0I0wA+RNNzw+/YrpxoJPGxjcOtB5fXhIFq3QQ0j33OiIAAcORoub2W+w9e6xZ7U89wiYxNRj6ATrA5w8UpJmPI9jjPT4nvO7UZpAc8qJhwyZdq8q8dQRJBo/UZzNq0VVcbIZCL3eUKGMozKfneawmB6y2SVxumGwaKHUqxRtxsS1bVo8h4Ot8SfvgJUDMJLk5SS64EfArht/vflFcZUBo3es83D3HN/qqGmymFMzewYsezqRBpjEIbtZ7AJ6hUg+W89JhzZiaaUVwdDpz+zw95LXEuKtPDQHIN1Wjf3smKou4p6cQG7a0UXJkxJ0ECE4xSNSLarrfZNTvJmnC6Y0aWM0INSDN80rcIbqz6YAaGMcL9wADLeze/KemqAObgHjscE12a4+dGh0i9w9AIrMesC3bdqfqCcnf2+k8BoyFNeLW81kCL1oSv/3Z2F1Qa2BKVaHNb8yCs6rqigy36slN+bwsTHq0SGXyXs3iGefTaG2LBHFU4uG0j0L0zY7hr8vs1LiAOjAchCmG/48kxduzhjXKNv45BjyjBjoiwdmfD1nYGTISZ7krL3R28MI2I+kK3mB3cfKyzhFqbsc4sHhvO9/3EAeVpXjdd1bIwjDoCIq3f2XJaJLjEDUnlE6N99BCDPsB2hFCP0CEeFrRmEkvfS2IP+yj66iUM9RtFdNbEndkmv73vTohnX/a96quPVWm0jNjv1br2YHTdKnNy5UQctMfH7ompkkZi1LtbBfZ2Yaok4DIMYTLikas1fCGMp7w=',	'2025-10-13 17:26:12.902',	'2025-10-13 16:27:13.909',	'2025-10-13 16:27:13.909');

-- 2025-10-13 18:03:56
