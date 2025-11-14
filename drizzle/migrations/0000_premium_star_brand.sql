CREATE TYPE "public"."achievement_category" AS ENUM('trading', 'prediction', 'social', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('crypto', 'stock', 'forex');--> statement-breakpoint
CREATE TYPE "public"."card_type" AS ENUM('prediction_accuracy', 'profit_loss', 'achievement', 'portfolio', 'strategy');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('INFO', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."prediction_direction" AS ENUM('up', 'down', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'completed', 'rewarded');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."risk_tolerance" AS ENUM('conservative', 'moderate', 'aggressive');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."trade_side" AS ENUM('BUY', 'SELL');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."trade_type" AS ENUM('MARKET', 'LIMIT');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"category" "achievement_category" NOT NULL,
	"requirement" json,
	"rewardPoints" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "autoTrades" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"symbolId" integer NOT NULL,
	"side" "trade_side" NOT NULL,
	"type" "trade_type" NOT NULL,
	"quantity" varchar(30) NOT NULL,
	"price" varchar(30),
	"binanceOrderId" bigint,
	"binanceClientOrderId" varchar(100),
	"status" "trade_status" NOT NULL,
	"executedQty" varchar(30),
	"executedPrice" varchar(30),
	"commission" varchar(30),
	"commissionAsset" varchar(10),
	"signalId" integer,
	"parentTradeId" bigint,
	"errorMessage" text,
	"retryCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"executedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoTradingLogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"level" "log_level" NOT NULL,
	"message" text NOT NULL,
	"tradeId" bigint,
	"signalId" integer,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoTradingSettings" (
	"userId" integer PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false,
	"maxPositionSizePct" integer DEFAULT 10,
	"maxOpenPositions" integer DEFAULT 3,
	"dailyLossLimitPct" integer DEFAULT 5,
	"minConfidence" integer DEFAULT 75,
	"allowedSymbols" json,
	"useLimitOrders" boolean DEFAULT true,
	"slippageTolerancePct" integer DEFAULT 1,
	"useStopLoss" boolean DEFAULT true,
	"stopLossPct" integer DEFAULT 2,
	"useTakeProfit" boolean DEFAULT true,
	"takeProfitPct" integer DEFAULT 5,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchangeConnections" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"exchange" varchar(50) DEFAULT 'binance' NOT NULL,
	"apiKeyEncrypted" text NOT NULL,
	"apiSecretEncrypted" text NOT NULL,
	"permissions" json,
	"isActive" boolean DEFAULT true,
	"isVerified" boolean DEFAULT false,
	"lastVerifiedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_exchange_unique" UNIQUE("userId","exchange")
);
--> statement-breakpoint
CREATE TABLE "historicalPrices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"symbolId" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"interval" varchar(10) NOT NULL,
	"open" varchar(30) NOT NULL,
	"high" varchar(30) NOT NULL,
	"low" varchar(30) NOT NULL,
	"close" varchar(30) NOT NULL,
	"volume" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbolId" integer NOT NULL,
	"predictionDate" timestamp NOT NULL,
	"timeframe" varchar(20) NOT NULL,
	"predictedDirection" "prediction_direction" NOT NULL,
	"predictedPrice" varchar(30),
	"confidenceScore" integer NOT NULL,
	"expectedReturn" varchar(20),
	"modelUsed" varchar(50),
	"actualPrice" varchar(30),
	"wasCorrect" boolean,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrerId" integer NOT NULL,
	"refereeId" integer,
	"referralCode" varchar(20) NOT NULL,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"clickCount" integer DEFAULT 0,
	"conversionDate" timestamp,
	"rewardAmount" varchar(30),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referralCode_unique" UNIQUE("referralCode")
);
--> statement-breakpoint
CREATE TABLE "shareCards" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"cardType" "card_type" NOT NULL,
	"imageUrl" text NOT NULL,
	"title" varchar(200),
	"stats" json,
	"shareCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"name" text,
	"type" "asset_type" NOT NULL,
	"exchange" varchar(50),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "symbols_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "technicalIndicators" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"symbolId" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"rsi" varchar(20),
	"macd" varchar(20),
	"macdSignal" varchar(20),
	"macdHistogram" varchar(20),
	"sma50" varchar(30),
	"sma200" varchar(30),
	"ema12" varchar(30),
	"ema26" varchar(30),
	"bollingerUpper" varchar(30),
	"bollingerMiddle" varchar(30),
	"bollingerLower" varchar(30),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tradingStrategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"targetRoiPct" integer NOT NULL,
	"timeframe" varchar(20) NOT NULL,
	"riskLevel" "risk_level" NOT NULL,
	"allocation" json,
	"isActive" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userAchievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"achievementId" integer NOT NULL,
	"unlockedAt" timestamp DEFAULT now() NOT NULL,
	"isShared" boolean DEFAULT false,
	CONSTRAINT "user_achievement_unique" UNIQUE("userId","achievementId")
);
--> statement-breakpoint
CREATE TABLE "userPreferences" (
	"userId" integer PRIMARY KEY NOT NULL,
	"riskTolerance" "risk_tolerance" DEFAULT 'moderate',
	"defaultCapital" varchar(30),
	"preferredAssets" json,
	"notificationsEnabled" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userStats" (
	"userId" integer PRIMARY KEY NOT NULL,
	"totalPredictions" integer DEFAULT 0,
	"correctPredictions" integer DEFAULT 0,
	"accuracyPct" integer DEFAULT 0,
	"totalTrades" integer DEFAULT 0,
	"winningTrades" integer DEFAULT 0,
	"totalProfitLoss" varchar(30) DEFAULT '0',
	"currentStreak" integer DEFAULT 0,
	"longestStreak" integer DEFAULT 0,
	"achievements" json,
	"level" integer DEFAULT 1,
	"experiencePoints" integer DEFAULT 0,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userWatchlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"symbolId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_symbol_unique" UNIQUE("userId","symbolId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "trade_user_created_idx" ON "autoTrades" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "trade_status_idx" ON "autoTrades" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trade_binance_order_idx" ON "autoTrades" USING btree ("binanceOrderId");--> statement-breakpoint
CREATE INDEX "log_user_created_idx" ON "autoTradingLogs" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "log_level_created_idx" ON "autoTradingLogs" USING btree ("level","createdAt");--> statement-breakpoint
CREATE INDEX "exchange_user_idx" ON "exchangeConnections" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "symbol_timestamp_idx" ON "historicalPrices" USING btree ("symbolId","timestamp");--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "historicalPrices" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "pred_symbol_date_idx" ON "predictions" USING btree ("symbolId","predictionDate");--> statement-breakpoint
CREATE INDEX "confidence_idx" ON "predictions" USING btree ("confidenceScore");--> statement-breakpoint
CREATE INDEX "ref_referrer_idx" ON "referrals" USING btree ("referrerId");--> statement-breakpoint
CREATE INDEX "ref_referee_idx" ON "referrals" USING btree ("refereeId");--> statement-breakpoint
CREATE INDEX "ref_code_idx" ON "referrals" USING btree ("referralCode");--> statement-breakpoint
CREATE INDEX "ref_status_idx" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "share_user_created_idx" ON "shareCards" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "share_type_idx" ON "shareCards" USING btree ("cardType");--> statement-breakpoint
CREATE INDEX "symbol_idx" ON "symbols" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "type_idx" ON "symbols" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tech_symbol_timestamp_idx" ON "technicalIndicators" USING btree ("symbolId","timestamp");--> statement-breakpoint
CREATE INDEX "strategy_user_idx" ON "tradingStrategies" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_achievement_user_idx" ON "userAchievements" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "watchlist_user_idx" ON "userWatchlists" USING btree ("userId");