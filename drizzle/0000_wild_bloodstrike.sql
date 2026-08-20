CREATE TABLE `catalog_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` enum('vestidos','alfaiataria','tricos','essenciais','acessorios') NOT NULL,
	`priceCents` int NOT NULL,
	`imageUrl` text NOT NULL,
	`label` varchar(80),
	`color` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`details` json NOT NULL,
	`sizes` json NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`status` enum('published','draft') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalog_request_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestReference` varchar(32) NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(180) NOT NULL,
	`imageUrl` text NOT NULL,
	`size` varchar(16) NOT NULL,
	`quantity` int NOT NULL,
	`unitPriceCents` int NOT NULL,
	CONSTRAINT `catalog_request_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`whatsappPhone` varchar(20) NOT NULL,
	`itemCount` int NOT NULL,
	`subtotalCents` int NOT NULL,
	`messageText` text NOT NULL,
	`status` enum('new','contacted','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalog_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_requests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
	`settingKey` varchar(80) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_settings_settingKey` PRIMARY KEY(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
