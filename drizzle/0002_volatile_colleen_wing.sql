CREATE TABLE `active_investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`opportunityId` int,
	`title` varchar(255) NOT NULL,
	`investmentAmount` decimal(14,2) NOT NULL,
	`ownershipPercentage` decimal(5,2),
	`operatorName` varchar(255),
	`currentRevenue` decimal(14,2) DEFAULT '0.00',
	`profitDistributed` decimal(14,2) DEFAULT '0.00',
	`status` enum('active','paused','completed','exited') NOT NULL DEFAULT 'active',
	`startDate` timestamp,
	`endDate` timestamp,
	`projectTimeline` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `active_investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleEn` varchar(255),
	`description` text,
	`category` enum('retail','food_beverage','popup','brand_experience','event_partnership','technology') NOT NULL DEFAULT 'retail',
	`eventName` varchar(255),
	`location` varchar(255),
	`city` varchar(100),
	`requiredInvestment` decimal(14,2),
	`expectedRevenue` decimal(14,2),
	`projectedROI` decimal(6,2),
	`duration` varchar(100),
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`opportunityScore` int DEFAULT 0,
	`status` enum('open','reserved','committed','closed') NOT NULL DEFAULT 'open',
	`operatorName` varchar(255),
	`operatorProfile` text,
	`investmentStructure` text,
	`businessModel` text,
	`visitorTraffic` int DEFAULT 0,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investment_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investor_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`documentType` enum('contract','agreement','certificate','financial_statement','payment_receipt','report','other') NOT NULL DEFAULT 'other',
	`fileUrl` text,
	`fileSize` int,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investor_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`investorType` enum('individual','company','fund') NOT NULL DEFAULT 'individual',
	`companyName` varchar(255),
	`preferredSectors` text,
	`investmentCapacity` decimal(14,2),
	`totalInvested` decimal(14,2) DEFAULT '0.00',
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`bio` text,
	`phone` varchar(20),
	`location` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `investor_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`subject` varchar(255),
	`content` text NOT NULL,
	`isRead` int DEFAULT 0,
	`senderType` enum('investor','operator','admin') NOT NULL DEFAULT 'investor',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('booking','contract','payment','system','opportunity','investment') NOT NULL DEFAULT 'system';