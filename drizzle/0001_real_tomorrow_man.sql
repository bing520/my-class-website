CREATE TABLE `positive_trait_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`trait` varchar(100) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `positive_trait_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`author` varchar(100) NOT NULL,
	`category` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentName` varchar(100) NOT NULL,
	`positiveTraits` text NOT NULL,
	`weaknesses` text NOT NULL,
	`impressivePoints` text NOT NULL,
	`suggestions` text NOT NULL,
	`generatedReview` text NOT NULL,
	`usedQuotes` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestion_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`suggestion` varchar(200) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suggestion_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weakness_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`weakness` varchar(100) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weakness_options_id` PRIMARY KEY(`id`)
);
