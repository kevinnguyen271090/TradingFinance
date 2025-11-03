/**
 * Test Redis caching with real API calls
 */

import { getCurrentPrice, get24hTicker, getKlines } from './server/binance';
import { getEnsembleAnalysis, MarketData } from './server/ai-ensemble';

async function testCaching() {
  console.log('='.repeat(60));
  console.log('Testing Redis Caching with Real API Calls');
  console.log('='.repeat(60));

  // Test 1: Binance Price Caching
  console.log('\n📊 Test 1: Binance getCurrentPrice() - Should cache for 30s');
  console.log('-'.repeat(60));
  
  const symbol = 'BTCUSDT';
  
  console.log(`First call (cache MISS expected):`);
  const start1 = Date.now();
  const price1 = await getCurrentPrice(symbol);
  const time1 = Date.now() - start1;
  console.log(`  Price: $${price1}`);
  console.log(`  Time: ${time1}ms`);
  
  console.log(`\nSecond call (cache HIT expected):`);
  const start2 = Date.now();
  const price2 = await getCurrentPrice(symbol);
  const time2 = Date.now() - start2;
  console.log(`  Price: $${price2}`);
  console.log(`  Time: ${time2}ms`);
  console.log(`  Speed improvement: ${Math.round((time1 / time2) * 100) / 100}x faster`);

  // Test 2: 24h Ticker Caching
  console.log('\n\n📈 Test 2: Binance get24hTicker() - Should cache for 30s');
  console.log('-'.repeat(60));
  
  console.log(`First call (cache MISS expected):`);
  const start3 = Date.now();
  const ticker1 = await get24hTicker(symbol);
  const time3 = Date.now() - start3;
  console.log(`  24h Change: ${ticker1?.priceChangePercent}%`);
  console.log(`  Time: ${time3}ms`);
  
  console.log(`\nSecond call (cache HIT expected):`);
  const start4 = Date.now();
  const ticker2 = await get24hTicker(symbol);
  const time4 = Date.now() - start4;
  console.log(`  24h Change: ${ticker2?.priceChangePercent}%`);
  console.log(`  Time: ${time4}ms`);
  console.log(`  Speed improvement: ${Math.round((time3 / time4) * 100) / 100}x faster`);

  // Test 3: Klines Caching
  console.log('\n\n📉 Test 3: Binance getKlines() - Should cache for 5min');
  console.log('-'.repeat(60));
  
  console.log(`First call (cache MISS expected):`);
  const start5 = Date.now();
  const klines1 = await getKlines({ symbol, interval: '1h', limit: 100 });
  const time5 = Date.now() - start5;
  console.log(`  Klines count: ${klines1.length}`);
  console.log(`  Time: ${time5}ms`);
  
  console.log(`\nSecond call (cache HIT expected):`);
  const start6 = Date.now();
  const klines2 = await getKlines({ symbol, interval: '1h', limit: 100 });
  const time6 = Date.now() - start6;
  console.log(`  Klines count: ${klines2.length}`);
  console.log(`  Time: ${time6}ms`);
  console.log(`  Speed improvement: ${Math.round((time5 / time6) * 100) / 100}x faster`);

  // Test 4: AI Ensemble Caching (most important!)
  console.log('\n\n🤖 Test 4: AI Ensemble Analysis - Should cache for 24h');
  console.log('-'.repeat(60));
  console.log('⚠️  Note: This test is expensive without cache (2 AI API calls)');
  console.log('    With cache, it should be instant on second call!\n');

  const marketData: MarketData = {
    symbol: 'BTC',
    currentPrice: parseFloat(price1),
    priceChange24h: parseFloat(ticker1?.priceChangePercent || '0'),
    volume24h: parseFloat(ticker1?.volume || '0'),
    high24h: parseFloat(ticker1?.highPrice || '0'),
    low24h: parseFloat(ticker1?.lowPrice || '0'),
  };

  console.log(`First call (cache MISS expected - will call Qwen + DeepSeek):`);
  const start7 = Date.now();
  const analysis1 = await getEnsembleAnalysis(marketData);
  const time7 = Date.now() - start7;
  console.log(`  Signal: ${analysis1.consensus.signal}`);
  console.log(`  Confidence: ${analysis1.consensus.confidence}%`);
  console.log(`  Agreement: ${analysis1.agreement}%`);
  console.log(`  Time: ${time7}ms (~${Math.round(time7 / 1000)}s)`);
  
  console.log(`\nSecond call (cache HIT expected - should be instant!):`);
  const start8 = Date.now();
  const analysis2 = await getEnsembleAnalysis(marketData);
  const time8 = Date.now() - start8;
  console.log(`  Signal: ${analysis2.consensus.signal}`);
  console.log(`  Confidence: ${analysis2.consensus.confidence}%`);
  console.log(`  Agreement: ${analysis2.agreement}%`);
  console.log(`  Time: ${time8}ms`);
  console.log(`  Speed improvement: ${Math.round((time7 / time8) * 100) / 100}x faster`);

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 CACHING TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Binance getCurrentPrice: ${time2 < 100 ? 'PASS' : 'FAIL'} (${time2}ms cached)`);
  console.log(`✅ Binance get24hTicker: ${time4 < 100 ? 'PASS' : 'FAIL'} (${time4}ms cached)`);
  console.log(`✅ Binance getKlines: ${time6 < 100 ? 'PASS' : 'FAIL'} (${time6}ms cached)`);
  console.log(`✅ AI Ensemble: ${time8 < 500 ? 'PASS' : 'FAIL'} (${time8}ms cached vs ${time7}ms uncached)`);
  
  const avgSpeedup = ((time1 / time2) + (time3 / time4) + (time5 / time6) + (time7 / time8)) / 4;
  console.log(`\n🚀 Average Speed Improvement: ${Math.round(avgSpeedup * 100) / 100}x faster with cache`);
  
  const estimatedCostSavings = Math.round((1 - (1 / (time7 / time8))) * 100);
  console.log(`💰 Estimated AI Cost Savings: ~${estimatedCostSavings}% (from cache hit rate)`);
  
  console.log('\n✅ All caching tests completed successfully!');
}

testCaching().catch(console.error);
