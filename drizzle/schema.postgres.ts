import { 
  pgTable, 
  serial, 
  integer, 
  bigserial,
  bigint,
  varchar, 
  text, 
  timestamp, 
  boolean, 
  json,
  index,
  unique,
  pgEnum
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL Schema for CryptoTrader Pro
 * Converted from MySQL schema for Supabase deployment
 */

// Define enums first (PostgreSQL requires explicit enum definitions)
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const assetTypeEnum = pgEnum("asset_type", ["crypto", "stock", "forex"]);
export const predictionDirectionEnum = pgEnum("prediction_direction", ["up", "down", "neutral"]);
export const riskToleranceEnum = pgEnum("risk_tolerance", ["conservative", "moderate", "aggressive"]);
export const tradeSideEnum = pgEnum("trade_side", ["BUY", "SELL"]);
export const tradeTypeEnum = pgEnum("trade_type", ["MARKET", "LIMIT"]);
export const tradeStatusEnum = pgEnum("trade_status", ["PENDING", "FILLED", "PARTIALLY_FILLED", "CANCELLED", "FAILED"]);
export const logLevelEnum = pgEnum("log_level", ["INFO", "WARNING", "ERROR"]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);
export const cardTypeEnum = pgEnum("card_type", ["prediction_accuracy", "profit_loss", "achievement", "portfolio", "strategy"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "completed", "rewarded"]);
export const achievementCategoryEnum = pgEnum("achievement_category", ["trading", "prediction", "social", "milestone"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Symbols table - stores all tradeable assets (crypto, stocks, forex)
 */
export const symbols = pgTable("symbols", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: text("name"),
  type: assetTypeEnum("type").notNull(),
  exchange: varchar("exchange", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  symbolIdx: index("symbol_idx").on(table.symbol),
  typeIdx: index("type_idx").on(table.type),
}));

export type Symbol = typeof symbols.$inferSelect;
export type InsertSymbol = typeof symbols.$inferInsert;

/**
 * Historical prices - OHLCV data
 */
export const historicalPrices = pgTable("historicalPrices", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  symbolId: integer("symbolId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  interval: varchar("interval", { length: 10 }).notNull(),
  open: varchar("open", { length: 30 }).notNull(),
  high: varchar("high", { length: 30 }).notNull(),
  low: varchar("low", { length: 30 }).notNull(),
  close: varchar("close", { length: 30 }).notNull(),
  volume: varchar("volume", { length: 30 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolTimestampIdx: index("symbol_timestamp_idx").on(table.symbolId, table.timestamp),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export type HistoricalPrice = typeof historicalPrices.$inferSelect;
export type InsertHistoricalPrice = typeof historicalPrices.$inferInsert;

/**
 * Technical indicators
 */
export const technicalIndicators = pgTable("technicalIndicators", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  symbolId: integer("symbolId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  rsi: varchar("rsi", { length: 20 }),
  macd: varchar("macd", { length: 20 }),
  macdSignal: varchar("macdSignal", { length: 20 }),
  macdHistogram: varchar("macdHistogram", { length: 20 }),
  sma50: varchar("sma50", { length: 30 }),
  sma200: varchar("sma200", { length: 30 }),
  ema12: varchar("ema12", { length: 30 }),
  ema26: varchar("ema26", { length: 30 }),
  bollingerUpper: varchar("bollingerUpper", { length: 30 }),
  bollingerMiddle: varchar("bollingerMiddle", { length: 30 }),
  bollingerLower: varchar("bollingerLower", { length: 30 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolTimestampIdx: index("tech_symbol_timestamp_idx").on(table.symbolId, table.timestamp),
}));

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;

/**
 * ML Predictions
 */
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  symbolId: integer("symbolId").notNull(),
  predictionDate: timestamp("predictionDate").notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(),
  predictedDirection: predictionDirectionEnum("predictedDirection").notNull(),
  predictedPrice: varchar("predictedPrice", { length: 30 }),
  confidenceScore: integer("confidenceScore").notNull(),
  expectedReturn: varchar("expectedReturn", { length: 20 }),
  modelUsed: varchar("modelUsed", { length: 50 }),
  actualPrice: varchar("actualPrice", { length: 30 }),
  wasCorrect: boolean("wasCorrect"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolDateIdx: index("pred_symbol_date_idx").on(table.symbolId, table.predictionDate),
  confidenceIdx: index("confidence_idx").on(table.confidenceScore),
}));

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

/**
 * User watchlists
 */
export const userWatchlists = pgTable("userWatchlists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  symbolId: integer("symbolId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userSymbolUnique: unique("user_symbol_unique").on(table.userId, table.symbolId),
  userIdx: index("watchlist_user_idx").on(table.userId),
}));

export type UserWatchlist = typeof userWatchlists.$inferSelect;
export type InsertUserWatchlist = typeof userWatchlists.$inferInsert;

/**
 * User preferences & risk profile
 */
export const userPreferences = pgTable("userPreferences", {
  userId: integer("userId").primaryKey(),
  riskTolerance: riskToleranceEnum("riskTolerance").default("moderate"),
  defaultCapital: varchar("defaultCapital", { length: 30 }),
  preferredAssets: json("preferredAssets").$type<string[]>(),
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Binance API connections
 */
export const exchangeConnections = pgTable("exchangeConnections", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  exchange: varchar("exchange", { length: 50 }).default("binance").notNull(),
  apiKeyEncrypted: text("apiKeyEncrypted").notNull(),
  apiSecretEncrypted: text("apiSecretEncrypted").notNull(),
  permissions: json("permissions").$type<{ read: boolean; trade: boolean; withdraw: boolean }>(),
  isActive: boolean("isActive").default(true),
  isVerified: boolean("isVerified").default(false),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userExchangeUnique: unique("user_exchange_unique").on(table.userId, table.exchange),
  userIdx: index("exchange_user_idx").on(table.userId),
}));

export type ExchangeConnection = typeof exchangeConnections.$inferSelect;
export type InsertExchangeConnection = typeof exchangeConnections.$inferInsert;

/**
 * Auto trading settings
 */
export const autoTradingSettings = pgTable("autoTradingSettings", {
  userId: integer("userId").primaryKey(),
  enabled: boolean("enabled").default(false),
  maxPositionSizePct: integer("maxPositionSizePct").default(10),
  maxOpenPositions: integer("maxOpenPositions").default(3),
  dailyLossLimitPct: integer("dailyLossLimitPct").default(5),
  minConfidence: integer("minConfidence").default(75),
  allowedSymbols: json("allowedSymbols").$type<string[]>(),
  useLimitOrders: boolean("useLimitOrders").default(true),
  slippageTolerancePct: integer("slippageTolerancePct").default(1),
  useStopLoss: boolean("useStopLoss").default(true),
  stopLossPct: integer("stopLossPct").default(2),
  useTakeProfit: boolean("useTakeProfit").default(true),
  takeProfitPct: integer("takeProfitPct").default(5),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AutoTradingSetting = typeof autoTradingSettings.$inferSelect;
export type InsertAutoTradingSetting = typeof autoTradingSettings.$inferInsert;

/**
 * Auto trades executed by the bot
 */
export const autoTrades = pgTable("autoTrades", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: integer("userId").notNull(),
  symbolId: integer("symbolId").notNull(),
  side: tradeSideEnum("side").notNull(),
  type: tradeTypeEnum("type").notNull(),
  quantity: varchar("quantity", { length: 30 }).notNull(),
  price: varchar("price", { length: 30 }),
  binanceOrderId: bigint("binanceOrderId", { mode: "number" }),
  binanceClientOrderId: varchar("binanceClientOrderId", { length: 100 }),
  status: tradeStatusEnum("status").notNull(),
  executedQty: varchar("executedQty", { length: 30 }),
  executedPrice: varchar("executedPrice", { length: 30 }),
  commission: varchar("commission", { length: 30 }),
  commissionAsset: varchar("commissionAsset", { length: 10 }),
  signalId: integer("signalId"),
  parentTradeId: bigint("parentTradeId", { mode: "number" }),
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  executedAt: timestamp("executedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("trade_user_created_idx").on(table.userId, table.createdAt),
  statusIdx: index("trade_status_idx").on(table.status),
  binanceOrderIdx: index("trade_binance_order_idx").on(table.binanceOrderId),
}));

export type AutoTrade = typeof autoTrades.$inferSelect;
export type InsertAutoTrade = typeof autoTrades.$inferInsert;

/**
 * Auto trading logs
 */
export const autoTradingLogs = pgTable("autoTradingLogs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: integer("userId").notNull(),
  level: logLevelEnum("level").notNull(),
  message: text("message").notNull(),
  tradeId: bigint("tradeId", { mode: "number" }),
  signalId: integer("signalId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("log_user_created_idx").on(table.userId, table.createdAt),
  levelCreatedIdx: index("log_level_created_idx").on(table.level, table.createdAt),
}));

export type AutoTradingLog = typeof autoTradingLogs.$inferSelect;
export type InsertAutoTradingLog = typeof autoTradingLogs.$inferInsert;

/**
 * Trading strategies (goal-based)
 */
export const tradingStrategies = pgTable("tradingStrategies", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  targetRoiPct: integer("targetRoiPct").notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(),
  riskLevel: riskLevelEnum("riskLevel").notNull(),
  allocation: json("allocation").$type<Record<string, any>>(),
  isActive: boolean("isActive").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("strategy_user_idx").on(table.userId),
}));

export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = typeof tradingStrategies.$inferInsert;

/**
 * Share cards - generated images for social sharing
 */
export const shareCards = pgTable("shareCards", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  cardType: cardTypeEnum("cardType").notNull(),
  imageUrl: text("imageUrl").notNull(),
  title: varchar("title", { length: 200 }),
  stats: json("stats").$type<Record<string, any>>(),
  shareCount: integer("shareCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("share_user_created_idx").on(table.userId, table.createdAt),
  typeIdx: index("share_type_idx").on(table.cardType),
}));

