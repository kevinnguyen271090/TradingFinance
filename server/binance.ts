import Binance from 'binance-api-node';

/**
 * Create a public Binance client (no API keys needed)
 * For public data like prices, tickers, etc.
 */
export function createPublicBinanceClient() {
  return Binance();
}

/**
 * Create an authenticated Binance client with user's API keys
 * For trading operations
 */
export function createAuthenticatedBinanceClient(apiKey: string, apiSecret: string) {
  return Binance({
    apiKey,
    apiSecret,
  });
}

/**
 * Get current price for a symbol
 */
export async function getCurrentPrice(symbol: string): Promise<string> {
  const client = createPublicBinanceClient();
  const ticker = await (client as any).prices({ symbol });
  return ticker[symbol] || '0';
}

/**
 * Get 24h ticker data
 */
export async function get24hTicker(symbol: string) {
  const client = createPublicBinanceClient();
  const ticker = await (client as any).dailyStats({ symbol });
  return ticker;
}

/**
 * Get historical klines (candlestick data)
 */
export async function getKlines(params: {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  limit?: number;
  startTime?: number;
  endTime?: number;
}) {
  const client = createPublicBinanceClient();
  const candles = await (client as any).candles({
    symbol: params.symbol,
    interval: params.interval,
    limit: params.limit || 100,
    startTime: params.startTime,
    endTime: params.endTime,
  });
  return candles;
}

/**
 * Get all trading symbols
 */
export async function getAllTradingSymbols() {
  const client = createPublicBinanceClient();
  const exchangeInfo = await (client as any).exchangeInfo();
  return exchangeInfo.symbols.filter((s: any) => s.status === 'TRADING');
}

/**
 * Test API key permissions
 */
export async function testApiKey(apiKey: string, apiSecret: string): Promise<{
  valid: boolean;
  permissions: {
    canRead: boolean;
    canTrade: boolean;
    canWithdraw: boolean;
  };
  error?: string;
}> {
  try {
    const client = createAuthenticatedBinanceClient(apiKey, apiSecret);
    const accountInfo = await (client as any).accountInfo();
    
    return {
      valid: true,
      permissions: {
        canRead: accountInfo.canTrade !== undefined,
        canTrade: accountInfo.canTrade || false,
        canWithdraw: accountInfo.canWithdraw || false,
      },
    };
  } catch (error: any) {
    return {
      valid: false,
      permissions: {
        canRead: false,
        canTrade: false,
        canWithdraw: false,
      },
      error: error.message || 'Invalid API key',
    };
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(apiKey: string, apiSecret: string) {
  const client = createAuthenticatedBinanceClient(apiKey, apiSecret);
  const accountInfo = await (client as any).accountInfo();
  return accountInfo.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
}
