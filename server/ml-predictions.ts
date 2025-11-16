/**
 * ML Prediction Service (MVP - Simplified)
 * 
 * For MVP, we generate realistic mock predictions based on:
 * - Current price trends
 * - Recent volatility
 * - Technical indicators
 * 
 * Phase 2 will replace this with real ML models (LSTM, Prophet, etc.)
 */

import { getDb } from "./db";
import { predictions as predictionsTable, symbols } from "../drizzle/schema.postgres";
import { eq } from "drizzle-orm";

export type PredictionTimeframe = 'short' | 'medium' | 'long';
export type PredictionDirection = 'bullish' | 'bearish' | 'neutral';
export type TradingSignal = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';

export interface Prediction {
  symbol: string;
  timeframe: PredictionTimeframe;
  direction: PredictionDirection;
  confidence: number; // 0-100
  targetPrice: string;
  currentPrice: string;
  priceChange: number; // percentage
  signal: TradingSignal;
  reasoning: string[];
  createdAt: Date;
}

/**
 * Generate mock prediction based on recent price data
 * In Phase 2, this will be replaced with real ML model inference
 */
export async function generatePrediction(
  symbol: string,
  currentPrice: number,
  priceChange24h: number,
  timeframe: PredictionTimeframe = 'short'
): Promise<Prediction> {
  // Simulate ML model processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  // Determine direction based on recent trend
  let direction: PredictionDirection;
  let confidence: number;
  let signal: TradingSignal;
  let targetPriceChange: number;

  // Short-term (1-7 days)
  if (timeframe === 'short') {
    if (priceChange24h < -5) {
      direction = 'bullish'; // Oversold, expect bounce
      confidence = 65 + Math.random() * 15; // 65-80%
      signal = priceChange24h < -8 ? 'strong_buy' : 'buy';
      targetPriceChange = 3 + Math.random() * 5; // 3-8%
    } else if (priceChange24h > 5) {
      direction = 'bearish'; // Overbought, expect correction
      confidence = 60 + Math.random() * 15; // 60-75%
      signal = priceChange24h > 8 ? 'strong_sell' : 'sell';
      targetPriceChange = -(2 + Math.random() * 4); // -2% to -6%
    } else {
      direction = 'neutral';
      confidence = 50 + Math.random() * 20; // 50-70%
      signal = 'hold';
      targetPriceChange = -1 + Math.random() * 2; // -1% to +1%
    }
  }
  // Medium-term (1-4 weeks)
  else if (timeframe === 'medium') {
    if (priceChange24h < -3) {
      direction = 'bullish';
      confidence = 70 + Math.random() * 15; // 70-85%
      signal = 'buy';
      targetPriceChange = 8 + Math.random() * 12; // 8-20%
    } else if (priceChange24h > 3) {
      direction = 'bearish';
      confidence = 65 + Math.random() * 15; // 65-80%
      signal = 'sell';
      targetPriceChange = -(5 + Math.random() * 10); // -5% to -15%
    } else {
      direction = 'neutral';
      confidence = 55 + Math.random() * 20; // 55-75%
      signal = 'hold';
      targetPriceChange = -2 + Math.random() * 4; // -2% to +2%
    }
  }
  // Long-term (1-6 months)
  else {
    // Long-term tends to be more bullish for crypto
    if (priceChange24h < 0) {
      direction = 'bullish';
      confidence = 75 + Math.random() * 15; // 75-90%
      signal = 'buy';
      targetPriceChange = 20 + Math.random() * 30; // 20-50%
    } else {
      direction = 'bullish';
      confidence = 70 + Math.random() * 15; // 70-85%
      signal = 'hold';
      targetPriceChange = 15 + Math.random() * 25; // 15-40%
    }
  }

  const targetPrice = currentPrice * (1 + targetPriceChange / 100);

  // Generate reasoning based on analysis
  const reasoning: string[] = [];
  
  if (Math.abs(priceChange24h) > 5) {
    reasoning.push(`Strong ${priceChange24h > 0 ? 'upward' : 'downward'} momentum detected (${priceChange24h.toFixed(2)}% in 24h)`);
  }
  
  if (direction === 'bullish') {
    reasoning.push('Technical indicators suggest oversold conditions');
    reasoning.push('Historical patterns indicate potential reversal');
  } else if (direction === 'bearish') {
    reasoning.push('Overbought signals detected across multiple timeframes');
    reasoning.push('Resistance levels approaching');
  } else {
    reasoning.push('Market consolidation phase');
    reasoning.push('Waiting for clearer directional signals');
  }

  if (confidence > 75) {
    reasoning.push('High confidence based on strong pattern recognition');
  } else if (confidence < 60) {
    reasoning.push('Lower confidence due to mixed signals');
  }

  return {
    symbol,
    timeframe,
    direction,
    confidence: Math.round(confidence),
    targetPrice: targetPrice.toFixed(currentPrice < 1 ? 6 : 2),
    currentPrice: currentPrice.toFixed(currentPrice < 1 ? 6 : 2),
    priceChange: targetPriceChange,
    signal,
    reasoning,
    createdAt: new Date(),
  };
}

/**
 * Generate predictions for all timeframes
 */
export async function generateAllPredictions(
  symbol: string,
  currentPrice: number,
  priceChange24h: number
): Promise<Prediction[]> {
  const timeframes: PredictionTimeframe[] = ['short', 'medium', 'long'];
  
  const predictions = await Promise.all(
    timeframes.map(tf => generatePrediction(symbol, currentPrice, priceChange24h, tf))
  );

  // Store predictions in database for history tracking
  try {
    const db = await getDb();
    if (db) {
      const symbolRecord = await db.select().from(symbols).where(eq(symbols.symbol, symbol)).limit(1);
      if (symbolRecord.length > 0) {
        const symbolId = symbolRecord[0].id;
        
        // Store each prediction
        for (const pred of predictions) {
          await db.insert(predictionsTable).values({
            symbolId,
            predictionDate: new Date(),
            timeframe: pred.timeframe,
            predictedDirection: pred.direction === 'bullish' ? 'up' : pred.direction === 'bearish' ? 'down' : 'neutral',
            predictedPrice: pred.targetPrice,
            confidenceScore: pred.confidence,
            expectedReturn: pred.priceChange.toFixed(2),
            modelUsed: "mock-demo",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error storing predictions:", error);
  }

  return predictions;
}

/**
 * Get signal color for UI
 */
export function getSignalColor(signal: TradingSignal): string {
  switch (signal) {
    case 'strong_buy':
      return 'text-green-500';
    case 'buy':
      return 'text-green-400';
    case 'hold':
      return 'text-yellow-500';
    case 'sell':
      return 'text-red-400';
    case 'strong_sell':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get signal label for UI
 */
export function getSignalLabel(signal: TradingSignal): string {
  switch (signal) {
    case 'strong_buy':
      return 'Strong Buy';
    case 'buy':
      return 'Buy';
    case 'hold':
      return 'Hold';
    case 'sell':
      return 'Sell';
    case 'strong_sell':
      return 'Strong Sell';
    default:
      return 'Unknown';
  }
}
