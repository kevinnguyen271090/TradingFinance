# CryptoTrader Pro - TODO List

## Phase 1: MVP Build (Manus AI)

### Core Infrastructure
- [x] Init Next.js project with Supabase
- [x] Setup database schema (12 tables)
- [x] Configure TimescaleDB extension
- [ ] Setup Redis cache (Upstash)
- [ ] Configure environment variables

### Authentication & User Management
- [x] Implement Manus OAuth login
- [x] User profile page
- [x] Risk profile setup wizard
- [x] User preferences management

### Market Data & Display
- [x] Integrate Binance WebSocket for real-time data
- [x] Market overview dashboard
- [x] Symbol detail page with TradingView charts
- [x] Price ticker display
- [x] Watchlist functionality
- [ ] Top movers/gainers/losers

### ML Predictions (Basic)
- [x] Implement simple LSTM model for demo
- [x] Prediction display on symbol page
- [x] Confidence scores and reasoning
- [x] Buy/Sell/Hold signals

### Multi-AI Ensemble System
- [x] Integrate Qwen-2.5 for technical analysis
- [x] Integrate DeepSeek-V3 for risk assessment
- [x] Create consensus engine (weighted voting)
- [ ] AI prediction caching and scheduling
- [x] Display multi-AI analysis on symbol page
- [x] Show individual AI opinions + consensus
- [x] Confidence scoring system (>75% threshold)

### Prediction History & Accuracy Tracking
- [x] Store predictions in database with timestamps
- [ ] Track actual price outcomes (TODO: background job)
- [x] Calculate accuracy metrics (% correct)
- [x] Display prediction history table
- [x] Show accuracy percentage per timeframe
- [x] Filter by symbol and date range

### Technical Indicators on Charts
- [x] Add Fibonacci MAs (MA7, MA13, MA21, MA34, MA55, MA89, MA144, MA233, MA377, MA610)
- [x] Add RSI (Relative Strength Index)
- [ ] Add MACD (Moving Average Convergence Divergence)
- [ ] Add Bollinger Bands
- [x] Toggle indicators on/off
- [x] Indicator settings panel
- [x] Color-code MAs for easy identification

### Binance API Integration
- [x] API key connection page (in Settings)
- [ ] API key encryption (TODO: implement proper encryption)
- [x] API key verification
- [x] Test connection functionality
- [x] Display connection status
- [ ] Balance display
- [ ] Order history

### Auto Trading (Basic)
- [ ] Auto trading settings page
- [ ] Basic trading engine
- [ ] Market order execution
- [ ] Position tracking
- [ ] Trade logging

### Goal-Based Auto Trading
- [x] Goal input form (target ROI, capital, timeframe, risk tolerance)
- [x] Strategy generator using AI ensemble (3 options: Conservative/Moderate/Aggressive)
- [x] Strategy details: coin allocation, position sizing, entry/exit points
- [x] Backtesting results display (simulated)
- [x] Disclaimer modal with comprehensive risk warnings
- [x] Strategy activation flow
- [ ] Auto trade execution based on AI signals (TODO: background worker)
- [ ] Real-time trade logs and performance tracking (TODO: monitoring dashboard)

### UI/UX
- [ ] Responsive design (mobile-friendly)
- [ ] Dark theme implementation
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications

### Deployment
- [ ] Deploy to Vercel
- [ ] Configure production environment
- [ ] Create user guide
- [ ] Save checkpoint

---

## Phase 2: Advanced Features (Priority-Based Roadmap)

### P0 - Quick Wins (Weeks 1-2) - CRITICAL
- [ ] Social Sharing: Share cards with prediction accuracy, profit/loss, achievements
- [ ] Social Sharing: One-click sharing to Twitter, Facebook, Telegram, Discord
- [ ] Social Sharing: Referral tracking with unique links
- [ ] Referral Program: 20% lifetime commission for referrers
- [ ] Referral Program: 1 month free trial for referees
- [ ] Referral Program: Leaderboard for top referrers
- [ ] Push Notifications: Price targets hit alerts
- [ ] Push Notifications: New AI signals (high confidence)
- [ ] Push Notifications: Prediction results notifications
- [ ] Push Notifications: Achievement unlocked alerts

