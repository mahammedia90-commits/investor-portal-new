CREATE TABLE `hubspot_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`hubspotObjectType` varchar(50) NOT NULL,
	`hubspotObjectId` varchar(100),
	`action` varchar(20) NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hubspot_sync_log_id` PRIMARY KEY(`id`)
);
