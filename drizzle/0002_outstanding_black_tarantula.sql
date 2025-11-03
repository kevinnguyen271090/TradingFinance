CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`category` enum('trading','prediction','social','milestone') NOT NULL,
	`requirement` json,
	`rewardPoints` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int,
	`referralCode` varchar(20) NOT NULL,
	`status` enum('pending','completed','rewarded') NOT NULL DEFAULT 'pending',
	`clickCount` int DEFAULT 0,
	`conversionDate` timestamp,
	`rewardAmount` varchar(30),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `shareCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardType` enum('prediction_accuracy','profit_loss','achievement','portfolio','strategy') NOT NULL,
	`imageUrl` text NOT NULL,
	`title` varchar(200),
	`stats` json,
	`shareCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shareCards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`isShared` boolean DEFAULT false,
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_achievement_unique` UNIQUE(`userId`,`achievementId`)
);
--> statement-breakpoint
CREATE TABLE `userStats` (
	`userId` int NOT NULL,
	`totalPredictions` int DEFAULT 0,
	`correctPredictions` int DEFAULT 0,
	`accuracyPct` int DEFAULT 0,
	`totalTrades` int DEFAULT 0,
	`winningTrades` int DEFAULT 0,
	`totalProfitLoss` varchar(30) DEFAULT '0',
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`achievements` json DEFAULT ('[]'),
	`level` int DEFAULT 1,
	`experiencePoints` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStats_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE INDEX `ref_referrer_idx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `ref_referee_idx` ON `referrals` (`refereeId`);--> statement-breakpoint
CREATE INDEX `ref_code_idx` ON `referrals` (`referralCode`);--> statement-breakpoint
CREATE INDEX `ref_status_idx` ON `referrals` (`status`);--> statement-breakpoint
CREATE INDEX `share_user_created_idx` ON `shareCards` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `share_type_idx` ON `shareCards` (`cardType`);--> statement-breakpoint
CREATE INDEX `user_achievement_user_idx` ON `userAchievements` (`userId`);