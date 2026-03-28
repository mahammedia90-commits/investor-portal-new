CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`details` text,
	`entityType` varchar(50),
	`entityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exhibitionId` int NOT NULL,
	`unitId` int,
	`merchantName` varchar(255) NOT NULL,
	`merchantCompany` varchar(255),
	`merchantPhone` varchar(20),
	`merchantEmail` varchar(320),
	`activityType` varchar(100),
	`requestedAmount` decimal(12,2),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`investorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractNumber` varchar(50) NOT NULL,
	`exhibitionId` int NOT NULL,
	`bookingId` int,
	`investorId` int NOT NULL,
	`merchantName` varchar(255) NOT NULL,
	`merchantCompany` varchar(255),
	`unitCode` varchar(20),
	`amount` decimal(12,2) NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`status` enum('active','pending_signature','expired','cancelled') NOT NULL DEFAULT 'pending_signature',
	`signedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exhibition_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exhibitionId` int NOT NULL,
	`unitCode` varchar(20) NOT NULL,
	`unitType` enum('retail','food','service','premium') NOT NULL DEFAULT 'retail',
	`area` decimal(8,2),
	`price` decimal(12,2),
	`status` enum('available','booked','pending') NOT NULL DEFAULT 'available',
	`positionX` int DEFAULT 0,
	`positionY` int DEFAULT 0,
	`width` int DEFAULT 1,
	`height` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exhibition_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exhibitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`description` text,
	`location` varchar(255),
	`city` varchar(100),
	`startDate` timestamp,
	`endDate` timestamp,
	`totalUnits` int DEFAULT 0,
	`bookedUnits` int DEFAULT 0,
	`status` enum('active','upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`rating` decimal(2,1) DEFAULT '0.0',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exhibitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('booking','contract','payment','system') NOT NULL DEFAULT 'system',
	`isRead` int DEFAULT 0,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int,
	`exhibitionId` int NOT NULL,
	`investorId` int NOT NULL,
	`merchantName` varchar(255) NOT NULL,
	`merchantCompany` varchar(255),
	`amount` decimal(12,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','credit_card','cash','mada') NOT NULL DEFAULT 'bank_transfer',
	`status` enum('received','pending','refunded') NOT NULL DEFAULT 'pending',
	`transactionRef` varchar(100),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