### P0 - Foundation Features (Weeks 3-8) - CRITICAL
- [ ] Backtesting System: Historical data replay engine (5 years OHLCV)
- [ ] Backtesting System: Strategy performance metrics (Sharpe, max drawdown, win rate)
- [ ] Backtesting System: Visual equity curve and trade distribution
- [ ] Backtesting System: Monte Carlo simulation for risk assessment
- [ ] Backtesting System: Compare multiple strategies side-by-side
- [ ] Dynamic Position Sizing: Kelly Criterion implementation
- [ ] Dynamic Position Sizing: Confidence score integration
- [ ] Dynamic Position Sizing: Volatility adjustment
- [ ] Trailing Stop Loss & Take Profit: Trailing stop implementation
- [ ] Trailing Stop Loss & Take Profit: Partial take profits (50% at target)
- [ ] Trailing Stop Loss & Take Profit: Breakeven stop after +5%
- [ ] Real-Time Monitoring Dashboard: Live P&L tracking with sparklines
- [ ] Real-Time Monitoring Dashboard: Active positions table
- [ ] Real-Time Monitoring Dashboard: Trade execution logs
- [ ] Real-Time Monitoring Dashboard: Risk metrics (drawdown, position sizes)

### P1 - Growth Features (Weeks 9-16) - HIGH
- [ ] Multi-Timeframe Analysis: Fetch OHLCV for 6 timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- [ ] Multi-Timeframe Analysis: AI analyzes alignment across timeframes
- [ ] Multi-Timeframe Analysis: Consensus scoring system
- [ ] Leaderboard & Rankings: Monthly ROI %, Total profit $, Win rate %, Accuracy %
- [ ] Leaderboard & Rankings: Badges (Gold Trader, Diamond Predictor)
- [ ] Leaderboard & Rankings: Levels (Novice → Expert → Master)
- [ ] Leaderboard & Rankings: Achievements (10-win streak, $10k profit)
- [ ] Portfolio Rebalancing: Weekly rebalancing automation
- [ ] Portfolio Rebalancing: Sell winners, buy losers (mean reversion)
- [ ] Portfolio Rebalancing: Risk parity maintenance
- [ ] Copy Trading: Browse top traders by performance
- [ ] Copy Trading: One-click copy with customizable allocation
- [ ] Copy Trading: Profit sharing (10-20% to trader)
- [ ] Educational Content: "How to Read Charts 101" course
- [ ] Educational Content: "Risk Management Basics" guide
- [ ] Educational Content: "Understanding Fibonacci MAs" tutorial
- [ ] Educational Content: "Interpreting AI Signals" guide

### P2 - Optimization Features (Weeks 17-24) - MEDIUM
- [ ] On-Chain Data Integration: Glassnode API integration
- [ ] On-Chain Data Integration: Exchange inflows/outflows tracking
- [ ] On-Chain Data Integration: Whale wallet movements
- [ ] On-Chain Data Integration: MVRV ratio, Active addresses
- [ ] Sentiment Analysis: LunarCrush API integration
- [ ] Sentiment Analysis: Twitter API v2 integration
- [ ] Sentiment Analysis: Social volume, sentiment score, influencer activity
- [ ] Order Book Analysis: Bid/ask imbalance detection
- [ ] Order Book Analysis: Large order walls (>$1M) tracking
- [ ] Order Book Analysis: Order book depth visualization
- [ ] AI Trading Assistant: GPT-4 chatbot for strategy questions
- [ ] AI Trading Assistant: RAG (Retrieval Augmented Generation)
- [ ] AI Trading Assistant: "Why did AI predict X?" explanations
- [ ] Daily Challenges & Quests: "Make 3 predictions today" → +50 points
- [ ] Daily Challenges & Quests: "Achieve 70% accuracy this week" → Bronze Badge
- [ ] Daily Challenges & Quests: "Refer 1 friend" → 10% discount
- [ ] Community Forum: Discussion threads per symbol
- [ ] Community Forum: Strategy sharing
- [ ] Community Forum: Q&A with moderators
- [ ] Community Forum: Discord integration

### Additional Features (Lower Priority)
- [ ] Correlation Matrix & Pair Trading: Real-time correlation heatmap
- [ ] Correlation Matrix & Pair Trading: Identify divergences
- [ ] Arbitrage Detection: Price differences across exchanges
- [ ] Market Screener: Filter by volume, volatility, momentum
- [ ] Price Alerts: Custom price alerts
- [ ] Email Notifications: Daily summary emails
- [ ] Export Trade History: CSV/Excel export
- [ ] Tax Reports: Capital gains/losses calculation

---

## Bugs & Issues

(None yet)

---

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Telegram bot integration
- [ ] Copy trading
- [ ] Backtesting tool
- [ ] Paper trading mode
- [ ] Multi-exchange support (Coinbase, Kraken, etc.)
- [ ] Futures trading
- [ ] Options trading
- [ ] DeFi integration

