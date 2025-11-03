-- ============================================
-- CryptoTrader Pro - Full Database Schema
-- ============================================
-- Generated: 2025-01-01
-- Database: MySQL 8.0+ / TiDB compatible
-- ============================================

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS `userAchievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `userStats`;
DROP TABLE IF EXISTS `referrals`;
DROP TABLE IF EXISTS `shareCards`;
DROP TABLE IF EXISTS `autoTradingConfigs`;
DROP TABLE IF EXISTS `trades`;
DROP TABLE IF EXISTS `predictions`;
DROP TABLE IF EXISTS `watchlist`;
DROP TABLE IF EXISTS `users`;

-- ============================================
-- Core Tables
-- ============================================

-- Users table (authentication & profile)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Manus OAuth identifier',
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_openId` (`openId`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User accounts and authentication';

-- Watchlist table (user's tracked symbols)
CREATE TABLE `watchlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `symbol` VARCHAR(20) NOT NULL COMMENT 'Trading pair symbol (e.g., BTCUSDT)',
  `addedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_symbol` (`userId`, `symbol`),
  INDEX `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User watchlist for tracking favorite symbols';

-- Predictions table (AI prediction history)
CREATE TABLE `predictions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `symbol` VARCHAR(20) NOT NULL,
  `predictedPrice` DECIMAL(20, 8) NOT NULL,
  `currentPrice` DECIMAL(20, 8) NOT NULL,
  `targetPrice` DECIMAL(20, 8) NOT NULL,
  `signal` ENUM('strong_buy', 'buy', 'hold', 'sell', 'strong_sell') NOT NULL,
  `confidence` INT NOT NULL COMMENT 'Confidence score 0-100',
  `reasoning` TEXT,
  `aiProvider` VARCHAR(50) COMMENT 'AI model used (qwen, deepseek, consensus)',
  `timeframe` ENUM('short', 'medium', 'long') DEFAULT 'medium',
  `riskLevel` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` ENUM('pending', 'hit', 'missed') DEFAULT 'pending',
  `actualPrice` DECIMAL(20, 8) COMMENT 'Actual price when prediction resolved',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolvedAt` TIMESTAMP NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId_symbol` (`userId`, `symbol`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI prediction history and results';

-- Trades table (executed trades)
CREATE TABLE `trades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `symbol` VARCHAR(20) NOT NULL,
  `side` ENUM('BUY', 'SELL') NOT NULL,
  `quantity` DECIMAL(20, 8) NOT NULL,
  `price` DECIMAL(20, 8) NOT NULL,
  `total` DECIMAL(20, 8) NOT NULL COMMENT 'Total value in USDT',
  `fee` DECIMAL(20, 8) DEFAULT 0,
  `status` ENUM('pending', 'filled', 'cancelled', 'failed') DEFAULT 'pending',
  `orderId` VARCHAR(100) COMMENT 'Exchange order ID',
  `predictionId` INT COMMENT 'Related prediction',
  `isAutoTrade` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `executedAt` TIMESTAMP NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`predictionId`) REFERENCES `predictions`(`id`) ON DELETE SET NULL,
  INDEX `idx_userId_symbol` (`userId`, `symbol`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Trade execution history';

-- Auto Trading Configs table
CREATE TABLE `autoTradingConfigs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `symbol` VARCHAR(20) NOT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  `investmentAmount` DECIMAL(20, 8) NOT NULL COMMENT 'Amount in USDT per trade',
  `minConfidence` INT DEFAULT 70 COMMENT 'Minimum AI confidence to trade',
  `stopLossPercent` DECIMAL(5, 2) DEFAULT 5.00,
  `takeProfitPercent` DECIMAL(5, 2) DEFAULT 10.00,
  `maxDailyTrades` INT DEFAULT 3,
  `allowedSignals` JSON COMMENT 'Array of allowed signals: ["strong_buy", "buy"]',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_symbol_config` (`userId`, `symbol`),
  INDEX `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Auto trading configuration per user per symbol';

-- ============================================
-- Phase 2: Social Sharing & Gamification
-- ============================================

-- Share Cards table (generated share images)
CREATE TABLE `shareCards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `cardType` ENUM('prediction_accuracy', 'profit_loss', 'achievement', 'portfolio', 'strategy') NOT NULL,
  `imageUrl` TEXT NOT NULL COMMENT 'S3 URL of generated card image',
  `imageKey` VARCHAR(255) NOT NULL COMMENT 'S3 object key',
  `metadata` JSON COMMENT 'Card data: accuracy, profit, achievement details',
  `shareCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId_type` (`userId`, `cardType`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Generated share card images for social media';

-- Referrals table (referral tracking)
CREATE TABLE `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrerId` INT NOT NULL COMMENT 'User who referred',
  `refereeId` INT COMMENT 'User who was referred (NULL if not signed up yet)',
  `referralCode` VARCHAR(20) NOT NULL UNIQUE,
  `status` ENUM('pending', 'completed', 'rewarded') DEFAULT 'pending',
  `clickCount` INT DEFAULT 0,
  `rewardAmount` DECIMAL(10, 2) DEFAULT 0 COMMENT 'Commission earned in USD',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` TIMESTAMP NULL COMMENT 'When referee signed up',
  `rewardedAt` TIMESTAMP NULL COMMENT 'When reward was paid',
  FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`refereeId`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_referralCode` (`referralCode`),
  INDEX `idx_referrerId` (`referrerId`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Referral program tracking';

-- User Stats table (aggregated statistics)
CREATE TABLE `userStats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL UNIQUE,
  `totalPredictions` INT DEFAULT 0,
  `correctPredictions` INT DEFAULT 0,
  `accuracy` DECIMAL(5, 2) DEFAULT 0 COMMENT 'Prediction accuracy percentage',
  `totalProfit` DECIMAL(20, 8) DEFAULT 0 COMMENT 'Total profit in USDT',
  `totalLoss` DECIMAL(20, 8) DEFAULT 0 COMMENT 'Total loss in USDT',
  `winRate` DECIMAL(5, 2) DEFAULT 0 COMMENT 'Win rate percentage',
  `currentStreak` INT DEFAULT 0 COMMENT 'Current winning streak',
  `longestStreak` INT DEFAULT 0 COMMENT 'Longest winning streak',
  `level` INT DEFAULT 1 COMMENT 'User level (gamification)',
  `experiencePoints` INT DEFAULT 0 COMMENT 'XP for leveling up',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_accuracy` (`accuracy`),
  INDEX `idx_totalProfit` (`totalProfit`),
  INDEX `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Aggregated user statistics for leaderboard and gamification';

-- Achievements table (available achievements)
CREATE TABLE `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(50) COMMENT 'Emoji or icon identifier',
  `category` ENUM('trading', 'prediction', 'social', 'milestone') NOT NULL,
  `requirement` JSON NOT NULL COMMENT 'Achievement criteria: {type, value}',
  `rewardPoints` INT DEFAULT 0 COMMENT 'XP reward',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Available achievements';

-- User Achievements table (unlocked achievements)
CREATE TABLE `userAchievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `achievementId` INT NOT NULL,
  `unlockedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `shared` BOOLEAN DEFAULT FALSE COMMENT 'Whether user shared this achievement',
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`achievementId`) REFERENCES `achievements`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_achievement` (`userId`, `achievementId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_unlockedAt` (`unlockedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User unlocked achievements';

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- Insert sample achievements
INSERT INTO `achievements` (`name`, `description`, `icon`, `category`, `requirement`, `rewardPoints`) VALUES
('First Prediction', 'Make your first AI prediction', '🎯', 'milestone', '{"type": "predictions", "value": 1}', 50),
('Accurate Trader', 'Achieve 70% prediction accuracy', '🎖️', 'prediction', '{"type": "accuracy", "value": 70}', 100),
('Profit Master', 'Earn $1,000 in total profit', '💰', 'trading', '{"type": "profit", "value": 1000}', 200),
('Win Streak', 'Get 10 correct predictions in a row', '🔥', 'prediction', '{"type": "streak", "value": 10}', 150),
('Social Butterfly', 'Share 5 achievements on social media', '🦋', 'social', '{"type": "shares", "value": 5}', 75),
('Diamond Hands', 'Hold a position for 30 days', '💎', 'trading', '{"type": "hold_days", "value": 30}', 250);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX `idx_predictions_user_status_created` ON `predictions` (`userId`, `status`, `createdAt`);
CREATE INDEX `idx_trades_user_status_created` ON `trades` (`userId`, `status`, `createdAt`);
CREATE INDEX `idx_userStats_accuracy_profit` ON `userStats` (`accuracy`, `totalProfit`);

-- ============================================
-- Views for Analytics (Optional)
-- ============================================

-- Leaderboard view
CREATE OR REPLACE VIEW `leaderboard` AS
SELECT 
  u.id,
  u.name,
  us.accuracy,
  us.totalProfit,
  us.winRate,
  us.level,
  us.longestStreak,
  COUNT(DISTINCT ua.achievementId) as achievementCount
FROM users u
JOIN userStats us ON u.id = us.userId
LEFT JOIN userAchievements ua ON u.id = ua.userId
GROUP BY u.id, u.name, us.accuracy, us.totalProfit, us.winRate, us.level, us.longestStreak
ORDER BY us.totalProfit DESC, us.accuracy DESC;

-- ============================================
-- Database Setup Complete
-- ============================================
-- Run this SQL file to create all tables
-- Then use: pnpm db:push to sync schema
-- ============================================
