/**
 * Multi-AI Ensemble System
 * Combines Qwen-2.5 and DeepSeek-V3 for comprehensive trading analysis
 */

import { invokeLLM } from './_core/llm';
import { cacheGetOrSet, CacheKeys, CacheTTL } from './lib/redis';

export type AIProvider = 'qwen' | 'deepseek' | 'consensus';

export type TradingSignal = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';

export interface AIAnalysis {
  provider: AIProvider;
  signal: TradingSignal;
  confidence: number; // 0-100
  targetPrice: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
}

export interface EnsembleResult {
  consensus: AIAnalysis;
  individual: {
    qwen: AIAnalysis;
    deepseek: AIAnalysis;
  };
  agreement: number; // 0-100, how much they agree
  timestamp: Date;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  // Technical indicators
  rsi?: number;
  macd?: { value: number; signal: number; histogram: number };
  sma20?: number;
  sma50?: number;
  bollinger?: { upper: number; middle: number; lower: number };
  // New features
  sentimentScore?: number; // -1.0 to 1.0
  onChainWhaleScore?: number; // -1.0 to 1.0
  mtaOverallSignal?: TradingSignal; // from Multi-Timeframe Analysis
}

/**
 * Analyze market data using Qwen-2.5
 * Focus: Technical analysis, pattern recognition
 */
export async function analyzeWithQwen(data: MarketData): Promise<AIAnalysis> {
  // Add new data points to the prompt for Qwen
  const sentimentInfo = data.sentimentScore !== undefined ? 
    `- Sentiment Score: ${data.sentimentScore.toFixed(2)} (Social/News)` : '';
  const onChainInfo = data.onChainWhaleScore !== undefined ? 
    `- On-Chain Whale Score: ${data.onChainWhaleScore.toFixed(2)} (Accumulation/Distribution)` : '';
  const mtaInfo = data.mtaOverallSignal ? 
    `- Multi-Timeframe Signal: ${data.mtaOverallSignal}` : '';

  const prompt = `You are an expert cryptocurrency trader analyzing ${data.symbol}.

Current Market Data:
- Price: $${data.currentPrice}
- 24h Change: ${data.priceChange24h}%
- 24h Volume: $${data.volume24h}
- 24h High: $${data.high24h}
- 24h Low: $${data.low24h}
${data.rsi ? `- RSI: ${data.rsi}` : ''}
${data.macd ? `- MACD: ${data.macd.value.toFixed(2)} (Signal: ${data.macd.signal.toFixed(2)})` : ''}
${data.sma20 ? `- SMA20: $${data.sma20}` : ''}
${data.sma50 ? `- SMA50: $${data.sma50}` : ''}
${sentimentInfo}
${onChainInfo}
${mtaInfo}

Analyze this data and provide a trading recommendation in JSON format:
{
  "signal": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
  "confidence": 0-100,
  "targetPrice": number,
  "reasoning": "detailed explanation",
  "riskLevel": "low" | "medium" | "high",
  "timeframe": "short" | "medium" | "long"
}

Focus on technical patterns, momentum indicators, and price action.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a professional cryptocurrency trading analyst specializing in technical analysis.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'trading_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              signal: { 
                type: 'string', 
                enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']
              },
              confidence: { type: 'number', minimum: 0, maximum: 100 },
              targetPrice: { type: 'number' },
              reasoning: { type: 'string' },
              riskLevel: { 
                type: 'string', 
                enum: ['low', 'medium', 'high']
              },
              timeframe: { 
                type: 'string', 
                enum: ['short', 'medium', 'long']
              },
            },
            required: ['signal', 'confidence', 'targetPrice', 'reasoning', 'riskLevel', 'timeframe'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid response format');
    }
    const analysis = JSON.parse(content);

    return {
      provider: 'qwen',
      ...analysis,
    };
  } catch (error) {
    console.error('Qwen analysis error:', error);
    // Fallback to neutral analysis
    return {
      provider: 'qwen',
      signal: 'hold',
      confidence: 50,
      targetPrice: data.currentPrice,
      reasoning: 'Analysis unavailable',
      riskLevel: 'medium',
      timeframe: 'medium',
    };
  }
}

/**
 * Analyze market data using DeepSeek-V3
 * Focus: Risk assessment, strategy optimization
 */
export async function analyzeWithDeepSeek(data: MarketData): Promise<AIAnalysis> {
  // Add new data points to the prompt for DeepSeek
  const sentimentInfo = data.sentimentScore !== undefined ? 
    `- Sentiment Score: ${data.sentimentScore.toFixed(2)} (Social/News)` : '';
  const onChainInfo = data.onChainWhaleScore !== undefined ? 
    `- On-Chain Whale Score: ${data.onChainWhaleScore.toFixed(2)} (Accumulation/Distribution)` : '';
  const mtaInfo = data.mtaOverallSignal ? 
    `- Multi-Timeframe Signal: ${data.mtaOverallSignal}` : '';

  const prompt = `You are a risk management expert analyzing ${data.symbol} for trading.

Current Market Data:
- Price: $${data.currentPrice}
- 24h Change: ${data.priceChange24h}%
- 24h Volume: $${data.volume24h}
- 24h High: $${data.high24h}
- 24h Low: $${data.low24h}
${data.rsi ? `- RSI: ${data.rsi}` : ''}
${data.macd ? `- MACD: ${data.macd.value.toFixed(2)}` : ''}
${sentimentInfo}
${onChainInfo}
${mtaInfo}
Provide a risk-focused trading recommendation in JSON format:
{
  "signal": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
  "confidence": 0-100,
  "targetPrice": number,
  "reasoning": "detailed risk assessment",
  "riskLevel": "low" | "medium" | "high",
  "timeframe": "short" | "medium" | "long"
}

Focus on risk/reward ratio, volatility, and capital preservation.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a professional risk management analyst specializing in cryptocurrency trading.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'risk_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              signal: { 
                type: 'string', 
                enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']
              },
              confidence: { type: 'number', minimum: 0, maximum: 100 },
              targetPrice: { type: 'number' },
              reasoning: { type: 'string' },
              riskLevel: { 
                type: 'string', 
                enum: ['low', 'medium', 'high']
              },
              timeframe: { 
                type: 'string', 
                enum: ['short', 'medium', 'long']
              },
            },
            required: ['signal', 'confidence', 'targetPrice', 'reasoning', 'riskLevel', 'timeframe'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid response format');
    }
    const analysis = JSON.parse(content);

    return {
      provider: 'deepseek',
      ...analysis,
    };
  } catch (error) {
    console.error('DeepSeek analysis error:', error);
    return {
      provider: 'deepseek',
      signal: 'hold',
      confidence: 50,
      targetPrice: data.currentPrice,
      reasoning: 'Analysis unavailable',
      riskLevel: 'medium',
      timeframe: 'medium',
    };
  }
}

