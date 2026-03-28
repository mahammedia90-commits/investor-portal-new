CREATE TABLE `investor_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`fullName` varchar(255),
	`investmentInterest` enum('exhibitions_events','real_estate','food_beverage','retail_brands','entertainment','technology','general_investment'),
	`region` varchar(100),
	`userId` int,
	`status` enum('new','contacted','qualified','converted') NOT NULL DEFAULT 'new',
	`source` varchar(50) DEFAULT 'investor_portal',
	`isRegistered` int DEFAULT 0,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investor_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `investor_leads_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`verified` int DEFAULT 0,
	`attempts` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
