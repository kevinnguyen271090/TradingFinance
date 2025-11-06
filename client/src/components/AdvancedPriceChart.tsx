import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SimplePriceChart } from "./SimplePriceChart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdvancedPriceChartProps {
  symbol: string;
}

// Fibonacci MA periods
const FIBONACCI_MAS = [
  { period: 7, color: '#FF6B6B', label: 'MA7' },
  { period: 13, color: '#4ECDC4', label: 'MA13' },
  { period: 21, color: '#45B7D1', label: 'MA21' },
  { period: 34, color: '#FFA07A', label: 'MA34' },
  { period: 55, color: '#98D8C8', label: 'MA55' },
  { period: 89, color: '#F7DC6F', label: 'MA89' },
  { period: 144, color: '#BB8FCE', label: 'MA144' },
  { period: 233, color: '#85C1E9', label: 'MA233' },
  { period: 377, color: '#F8B88B', label: 'MA377' },
  { period: 610, color: '#ABEBC6', label: 'MA610' },
];

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

// Calculate RSI
function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return rsi;
}

export function AdvancedPriceChart({ symbol }: AdvancedPriceChartProps) {
  const [interval, setInterval] = useState<'1h' | '4h' | '1d'>('1h');
  const [enabledMAs, setEnabledMAs] = useState<Set<number>>(new Set([7, 21, 55, 144, 233]));
  const [showRSI, setShowRSI] = useState(false);
  
  const { data: klines, isLoading } = trpc.market.getKlines.useQuery(
    { symbol, interval, limit: 610 },
    { refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded border border-slate-700">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!klines || klines.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded border border-slate-700 text-slate-400">
        No chart data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Indicators
              <Badge variant="secondary">{enabledMAs.size}</Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Moving Averages</h3>
              {FIBONACCI_MAS.map((ma) => (
                <div key={ma.period} className="flex items-center gap-2">
                  <Switch
                    checked={enabledMAs.has(ma.period)}
                    onCheckedChange={(checked) => {
                      const newMAs = new Set(enabledMAs);
                      if (checked) {
                        newMAs.add(ma.period);
                      } else {
                        newMAs.delete(ma.period);
                      }
                      setEnabledMAs(newMAs);
                    }}
                  />
                  <Label className="flex-1 cursor-pointer text-sm">
                    {ma.label}
                  </Label>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ma.color }}
                  />
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showRSI}
                  onCheckedChange={setShowRSI}
                />
                <Label className="flex-1 cursor-pointer text-sm">
                  RSI (14)
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Simple Chart - Fallback implementation */}
      <div className="bg-slate-900 rounded border border-slate-700 p-4">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Advanced Price Chart</h3>
        <SimplePriceChart klines={klines} />
        <p className="text-xs text-slate-500 mt-2">
          📊 Simple candlestick chart • Timeframe: {interval.toUpperCase()}
        </p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-400">Bullish (Close &gt; Open)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-400">Bearish (Close &lt; Open)</span>
        </div>
      </div>
    </div>
  );
}