/**
 * Calculate consensus from multiple AI analyses
 * Weights: Qwen 40%, DeepSeek 35%, Traditional ML 25%
 */
export function calculateConsensus(
  qwen: AIAnalysis,
  deepseek: AIAnalysis,
  mlWeight: number = 0.25
): EnsembleResult {
  const qwenWeight = 0.40;
  const deepseekWeight = 0.35;

  // Convert signals to numeric scores for averaging
  const signalToScore: Record<TradingSignal, number> = {
    strong_sell: -2,
    sell: -1,
    hold: 0,
    buy: 1,
    strong_buy: 2,
  };

  const scoreToSignal = (score: number): TradingSignal => {
    if (score >= 1.5) return 'strong_buy';
    if (score >= 0.5) return 'buy';
    if (score <= -1.5) return 'strong_sell';
    if (score <= -0.5) return 'sell';
    return 'hold';
  };

  // Calculate weighted signal
  const qwenScore = signalToScore[qwen.signal];
  const deepseekScore = signalToScore[deepseek.signal];
  const weightedScore = qwenScore * qwenWeight + deepseekScore * deepseekWeight;
  const consensusSignal = scoreToSignal(weightedScore);

  // Calculate weighted confidence
  const consensusConfidence = Math.round(
    qwen.confidence * qwenWeight + deepseek.confidence * deepseekWeight
  );

  // Calculate weighted target price
  const consensusTargetPrice = 
    qwen.targetPrice * qwenWeight + deepseek.targetPrice * deepseekWeight;

  // Calculate agreement level
  const signalAgreement = qwenScore === deepseekScore ? 100 : 
    Math.abs(qwenScore - deepseekScore) === 1 ? 70 : 40;
  
  const confidenceAgreement = 100 - Math.abs(qwen.confidence - deepseek.confidence);
  
  const agreement = Math.round((signalAgreement + confidenceAgreement) / 2);

  // Determine consensus risk level (take the more conservative one)
  const riskLevels: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const consensusRiskLevel = riskLevels[qwen.riskLevel] > riskLevels[deepseek.riskLevel] 
    ? qwen.riskLevel 
    : deepseek.riskLevel;

  // Combine reasoning
  const consensusReasoning = `**Qwen Analysis:** ${qwen.reasoning}\n\n**DeepSeek Analysis:** ${deepseek.reasoning}\n\n**Consensus:** Both models ${agreement > 70 ? 'strongly agree' : agreement > 50 ? 'moderately agree' : 'have different views'} on the market direction.`;

  return {
    consensus: {
      provider: 'consensus',
      signal: consensusSignal,
      confidence: consensusConfidence,
      targetPrice: consensusTargetPrice,
      reasoning: consensusReasoning,
      riskLevel: consensusRiskLevel,
      timeframe: qwen.timeframe, // Use Qwen's timeframe as primary
    },
    individual: {
      qwen,
      deepseek,
    },
    agreement,
    timestamp: new Date(),
  };
}

/**
 * Main function: Get ensemble analysis for a symbol
 * 
 * Note: The input data should now include sentiment, on-chain, and MTA results
 * for the LLMs to use in their analysis.
 */
export async function getEnsembleAnalysis(data: MarketData): Promise<EnsembleResult> {
  // Generate cache key based on symbol and current price range
  // Round price to nearest 1% to allow cache hits for similar prices
  const priceKey = Math.round(data.currentPrice * 100) / 100;
  const cacheKey = `ai:ensemble:${data.symbol}:${priceKey}`;

  // Try to get from cache first
  const result = await cacheGetOrSet<EnsembleResult>(
    cacheKey,
    async () => {
      console.log(`[AI Ensemble] Cache MISS for ${data.symbol}, running analysis...`);
      
      // Run both AI analyses in parallel
      const [qwenAnalysis, deepseekAnalysis] = await Promise.all([
        analyzeWithQwen(data),
        analyzeWithDeepSeek(data),
      ]);

      // Calculate consensus
      return calculateConsensus(qwenAnalysis, deepseekAnalysis);
    },
    { ttl: CacheTTL.VERY_LONG } // 24 hours
  );

  console.log(`[AI Ensemble] Returning ${result ? 'cached' : 'fresh'} analysis for ${data.symbol}`);
  return result;
}
