/**
 * Sentiment Analysis Service
 * 
 * Fetches real sentiment data from multiple sources:
 * - Manus APIs: Reddit, Twitter, YouTube
 * - LunarCrush: Social sentiment data (free tier)
 * - Caches results to avoid rate limiting
 */

import { cacheGetOrSet } from './lib/redis';
import { callDataApi } from './_core/dataApi';

export interface SentimentAnalysis {
  symbol: string;
  score: number; // -1.0 (very bearish) to 1.0 (very bullish)
  sourceCount: number;
  lastUpdated: Date;
  summary: string;
  sources: {
    reddit?: number;
    twitter?: number;
    youtube?: number;
    lunarcrush?: number;
  };
}

/**
 * Get sentiment score for a symbol with caching
 */
export async function getSentiment(symbol: string): Promise<SentimentAnalysis> {
  const cacheKey = `sentiment:${symbol}`;
  
  return cacheGetOrSet<SentimentAnalysis>(
    cacheKey,
    async () => {
      try {
        const [redditScore, twitterScore, youtubeScore, lunarcrushScore] = await Promise.allSettled([
          getRedditSentiment(symbol),
          getTwitterSentiment(symbol),
          getYoutubeSentiment(symbol),
          getLunarcrushSentiment(symbol),
        ]);

        const scores = [
          redditScore.status === 'fulfilled' ? redditScore.value : 0,
          twitterScore.status === 'fulfilled' ? twitterScore.value : 0,
          youtubeScore.status === 'fulfilled' ? youtubeScore.value : 0,
          lunarcrushScore.status === 'fulfilled' ? lunarcrushScore.value : 0,
        ].filter(s => s !== 0);

        const avgScore = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;

        // Normalize to -1.0 to 1.0
        const normalizedScore = Math.max(-1, Math.min(1, avgScore / 100));

        let summary: string;
        if (normalizedScore > 0.5) {
          summary = "Extreme bullish sentiment across social media.";
        } else if (normalizedScore > 0.1) {
          summary = "Moderately positive sentiment, with growing interest.";
        } else if (normalizedScore > -0.1) {
          summary = "Neutral market sentiment.";
        } else if (normalizedScore > -0.5) {
          summary = "Slightly negative sentiment, caution advised.";
        } else {
          summary = "Overwhelmingly bearish sentiment, fear in the market.";
        }

        return {
          symbol,
          score: parseFloat(normalizedScore.toFixed(2)),
          sourceCount: scores.length,
          lastUpdated: new Date(),
          summary,
          sources: {
            reddit: redditScore.status === 'fulfilled' ? redditScore.value : undefined,
            twitter: twitterScore.status === 'fulfilled' ? twitterScore.value : undefined,
            youtube: youtubeScore.status === 'fulfilled' ? youtubeScore.value : undefined,
            lunarcrush: lunarcrushScore.status === 'fulfilled' ? lunarcrushScore.value : undefined,
          },
        };
      } catch (error) {
        console.error(`[Sentiment] Error fetching sentiment for ${symbol}:`, error);
        // Return neutral sentiment on error
        return {
          symbol,
          score: 0,
          sourceCount: 0,
          lastUpdated: new Date(),
          summary: "Unable to fetch sentiment data at this time.",
          sources: {},
        };
      }
    },
    { ttl: 3600 } // Cache for 1 hour
  );
}

/**
 * Get Reddit sentiment for a symbol
 */
async function getRedditSentiment(symbol: string): Promise<number> {
  try {
    // Extract coin name from symbol (e.g., BTCUSDT -> Bitcoin)
    const coinName = getCoinNameFromSymbol(symbol);
    
    const result = await callDataApi('Manus/reddit_sentiment', {
      query: {
        subreddit: 'cryptocurrency',
        keyword: coinName,
        timeframe: '24h',
      },
    });

    if (result && typeof result === 'object' && 'sentiment_score' in result) {
      return (result as any).sentiment_score; // -100 to 100
    }
    return 0;
  } catch (error) {
    console.warn(`[Sentiment] Reddit API error for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Get Twitter sentiment for a symbol
 */
async function getTwitterSentiment(symbol: string): Promise<number> {
  try {
    const coinName = getCoinNameFromSymbol(symbol);
    
    const result = await callDataApi('Manus/twitter_sentiment', {
      query: {
        query: coinName,
        timeframe: '24h',
      },
    });

    if (result && typeof result === 'object' && 'sentiment_score' in result) {
      return (result as any).sentiment_score; // -100 to 100
    }
    return 0;
  } catch (error) {
    console.warn(`[Sentiment] Twitter API error for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Get YouTube sentiment for a symbol
 */
async function getYoutubeSentiment(symbol: string): Promise<number> {
  try {
    const coinName = getCoinNameFromSymbol(symbol);
    
    const result = await callDataApi('Manus/youtube_sentiment', {
      query: {
        query: coinName,
        timeframe: '24h',
      },
    });

    if (result && typeof result === 'object' && 'sentiment_score' in result) {
      return (result as any).sentiment_score; // -100 to 100
    }
    return 0;
  } catch (error) {
    console.warn(`[Sentiment] YouTube API error for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Get LunarCrush sentiment for a symbol (free tier)
 */
async function getLunarcrushSentiment(symbol: string): Promise<number> {
  try {
    const coinName = getCoinNameFromSymbol(symbol);
    
    // LunarCrush free tier: 100 calls/day
    const result = await callDataApi('LunarCrush/get_coin_data', {
      query: {
        coin: coinName,
      },
    });

    if (result && typeof result === 'object' && 'sentiment' in result) {
      // LunarCrush returns -100 to 100
      return (result as any).sentiment;
    }
    return 0;
  } catch (error) {
    console.warn(`[Sentiment] LunarCrush API error for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Convert trading symbol to coin name
 * e.g., BTCUSDT -> Bitcoin, ETHUSDT -> Ethereum
 */
function getCoinNameFromSymbol(symbol: string): string {
  const coinMap: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'SOL': 'Solana',
    'XRP': 'Ripple',
    'ADA': 'Cardano',
    'DOGE': 'Dogecoin',
    'MATIC': 'Polygon',
    'DOT': 'Polkadot',
    'AVAX': 'Avalanche',
    'LINK': 'Chainlink',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'XLM': 'Stellar',
    'ATOM': 'Cosmos',
  };

  const base = symbol.replace('USDT', '').replace('BUSD', '').replace('USDC', '');
  return coinMap[base] || base;
}
