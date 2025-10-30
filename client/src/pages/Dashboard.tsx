import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, TrendingUp, TrendingDown, Activity, Loader2, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

function PriceDisplay({ symbol }: { symbol: string }) {
  const { data: ticker, isLoading } = trpc.market.get24hTicker.useQuery(
    { symbol },
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (!ticker) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const priceChange = parseFloat(ticker.priceChangePercent || '0');
  const isPositive = priceChange >= 0;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">${parseFloat(ticker.lastPrice || '0').toLocaleString()}</span>
      <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(priceChange).toFixed(2)}%
      </Badge>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: symbols, isLoading: symbolsLoading } = trpc.symbols.list.useQuery();
  const { data: watchlist, isLoading: watchlistLoading } = trpc.watchlist.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Login with Manus</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/predictions">
                <History className="h-4 w-4 mr-2" />
                Predictions
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assets
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {symbolsLoading ? "..." : symbols?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Watchlist
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {watchlistLoading ? "..." : watchlist?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tracked symbols</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Trades
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Watchlist</CardTitle>
            <CardDescription>
              Track your favorite assets and get real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {watchlistLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : watchlist && watchlist.length > 0 ? (
              <div className="space-y-4">
                {watchlist.map((item) => (
                  <Link
                    key={item.id}
                    href={`/symbol/${item.symbol}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">{item.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <PriceDisplay symbol={item.symbol} />
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Your watchlist is empty. Start adding symbols to track!
                </p>
                <Button asChild>
                  <Link href="/">Browse Assets</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Symbols */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assets</CardTitle>
            <CardDescription>
              Browse and analyze crypto, stocks, and forex
            </CardDescription>
          </CardHeader>
          <CardContent>
            {symbolsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : symbols && symbols.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {symbols.map((symbol) => (
                  <Link
                    key={symbol.id}
                    href={`/symbol/${symbol.symbol}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{symbol.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{symbol.name}</p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {symbol.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriceDisplay symbol={symbol.symbol} />
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No symbols available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
