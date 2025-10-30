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
- [ ] Store predictions in database with timestamps
- [ ] Track actual price outcomes
- [ ] Calculate accuracy metrics (% correct)
- [ ] Display prediction history table
- [ ] Show accuracy percentage per timeframe
- [ ] Filter by symbol and date range

### Technical Indicators on Charts
- [ ] Add RSI (Relative Strength Index)
- [ ] Add MACD (Moving Average Convergence Divergence)
- [ ] Add Bollinger Bands
- [ ] Add SMA (Simple Moving Average)
- [ ] Add EMA (Exponential Moving Average)
- [ ] Toggle indicators on/off
- [ ] Indicator settings panel

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

### Goal-Based Strategy (Simplified)
- [ ] Goal input form (target ROI, capital, timeframe, risk tolerance)
- [ ] Strategy generator (3 options: Conservative/Moderate/Aggressive)
- [ ] Strategy details: coin allocation, leverage, entry/exit points
- [ ] Backtesting results display
- [ ] Disclaimer modal with risk warnings
- [ ] Strategy activation button

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

## Phase 2: Advanced Features (User + Cursor AI)

### Advanced ML Models
- [ ] Implement TFT (Temporal Fusion Transformer)
- [ ] Implement GNN (Graph Neural Networks)
- [ ] Implement XGBoost
- [ ] Implement Prophet
- [ ] Ensemble model combining all 5 models
- [ ] Regime detection
- [ ] Feature engineering (200+ features)

### Custom Coin Strategy
- [ ] Custom coin input form
- [ ] Feasibility analyzer
- [ ] Leverage calculator
- [ ] Multiple strategy options
- [ ] Custom disclaimer

### Advanced Auto Trading
- [ ] Stop loss & take profit
- [ ] Limit orders
- [ ] Advanced position sizing (Kelly Criterion)
- [ ] Risk management dashboard
- [ ] Daily loss limits
- [ ] Max drawdown tracking
- [ ] Exit condition checks
- [ ] Reconciliation with Binance

### Performance Analytics
- [ ] Portfolio performance tracking
- [ ] Trade journal
- [ ] Win rate analytics
- [ ] Sharpe ratio calculation
- [ ] Drawdown analysis
- [ ] Performance charts
- [ ] Comparison with benchmarks

### Social Features
- [ ] Community predictions
- [ ] Leaderboard
- [ ] User profiles
- [ ] Upvote/downvote system
- [ ] Comments

### Education Center
- [ ] Trading guides
- [ ] Technical analysis tutorials
- [ ] Risk management lessons
- [ ] Video tutorials
- [ ] Glossary

### Additional Features
- [ ] News & sentiment analysis
- [ ] Market screener
- [ ] Price alerts
- [ ] Email notifications
- [ ] Export trade history
- [ ] Tax reports

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
