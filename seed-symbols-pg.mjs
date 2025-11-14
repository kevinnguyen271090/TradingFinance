/**
 * Seed Symbols Script for PostgreSQL
 * Fetches all trading pairs from Binance and populates the symbols table
 */

import postgres from 'postgres';

const sql = postgres('postgresql://postgres.whbkhcfxoaikpadmapny:Trading27100976-1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres');

async function getAllTradingSymbols() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await response.json();
    return data.symbols;
  } catch (error) {
    console.error('Error fetching from Binance:', error);
    throw error;
  }
}

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
    const usdtPairs = binanceSymbols.filter(s => 
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
        
        // PostgreSQL upsert using ON CONFLICT
        await sql`
          INSERT INTO symbols (symbol, name, type, exchange, "isActive", "createdAt", "updatedAt")
          VALUES (
            ${symbol.symbol},
            ${baseAsset},
            'crypto',
            'binance',
            ${symbol.status === 'TRADING'},
            NOW(),
            NOW()
          )
          ON CONFLICT (symbol) 
          DO UPDATE SET
            name = EXCLUDED.name,
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW()
        `;
        
        inserted++;
        
        // Progress indicator every 50 symbols
        if (inserted % 50 === 0) {
          console.log(`  Processed ${inserted}/${usdtPairs.length} symbols...`);
        }
      } catch (error) {
        failed++;
        if (failed <= 5) { // Only show first 5 errors
          console.error(`  Failed to insert ${symbol.symbol}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Seed complete!`);
    console.log(`   Processed: ${inserted}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${usdtPairs.length}`);
    
    // Verify inserted symbols
    const count = await sql`SELECT COUNT(*) as count FROM symbols`;
    console.log(`\n📊 Total symbols in database: ${count[0].count}`);
    
    // Display some popular symbols
    console.log(`\n📈 Popular symbols verified:`);
    const popularSymbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
      'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'
    ];
    
    for (const sym of popularSymbols) {
      const result = await sql`SELECT symbol, name FROM symbols WHERE symbol = ${sym}`;
      if (result.length > 0) {
        console.log(`   ✓ ${result[0].symbol} (${result[0].name})`);
      }
    }
    
    console.log(`\n💡 Tip: Run this script periodically to sync new listings from Binance`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run seed
seedSymbols().then(() => {
  console.log('\n✅ Seed script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Seed script failed:', error);
  process.exit(1);
});
