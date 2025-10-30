import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, ArrowUpRight, ArrowDownRight, Star, StarOff, TrendingUp, Activity } from "lucide-react";
import { Link, useParams } from "wouter";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { toast } from "sonner";
import { AIEnsemblePanel } from "@/components/AIEnsemblePanel";

function PredictionsPanel({ symbol, ticker }: { symbol: string; ticker: any }) {
  const currentPrice = ticker ? parseFloat(ticker.lastPrice || '0') : 0;
  const priceChange24h = ticker ? parseFloat(ticker.priceChangePercent || '0') : 0;

  const { data: predictions, isLoading } = trpc.predictions.generate.useQuery(
    {
      symbol,
      currentPrice,
      priceChange24h,
    },
    { enabled: !!ticker, refetchInterval: 60000 } // Refresh every minute
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No predictions available</p>
        </CardContent>
      </Card>
    );
  }

  const getSignalBadgeVariant = (signal: string) => {
    if (signal.includes('buy')) return 'default';
    if (signal.includes('sell')) return 'destructive';
    return 'secondary';
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'bullish') return <ArrowUpRight className="h-5 w-5 text-green-500" />;
    if (direction === 'bearish') return <ArrowDownRight className="h-5 w-5 text-red-500" />;
    return <Activity className="h-5 w-5 text-yellow-500" />;
  };

  const getTimeframeLabel = (timeframe: string) => {
    if (timeframe === 'short') return 'Short-term (1-7 days)';
    if (timeframe === 'medium') return 'Medium-term (1-4 weeks)';
    return 'Long-term (1-6 months)';
  };

  return (
    <div className="space-y-4">
      {predictions.map((pred: any, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDirectionIcon(pred.direction)}
                <CardTitle className="capitalize">{getTimeframeLabel(pred.timeframe)}</CardTitle>
              </div>
              <Badge variant={getSignalBadgeVariant(pred.signal)} className="capitalize">
                {pred.signal.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription>
              Confidence: {pred.confidence}% • {pred.direction.charAt(0).toUpperCase() + pred.direction.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-xl font-bold font-mono">${pred.currentPrice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Target Price</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold font-mono">${pred.targetPrice}</p>
                  <Badge variant={pred.priceChange > 0 ? 'default' : 'destructive'}>
                    {pred.priceChange > 0 ? '+' : ''}{pred.priceChange.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Analysis:</p>
              <ul className="space-y-1">
                {pred.reasoning.map((reason: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ⚠️ This is a demo prediction. Phase 2 will include real ML models with higher accuracy.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PriceChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval] = useState<'1h' | '4h' | '1d'>('1h');
  
  const { data: klines, isLoading } = trpc.market.getKlines.useQuery(
    { symbol, interval, limit: 100 },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Transform data
    const chartData = klines.map((k: any) => ({
      time: Math.floor(k.openTime / 1000),
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
    }));

    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [klines]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={interval === '1h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInterval('1h')}
            >
              1H
            </Button>
            <Button
              variant={interval === '4h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInterval('4h')}
            >
              4H
            </Button>
            <Button
              variant={interval === '1d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInterval('1d')}
            >
              1D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full" />
        )}
      </CardContent>
    </Card>
  );
}

export default function SymbolDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { user } = useAuth();
  
  const { data: symbolData } = trpc.symbols.getBySymbol.useQuery(
    { symbol: symbol || '' },
    { enabled: !!symbol }
  );

  const { data: ticker, isLoading: tickerLoading } = trpc.market.get24hTicker.useQuery(
    { symbol: symbol || '' },
    { enabled: !!symbol, refetchInterval: 5000 }
  );

  const { data: watchlist } = trpc.watchlist.list.useQuery(undefined, { enabled: !!user });
  const addToWatchlist = trpc.watchlist.add.useMutation();
  const removeFromWatchlist = trpc.watchlist.remove.useMutation();
  const utils = trpc.useUtils();

  const isInWatchlist = watchlist?.some(w => w.symbolId === symbolData?.id);

  const handleWatchlistToggle = async () => {
    if (!symbolData || !user) {
      toast.error('Please login to use watchlist');
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync({ symbolId: symbolData.id });
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist.mutateAsync({ symbolId: symbolData.id });
        toast.success('Added to watchlist');
      }
      utils.watchlist.list.invalidate();
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  if (!symbol) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Symbol not found</p>
      </div>
    );
  }

  const priceChange = ticker ? parseFloat(ticker.priceChangePercent || '0') : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Symbol Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{symbol}</h1>
                <Badge variant="outline" className="capitalize">
                  {symbolData?.type || 'crypto'}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">{symbolData?.name}</p>
            </div>
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchlistToggle}
                disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
              >
                {isInWatchlist ? (
                  <>
                    <Star className="h-4 w-4 mr-2 fill-current" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Price Info */}
          {tickerLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading price...</span>
            </div>
          ) : ticker ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold font-mono text-foreground">
                ${parseFloat(ticker.lastPrice || '0').toLocaleString()}
              </span>
              <Badge variant={isPositive ? "default" : "destructive"} className="gap-1 text-lg px-3 py-1">
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(priceChange).toFixed(2)}%
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Stats Grid */}
        {ticker && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>24h High</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono text-foreground">
                  ${parseFloat(ticker.highPrice || '0').toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>24h Low</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono text-foreground">
                  ${parseFloat(ticker.lowPrice || '0').toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>24h Volume</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono text-foreground">
                  {parseFloat(ticker.volume || '0').toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>24h Trades</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono text-foreground">
                  {parseInt(ticker.count || '0').toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">
              <Activity className="h-4 w-4 mr-2" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <PriceChart symbol={symbol} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <AIEnsemblePanel symbol={symbol} ticker={ticker} />
            <PredictionsPanel symbol={symbol} ticker={ticker} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
