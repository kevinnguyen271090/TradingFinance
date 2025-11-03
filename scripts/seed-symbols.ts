/**
 * Seed Symbols Script
 * Fetches all trading pairs from Binance and populates the symbols table
 */

import { drizzle } from "drizzle-orm/mysql2";
import { symbols } from "../drizzle/schema";
import { getAllTradingSymbols } from "../server/binance";

const db = drizzle(process.env.DATABASE_URL!);

async function seedSymbols() {
  console.log('🌱 Starting symbols seed from Binance API...\n');
  
  try {
    // Fetch all trading symbols from Binance
    console.log('📡 Fetching trading pairs from Binance...');
    const binanceSymbols = await getAllTradingSymbols();
    
    if (!binanceSymbols || binanceSymbols.length === 0) {
      console.error('❌ No symbols fetched from Binance');
      process.exit(1);
    }
    
    console.log(`✅ Fetched ${binanceSymbols.length} trading pairs\n`);
    
    // Filter for USDT pairs (most liquid and relevant)
    const usdtPairs = binanceSymbols.filter((s: any) => 
      s.symbol.endsWith('USDT') && s.status === 'TRADING'
    );
    
    console.log(`📊 Filtering USDT pairs: ${usdtPairs.length} pairs\n`);
    
    // Insert into database
    console.log('💾 Inserting symbols into database...');
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    
    for (const symbol of usdtPairs) {
      try {
        const baseAsset = symbol.baseAsset || symbol.symbol.replace('USDT', '');
        
        await db.insert(symbols).values({
          symbol: symbol.symbol,
          name: baseAsset,
          type: 'crypto',
          exchange: 'binance',
          isActive: symbol.status === 'TRADING',
        }).onDuplicateKeyUpdate({
          set: { 
            name: baseAsset,
            isActive: symbol.status === 'TRADING',
            updatedAt: new Date() 
          },
        });
        
        inserted++;
        
        // Progress indicator every 50 symbols
        if (inserted % 50 === 0) {
          console.log(`  Processed ${inserted}/${usdtPairs.length} symbols...`);
        }
      } catch (error) {
        failed++;
        if (failed <= 5) { // Only show first 5 errors
          console.error(`  Failed to insert ${symbol.symbol}:`, error);
        }
      }
    }
    
    console.log(`\n✅ Seed complete!`);
    console.log(`   Processed: ${inserted}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${usdtPairs.length}`);
    
    // Display some popular symbols
    console.log(`\n📈 Popular symbols verified:`);
    const popularSymbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
      'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'
    ];
    
    for (const sym of popularSymbols) {
      const found = usdtPairs.find((s: any) => s.symbol === sym);
      if (found) {
        console.log(`   ✓ ${found.symbol} (${found.baseAsset || found.symbol.replace('USDT', '')})`);
      }
    }
    
    console.log(`\n💡 Tip: Run this script periodically to sync new listings from Binance`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedSymbols();
