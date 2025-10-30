import { drizzle } from "drizzle-orm/mysql2";
import { symbols } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const initialSymbols = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'BNBUSDT', name: 'Binance Coin', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'XRPUSDT', name: 'Ripple', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'ADAUSDT', name: 'Cardano', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'MATICUSDT', name: 'Polygon', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'DOTUSDT', name: 'Polkadot', type: 'crypto' as const, exchange: 'binance', isActive: true },
  { symbol: 'AVAXUSDT', name: 'Avalanche', type: 'crypto' as const, exchange: 'binance', isActive: true },
];

async function seed() {
  console.log('Seeding symbols...');
  
  for (const sym of initialSymbols) {
    try {
      await db.insert(symbols).values(sym).onDuplicateKeyUpdate({
        set: { name: sym.name, updatedAt: new Date() },
      });
      console.log(`✓ ${sym.symbol}`);
    } catch (error) {
      console.error(`✗ ${sym.symbol}:`, error);
    }
  }
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed();
