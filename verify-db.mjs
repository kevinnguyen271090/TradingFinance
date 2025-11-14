import postgres from 'postgres';

const sql = postgres('postgresql://postgres.whbkhcfxoaikpadmapny:Trading27100976-1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres');

async function verifyTables() {
  try {
    console.log('🔍 Verifying Supabase PostgreSQL database...\n');
    
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('✅ Tables created:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    
    console.log(`\n📊 Total tables: ${tables.length}`);
    
    // Check if we have the expected 17 tables
    const expectedTables = [
      'achievements',
      'autoTrades',
      'autoTradingLogs',
      'autoTradingSettings',
      'exchangeConnections',
      'historicalPrices',
      'predictions',
      'referrals',
      'shareCards',
      'symbols',
      'technicalIndicators',
      'tradingStrategies',
      'userAchievements',
      'userPreferences',
      'userStats',
      'userWatchlists',
      'users'
    ];
    
    const tableNames = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables:', missingTables.join(', '));
    } else {
      console.log('\n✅ All 17 tables created successfully!');
    }
    
    // Check symbols table
    const symbolCount = await sql`SELECT COUNT(*) as count FROM symbols`;
    console.log(`\n📈 Symbols in database: ${symbolCount[0].count}`);
    
    // Check users table
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👥 Users in database: ${userCount[0].count}`);
    
    console.log('\n✅ Database verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

verifyTables();