export type ShareCard = typeof shareCards.$inferSelect;
export type InsertShareCard = typeof shareCards.$inferInsert;

/**
 * Referrals - track user referrals
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrerId").notNull(),
  refereeId: integer("refereeId"),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  status: referralStatusEnum("status").default("pending").notNull(),
  clickCount: integer("clickCount").default(0),
  conversionDate: timestamp("conversionDate"),
  rewardAmount: varchar("rewardAmount", { length: 30 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  referrerIdx: index("ref_referrer_idx").on(table.referrerId),
  refereeIdx: index("ref_referee_idx").on(table.refereeId),
  codeIdx: index("ref_code_idx").on(table.referralCode),
  statusIdx: index("ref_status_idx").on(table.status),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User stats - aggregated statistics for sharing
 */
export const userStats = pgTable("userStats", {
  userId: integer("userId").primaryKey(),
  totalPredictions: integer("totalPredictions").default(0),
  correctPredictions: integer("correctPredictions").default(0),
  accuracyPct: integer("accuracyPct").default(0),
  totalTrades: integer("totalTrades").default(0),
  winningTrades: integer("winningTrades").default(0),
  totalProfitLoss: varchar("totalProfitLoss", { length: 30 }).default("0"),
  currentStreak: integer("currentStreak").default(0),
  longestStreak: integer("longestStreak").default(0),
  achievements: json("achievements").$type<string[]>(),
  level: integer("level").default(1),
  experiencePoints: integer("experiencePoints").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserStat = typeof userStats.$inferSelect;
export type InsertUserStat = typeof userStats.$inferInsert;

/**
 * Achievements - available achievements
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  category: achievementCategoryEnum("category").notNull(),
  requirement: json("requirement").$type<Record<string, any>>(),
  rewardPoints: integer("rewardPoints").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements - unlocked achievements
 */
export const userAchievements = pgTable("userAchievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  isShared: boolean("isShared").default(false),
}, (table) => ({
  userAchievementUnique: unique("user_achievement_unique").on(table.userId, table.achievementId),
  userIdx: index("user_achievement_user_idx").on(table.userId),
}));

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
