import { getCurrentPrice, get24hTicker } from './server/binance';

async function test() {
  console.log('Testing Redis Cache...\n');
  
  // Test 1
  console.log('Test 1: getCurrentPrice (BTCUSDT)');
  const t1 = Date.now();
  const p1 = await getCurrentPrice('BTCUSDT');
  console.log(`First call: ${Date.now() - t1}ms, price: $${p1}`);
  
  const t2 = Date.now();
  const p2 = await getCurrentPrice('BTCUSDT');
  console.log(`Second call (cached): ${Date.now() - t2}ms, price: $${p2}`);
  
  // Test 2
  console.log('\nTest 2: get24hTicker (BTCUSDT)');
  const t3 = Date.now();
  const ticker1 = await get24hTicker('BTCUSDT');
  console.log(`First call: ${Date.now() - t3}ms, change: ${ticker1?.priceChangePercent}%`);
  
  const t4 = Date.now();
  const ticker2 = await get24hTicker('BTCUSDT');
  console.log(`Second call (cached): ${Date.now() - t4}ms, change: ${ticker2?.priceChangePercent}%`);
  
  console.log('\n✅ Cache test complete!');
}

test();
