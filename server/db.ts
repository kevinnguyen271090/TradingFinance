import { eq, and, desc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  symbols, 
  InsertSymbol,
  Symbol,
  userWatchlists,
  InsertUserWatchlist,
  userPreferences,
  InsertUserPreference,
  UserPreference,
  predictions,
  InsertPrediction,
  Prediction,
  historicalPrices,
  InsertHistoricalPrice,
  HistoricalPrice,
  exchangeConnections
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SYMBOLS
// ============================================================================

export async function getAllSymbols(): Promise<Symbol[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(symbols).where(eq(symbols.isActive, true));
}

export async function getSymbolById(symbolId: number): Promise<Symbol | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(symbols).where(eq(symbols.id, symbolId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSymbolBySymbol(symbol: string): Promise<Symbol | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(symbols).where(eq(symbols.symbol, symbol)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSymbol(symbol: InsertSymbol): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(symbols).values(symbol).onDuplicateKeyUpdate({
    set: {
      name: symbol.name,
      type: symbol.type,
      exchange: symbol.exchange,
      isActive: symbol.isActive,
      updatedAt: new Date(),
    },
  });
}

// ============================================================================
// USER WATCHLISTS
// ============================================================================

export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: userWatchlists.id,
      symbolId: userWatchlists.symbolId,
      symbol: symbols.symbol,
      name: symbols.name,
      type: symbols.type,
      exchange: symbols.exchange,
      createdAt: userWatchlists.createdAt,
    })
    .from(userWatchlists)
    .innerJoin(symbols, eq(userWatchlists.symbolId, symbols.id))
    .where(eq(userWatchlists.userId, userId));

  return result;
}

export async function addToWatchlist(userId: number, symbolId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(userWatchlists).values({
    userId,
    symbolId,
  }).onDuplicateKeyUpdate({
    set: { createdAt: new Date() },
  });
}

export async function removeFromWatchlist(userId: number, symbolId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(userWatchlists).where(
    and(
      eq(userWatchlists.userId, userId),
      eq(userWatchlists.symbolId, symbolId)
    )
  );
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export async function getUserPreferences(userId: number): Promise<UserPreference | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreferences(prefs: InsertUserPreference): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(userPreferences).values(prefs).onDuplicateKeyUpdate({
    set: {
      riskTolerance: prefs.riskTolerance,
      defaultCapital: prefs.defaultCapital,
      preferredAssets: prefs.preferredAssets,
      notificationsEnabled: prefs.notificationsEnabled,
      updatedAt: new Date(),
    },
  });
}

// ============================================================================
// PREDICTIONS
// ============================================================================

export async function getLatestPredictions(symbolId: number, limit: number = 10): Promise<Prediction[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(predictions)
    .where(eq(predictions.symbolId, symbolId))
    .orderBy(desc(predictions.predictionDate))
    .limit(limit);
}

export async function insertPrediction(prediction: InsertPrediction): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(predictions).values(prediction);
}

// ============================================================================
// HISTORICAL PRICES
// ============================================================================

export async function getHistoricalPrices(
  symbolId: number,
  interval: string,
  limit: number = 100
): Promise<HistoricalPrice[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(historicalPrices)
    .where(
      and(
        eq(historicalPrices.symbolId, symbolId),
        eq(historicalPrices.interval, interval)
      )
    )
    .orderBy(desc(historicalPrices.timestamp))
    .limit(limit);
}

export async function insertHistoricalPrice(price: InsertHistoricalPrice): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(historicalPrices).values(price);
}

export async function bulkInsertHistoricalPrices(prices: InsertHistoricalPrice[]): Promise<void> {
  const db = await getDb();
  if (!db) return;

  if (prices.length === 0) return;

  await db.insert(historicalPrices).values(prices);
}

// ============================================================================
// BINANCE API CONNECTION
// ============================================================================

export async function getBinanceConnection(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exchangeConnections)
    .where(eq(exchangeConnections.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveBinanceKeys(userId: number, apiKey: string, apiSecret: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // TODO: Encrypt keys before saving
  // For MVP, we'll store them as-is (NOT RECOMMENDED FOR PRODUCTION)
  await db.insert(exchangeConnections).values({
    userId,
    exchange: 'binance',
    apiKeyEncrypted: apiKey, // TODO: Encrypt
    apiSecretEncrypted: apiSecret, // TODO: Encrypt
    isActive: true,
  }).onDuplicateKeyUpdate({
    set: {
      apiKeyEncrypted: apiKey,
      apiSecretEncrypted: apiSecret,
      isActive: true,
      updatedAt: new Date(),
    },
  });
}

export async function deleteBinanceKeys(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.delete(exchangeConnections)
    .where(eq(exchangeConnections.userId, userId));
}
