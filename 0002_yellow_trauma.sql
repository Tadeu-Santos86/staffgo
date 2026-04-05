CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` enum('job_created','job_updated','job_deleted','job_paused','job_closed','user_created','user_updated','user_deleted','user_banned','company_verified','company_unverified','application_submitted','application_status_changed','notification_sent','settings_changed','external_job_imported','external_job_removed') NOT NULL,
	`userId` int,
	`targetType` varchar(50),
	`targetId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`category` enum('notifications','scraping','matching','system') NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automationSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `automationSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `externalJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('linkedin','olx','facebook','indeed','catho','infojobs','other') NOT NULL,
	`externalId` varchar(255),
	`title` varchar(255) NOT NULL,
	`company` varchar(255),
	`description` text,
	`sector` enum('hospitality','construction','retail','supermarket','other'),
	`city` varchar(100),
	`state` varchar(2),
	`salaryMin` decimal(10,2),
	`salaryMax` decimal(10,2),
	`jobType` varchar(50),
	`sourceUrl` varchar(500) NOT NULL,
	`logoUrl` varchar(500),
	`active` boolean DEFAULT true,
	`lastScrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('job_viewed','profile_viewed','new_application','new_match','job_recommendation','system_message','admin_message') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedJobId` int,
	`relatedUserId` int,
	`read` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telemetryEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('job_view','job_click','job_apply','job_share','profile_view','search','login','signup','external_job_click') NOT NULL,
	`userId` int,
	`jobId` int,
	`externalJobId` int,
	`metadata` text,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telemetryEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `companies` ADD `institutionalDescription` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `workEnvironment` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `culture` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `benefits` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `logoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `companies` ADD `coverImageUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `companies` ADD `employeeCount` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `foundedYear` int;--> statement-breakpoint
ALTER TABLE `jobs` ADD `viewCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `jobs` ADD `applicationCount` int DEFAULT 0;--> statement-breakpoint
CREATE INDEX `idx_action_audit` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_userId_audit` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_createdAt_audit` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_source` ON `externalJobs` (`source`);--> statement-breakpoint
CREATE INDEX `idx_sector_ext` ON `externalJobs` (`sector`);--> statement-breakpoint
CREATE INDEX `idx_active_ext` ON `externalJobs` (`active`);--> statement-breakpoint
CREATE INDEX `idx_userId_notif` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_read_notif` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `idx_eventType` ON `telemetryEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_userId_tel` ON `telemetryEvents` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_jobId_tel` ON `telemetryEvents` (`jobId`);--> statement-breakpoint
CREATE INDEX `idx_createdAt_tel` ON `telemetryEvents` (`createdAt`);