### Phase 2 Progress - Social Sharing Implementation

#### Database Schema (Completed)
- [x] Create shareCards table for storing generated share card images
- [x] Create referrals table for tracking referral program
- [x] Create userStats table for aggregated user statistics
- [x] Create achievements table for available achievements
- [x] Create userAchievements table for user unlocked achievements

#### Share Card Generator (In Progress)
- [ ] Create share card template component
- [ ] Implement image generation with Puppeteer
- [ ] Upload generated images to S3
- [ ] Store share card metadata in database

#### Social Sharing UI (Pending)
- [ ] Add share buttons to Prediction History page
- [ ] Add share buttons to Symbol Detail page
- [ ] Add share buttons to Dashboard
- [ ] Add share buttons to Auto Trading page
- [ ] Implement one-click sharing to Twitter, Facebook, Telegram, Discord

#### Referral System (Pending)
- [ ] Generate unique referral codes for each user
- [ ] Create referral dashboard page
- [ ] Track referral clicks and conversions
- [ ] Implement reward calculation
- [ ] Create referral leaderboard


---

## Phase 2A - Infrastructure & Cost Optimization (Weeks 1-2)

### Redis Cache (Upstash) - CRITICAL ✅ COMPLETED
- [x] Sign up for Upstash account
- [x] Create Redis database
- [x] Add UPSTASH_REDIS_REST_URL to environment variables
- [x] Add UPSTASH_REDIS_REST_TOKEN to environment variables
- [x] Install @upstash/redis package
- [x] Create Redis client wrapper in server/lib/redis.ts
- [x] Implement cache helper functions (get, set, del, expire)
- [x] Cache AI predictions (24h TTL)
- [x] Cache Binance price data (30s TTL)
- [x] Cache technical indicators (5min TTL)
- [ ] Add cache invalidation on new predictions
- [ ] Test cache hit rates in production

### Email Notifications (Resend) - HIGH PRIORITY ✅ COMPLETED
- [x] Sign up for Resend account
- [x] Add RESEND_API_KEY to environment variables
- [x] Install resend package
- [x] Install react-email package
- [x] Create email service in server/lib/email.ts
- [x] Create PriceAlertEmail template
- [x] Create AISignalEmail template
- [x] Create AchievementEmail template
- [x] Create WeeklySummaryEmail template
- [x] Implement sendEmail helper function
- [ ] Create email notification router in tRPC
- [ ] Add email preferences to user settings
- [ ] Test email delivery in production

### Social Sharing System - HIGH PRIORITY
- [ ] Create share card generator using Puppeteer
- [ ] Design share card templates (prediction, P&L, achievement)
- [ ] Implement image generation endpoint
- [ ] Upload generated images to Manus Storage
- [ ] Store share card metadata in database
- [ ] Create ShareButton component
- [ ] Add share buttons to Prediction History page
- [ ] Add share buttons to Symbol Detail page
- [ ] Add share buttons to Dashboard
- [ ] Implement Twitter share functionality
- [ ] Implement Facebook share functionality
- [ ] Implement Telegram share functionality
- [ ] Track share counts

### Referral Program - HIGH PRIORITY
- [ ] Generate unique referral codes for users
- [ ] Create referral tracking middleware
- [ ] Store referral clicks in database
- [ ] Track conversions (signup via referral)
- [ ] Calculate referral rewards (20% commission)
- [ ] Create Referral Dashboard page
- [ ] Display referral link and code
- [ ] Show referral stats (clicks, conversions, earnings)
- [ ] Create referral leaderboard
- [ ] Add referral bonus to new user signup

---

## Phase 2B - Data Enhancement (Weeks 3-4)

### Sentiment Analysis (Free APIs) - MEDIUM PRIORITY
- [ ] Implement Reddit API integration (Manus built-in)
- [ ] Fetch posts from r/cryptocurrency
- [ ] Fetch posts from r/Bitcoin
- [ ] Fetch posts from r/CryptoMarkets
- [ ] Calculate Reddit sentiment score
- [ ] Implement Twitter API integration (Manus built-in)
- [ ] Fetch tweets from crypto influencers
- [ ] Calculate Twitter sentiment score
- [ ] Implement YouTube API integration (Manus built-in)
- [ ] Fetch crypto analysis videos
- [ ] Calculate YouTube sentiment score
- [ ] Implement LunarCrush free tier integration
- [ ] Fetch social metrics for top 10 coins
- [ ] Aggregate sentiment scores
- [ ] Display sentiment data on symbol pages
- [ ] Cache sentiment data (1h TTL)

