import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { supabaseAuthRouter } from "./_core/supabaseAuthRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as binance from "./binance";
import * as mlPredictions from "./ml-predictions";
import * as onChain from "./on-chain";
import * as mta from "./mta";
import { getEnsembleAnalysis, type MarketData } from "./ai-ensemble";
import { predictions as predictionsTable } from "../drizzle/schema";
import * as sentiment from "./sentiment";
import { desc, and, gte, lte, eq as eqOp } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  
  // Supabase authentication
  supabaseAuth: supabaseAuthRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getUserPreferences(ctx.user.id);
      return prefs || {
        userId: ctx.user.id,
        riskTolerance: 'moderate' as const,
        defaultCapital: '10000',
        preferredAssets: ['crypto'],
        notificationsEnabled: true,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
        defaultCapital: z.string().optional(),
        preferredAssets: z.array(z.string()).optional(),
        notificationsEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserPreferences({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Watchlist
  watchlist: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWatchlist(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        symbolId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addToWatchlist(ctx.user.id, input.symbolId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({
        symbolId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromWatchlist(ctx.user.id, input.symbolId);
        return { success: true };
      }),
  }),

  // Symbols
  symbols: router({
    list: publicProcedure.query(async () => {
      return db.getAllSymbols();
    }),

    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getSymbolById(input.id);
      }),

    getBySymbol: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getSymbolBySymbol(input.symbol);
      }),

    // Refresh symbols from Binance API
    refreshFromBinance: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Only allow admin to refresh symbols
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can refresh symbols');
        }

        try {
          const binanceSymbols = await binance.getAllTradingSymbols();
          const usdtPairs = binanceSymbols.filter((s: any) => 
            s.symbol.endsWith('USDT') && s.status === 'TRADING'
          );

          let inserted = 0;
          for (const symbol of usdtPairs) {
            const baseAsset = symbol.baseAsset || symbol.symbol.replace('USDT', '');
            await db.upsertSymbol({
              symbol: symbol.symbol,
              name: baseAsset,
              type: 'crypto',
              exchange: 'binance',
              isActive: symbol.status === 'TRADING',
            });
            inserted++;
          }

          return {
            success: true,
            count: inserted,
            message: `Refreshed ${inserted} symbols from Binance`,
          };
        } catch (error: any) {
          return {
            success: false,
            count: 0,
            message: error.message || 'Failed to refresh symbols',
          };
        }
      }),
  }),

  // Market data
  market: router({
    // Get current price for a symbol
    getCurrentPrice: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const price = await binance.getCurrentPrice(input.symbol);
          return { symbol: input.symbol, price };
        } catch (error) {
          console.error('Error fetching price:', error);
          return { symbol: input.symbol, price: '0' };
        }
      }),

    // Get 24h ticker data
    get24hTicker: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const ticker = await binance.get24hTicker(input.symbol);
          return ticker;
        } catch (error) {
          console.error('Error fetching ticker:', error);
          return null;
        }
      }),

    // Get prices for multiple symbols
    getMultiplePrices: publicProcedure
      .input(z.object({
        symbols: z.array(z.string()),
      }))
      .query(async ({ input }) => {
        const prices: Record<string, string> = {};
        
        for (const symbol of input.symbols) {
          try {
            const price = await binance.getCurrentPrice(symbol);
            prices[symbol] = price;
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            prices[symbol] = '0';
          }
        }
        
        return prices;
      }),

    // Get historical klines
    getKlines: publicProcedure
      .input(z.object({
        symbol: z.string(),
        interval: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        try {
          const klines = await binance.getKlines({
            symbol: input.symbol,
            interval: input.interval,
            limit: input.limit,
          });
          return klines;
        } catch (error) {
          console.error('Error fetching klines:', error);
          return [];
        }
      }),
  }),

  // Multi-Timeframe Analysis
  mta: router({
    get: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        return mta.getMultiTimeframeAnalysis(input.symbol);
      }),
  }),

  // On-Chain Data
  onChain: router({
    get: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        return onChain.getOnChainData(input.symbol);
      }),
  }),

  // Sentiment Analysis
  sentiment: router({
    get: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        return sentiment.getSentiment(input.symbol);
      }),
  }),

  // AI Ensemble Analysis
  aiEnsemble: router({
    analyze: publicProcedure
      .input(z.object({
        symbol: z.string(),
        currentPrice: z.number(),
        priceChange24h: z.number(),
        volume24h: z.number(),
        high24h: z.number(),
        low24h: z.number(),
        rsi: z.number().optional(),
        macd: z.object({
          value: z.number(),
          signal: z.number(),
          histogram: z.number(),
        }).optional(),
        sma20: z.number().optional(),
        sma50: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const marketData: MarketData = input;
        const result = await getEnsembleAnalysis(marketData);
        return result;
      }),
  }),

  // ML Predictions
  predictions: router({
    // Get stored predictions from database
    getLatest: publicProcedure
      .input(z.object({
        symbolId: z.number(),
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        return db.getLatestPredictions(input.symbolId, input.limit);
      }),

    // Generate live predictions
    generate: publicProcedure
      .input(z.object({
        symbol: z.string(),
        currentPrice: z.number(),
        priceChange24h: z.number(),
      }))
      .query(async ({ input }) => {
        return mlPredictions.generateAllPredictions(
          input.symbol,
          input.currentPrice,
          input.priceChange24h
        );
      }),
  }),

  // Binance API Connection
  binance: router({ getConnection: protectedProcedure
      .query(async ({ ctx }) => {
        const connection = await db.getBinanceConnection(ctx.user.id);
        return {
          isConnected: !!connection,
          createdAt: connection?.createdAt,
        };
      }),

    testConnection: protectedProcedure
      .input(z.object({
        apiKey: z.string(),
        apiSecret: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Test connection with Binance
          const account = await binance.getAccountInfo(input.apiKey, input.apiSecret);
          return {
            success: true,
            message: 'Connection successful',
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Connection failed',
          };
        }
      }),

    saveKeys: protectedProcedure
      .input(z.object({
        apiKey: z.string(),
        apiSecret: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Encrypt keys before saving
        await db.saveBinanceKeys(ctx.user.id, input.apiKey, input.apiSecret);
        return { success: true };
      }),

    deleteKeys: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.deleteBinanceKeys(ctx.user.id);
        return { success: true };
      }),
  }),

  // Historical prices
  prices: router({
    getHistory: publicProcedure
      .input(z.object({
        symbolId: z.number(),
        interval: z.string(),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        return db.getHistoricalPrices(input.symbolId, input.interval, input.limit);
      }),
  }),

  // Prediction History & Accuracy
  predictionHistory: router({
    list: protectedProcedure
      .input(z.object({
        symbolId: z.number().optional(),
        timeframe: z.enum(['short', 'medium', 'long']).optional(),
        startDate: z.string().optional(), // ISO string
        endDate: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return [];

        const conditions = [];
        if (input.symbolId) conditions.push(eqOp(predictionsTable.symbolId, input.symbolId));
        if (input.timeframe) conditions.push(eqOp(predictionsTable.timeframe, input.timeframe));
        if (input.startDate) conditions.push(gte(predictionsTable.predictionDate, new Date(input.startDate)));
        if (input.endDate) conditions.push(lte(predictionsTable.predictionDate, new Date(input.endDate)));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        return await database
          .select()
          .from(predictionsTable)
          .where(where)
          .orderBy(desc(predictionsTable.predictionDate))
          .limit(input.limit);
      }),

    accuracy: protectedProcedure
      .input(z.object({
        symbolId: z.number().optional(),
        timeframe: z.enum(['short', 'medium', 'long']).optional(),
      }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return { total: 0, correct: 0, accuracy: 0 };

        const conditions = [];
        if (input.symbolId) conditions.push(eqOp(predictionsTable.symbolId, input.symbolId));
        if (input.timeframe) conditions.push(eqOp(predictionsTable.timeframe, input.timeframe));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const allPredictions = await database
          .select()
          .from(predictionsTable)
          .where(where);

        const correctPredictions = allPredictions.filter(p => p.wasCorrect === true);
        const completedPredictions = allPredictions.filter(p => p.actualPrice !== null);

        return {
          total: allPredictions.length,
          completed: completedPredictions.length,
          correct: correctPredictions.length,
          accuracy: completedPredictions.length > 0 ? (correctPredictions.length / completedPredictions.length * 100) : 0,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
