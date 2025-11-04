import { getKlines } from "./binance";
import { PredictionDirection } from "./ml-predictions";

// Define the structure for a single timeframe analysis result
export interface TimeframeAnalysis {
  timeframe: '1h' | '4h' | '1d' | '1w';
  trend: PredictionDirection; // bullish, bearish, neutral
  signal: 'buy' | 'sell' | 'hold';
  reason: string;
}

// Define the structure for the overall MTA result
export interface MultiTimeframeAnalysis {
  symbol: string;
  analysis: TimeframeAnalysis[];
  overallSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  overallSummary: string;
}

/**
 * Performs a simplified Multi-Timeframe Analysis (MTA) based on Klines data.
 * This is a mock implementation that simulates a basic technical analysis.
 * In a real-world scenario, this would involve complex indicator calculations (e.g., EMA, MACD, RSI).
 * 
 * @param symbol The trading symbol (e.g., 'BTCUSDT')
 * @returns A promise that resolves to a MultiTimeframeAnalysis object.
 */
export async function getMultiTimeframeAnalysis(symbol: string): Promise<MultiTimeframeAnalysis> {
  const timeframes: ('1h' | '4h' | '1d' | '1w')[] = ['1h', '4h', '1d', '1w'];
  const analysis: TimeframeAnalysis[] = [];
  
  // Simulate fetching and analyzing data for each timeframe
  for (const timeframe of timeframes) {
    // Fetch klines (using a small limit for a quick trend check)
    const klines = await getKlines({ symbol, interval: timeframe, limit: 20 });
    
    let trend: PredictionDirection = 'neutral';
    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    let reason: string = 'Price is consolidating.';

    if (klines.length > 0) {
      // Simple trend check: compare the last close price with the average of the first 10 closes
      const closes = klines.map((k: any) => parseFloat(k.close));
      const recentClose = closes[closes.length - 1];
      const historicalAverage = closes.slice(0, 10).reduce((a: number, b: number) => a + b, 0) / 10;
      
      const priceChange = (recentClose - historicalAverage) / historicalAverage;

      if (priceChange > 0.01) { // 1% up
        trend = 'bullish';
        signal = 'buy';
        reason = `Price is up ${priceChange.toFixed(2)}% over the last 10 periods, indicating an upward trend.`;
      } else if (priceChange < -0.01) { // 1% down
        trend = 'bearish';
        signal = 'sell';
        reason = `Price is down ${Math.abs(priceChange).toFixed(2)}% over the last 10 periods, indicating a downward trend.`;
      } else {
        trend = 'neutral';
        signal = 'hold';
        reason = 'Price is consolidating within a tight range.';
      }
    }

    analysis.push({
      timeframe,
      trend,
      signal,
      reason,
    });
  }

  // Aggregate the signals
  const buyCount = analysis.filter(a => a.signal === 'buy').length;
  const sellCount = analysis.filter(a => a.signal === 'sell').length;
  const totalTimeframes = timeframes.length;
  
  let overallSignal: MultiTimeframeAnalysis['overallSignal'] = 'hold';
  let overallSummary: string = 'Mixed signals across timeframes. Maintain current position.';

  if (buyCount >= 3) {
    overallSignal = buyCount === totalTimeframes ? 'strong_buy' : 'buy';
    overallSummary = `Strong bullish alignment across ${buyCount}/${totalTimeframes} timeframes.`;
  } else if (sellCount >= 3) {
    overallSignal = sellCount === totalTimeframes ? 'strong_sell' : 'sell';
    overallSummary = `Strong bearish alignment across ${sellCount}/${totalTimeframes} timeframes.`;
  } else if (buyCount > sellCount) {
    overallSignal = 'hold';
    overallSummary = 'Slightly bullish bias, but not enough conviction for a strong signal.';
  } else if (sellCount > buyCount) {
    overallSignal = 'hold';
    overallSummary = 'Slightly bearish bias, but not enough conviction for a strong signal.';
  }

  return {
    symbol,
    analysis,
    overallSignal,
    overallSummary,
  };
}