### On-Chain Data Integration (Free APIs) - MEDIUM PRIORITY
- [ ] Implement CoinGecko API integration
- [ ] Fetch market cap, volume, price changes
- [ ] Fetch social metrics and developer activity
- [ ] Implement Blockchain.com API (Bitcoin)
- [ ] Fetch total transactions per day
- [ ] Fetch hash rate and mempool size
- [ ] Implement Etherscan API (Ethereum)
- [ ] Fetch gas prices and network congestion
- [ ] Fetch active addresses
- [ ] Implement BscScan API (BSC tokens)
- [ ] Fetch BSC on-chain metrics
- [ ] Aggregate on-chain data
- [ ] Display on-chain metrics on symbol pages
- [ ] Cache on-chain data (15min TTL)

### Multi-Timeframe Analysis - HIGH PRIORITY
- [ ] Fetch OHLCV data for 6 timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- [ ] Implement timeframe alignment analysis
- [ ] Calculate consensus score across timeframes
- [ ] Integrate multi-timeframe analysis into AI ensemble
- [ ] Display timeframe analysis on symbol pages
- [ ] Add timeframe selector to charts

---

## Phase 2C - Advanced Trading Features (Weeks 5-8)

### Backtesting System - CRITICAL
- [ ] Create backtesting database tables
- [ ] Fetch historical OHLCV data (5 years)
- [ ] Store historical data in TimescaleDB
- [ ] Implement backtest engine
- [ ] Calculate strategy performance metrics (Sharpe, max drawdown, win rate)
- [ ] Generate equity curve
- [ ] Implement Monte Carlo simulation
- [ ] Create Backtesting page UI
- [ ] Display backtest results with charts
- [ ] Allow strategy comparison
- [ ] Export backtest results to CSV

### Dynamic Position Sizing - HIGH PRIORITY
- [ ] Implement Kelly Criterion calculator
- [ ] Integrate confidence scores into position sizing
- [ ] Add volatility adjustment
- [ ] Create position sizing settings in auto trading
- [ ] Test position sizing with historical data

### Trailing Stop Loss & Take Profit - HIGH PRIORITY
- [ ] Implement trailing stop loss logic
- [ ] Implement partial take profit logic (50% at target)
- [ ] Implement breakeven stop (after +5%)
- [ ] Add trailing stop settings to auto trading
- [ ] Test trailing stops with paper trading

### Real-Time Monitoring Dashboard - CRITICAL
- [ ] Create Monitoring Dashboard page
- [ ] Display live P&L tracking with sparklines
- [ ] Show active positions table
- [ ] Display trade execution logs
- [ ] Show risk metrics (drawdown, position sizes)
- [ ] Add WebSocket for real-time updates
- [ ] Implement dashboard auto-refresh

---

## Phase 2 Optimization & Testing

### Performance Optimization
- [ ] Implement Redis caching for all API calls
- [ ] Optimize database queries with indexes
- [ ] Implement lazy loading for charts
- [ ] Optimize image loading with CDN
- [ ] Reduce bundle size with code splitting

### Testing
- [ ] Test Redis cache hit rates (target >70%)
- [ ] Test email delivery rates
- [ ] Test social sharing on all platforms
- [ ] Test referral tracking accuracy
- [ ] Test sentiment analysis accuracy
- [ ] Test on-chain data accuracy
- [ ] Test backtesting engine with known strategies
- [ ] Load testing with 100+ concurrent users

### Documentation
- [ ] Update userGuide.md with new features
- [ ] Document API integrations
- [ ] Document caching strategy
- [ ] Create admin guide for monitoring

### Checkpoint
- [ ] Mark all completed features in todo.md
- [ ] Test all features end-to-end
- [ ] Save checkpoint: "Phase 2 Complete: Advanced Features"


---

## 🐛 Bug Fixes - URGENT ✅ COMPLETED

### Available Assets & Browse Assets - FIXED
- [x] Implement Binance symbols API endpoint in tRPC
- [x] Fetch all trading pairs from Binance (436 USDT pairs)
- [x] Cache symbols list (1 hour TTL)
- [x] Display symbols in Available Assets section
- [x] Add "Add to Watchlist" button for each symbol
- [x] Fix empty state on Dashboard
- [x] Create seed script to auto-fetch from Binance API
- [x] Add tRPC endpoint for admin to refresh symbols
- [ ] Add search/filter functionality (future enhancement)

### Other Issues
- [x] Check if all tRPC endpoints are working
- [ ] Test watchlist add/remove functionality
- [ ] Verify prediction creation flow
- [ ] Test auto trading configuration
