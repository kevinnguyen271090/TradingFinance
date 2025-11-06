import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const maSeriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  
  const [interval, setInterval] = useState<'1h' | '4h' | '1d'>('1h');
  const [enabledMAs, setEnabledMAs] = useState<Set<number>>(new Set([7, 21, 55, 144, 233])); // Default enabled MAs
  const [showRSI, setShowRSI] = useState(false);
  
  const { data: klines, isLoading } = trpc.market.getKlines.useQuery(
    { symbol, interval, limit: 610 }, // Get enough data for MA610
    { refetchInterval: 30000 }
  );

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      maSeriesRef.current.clear();
    }

    // Create chart
    let chart: IChartApi;
    try {
      chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B3139',
      },
    });
    } catch (error) {
      console.error('[Chart] Error creating chart:', error);
      return;
    }

    chartRef.current = chart;

    // Add candlestick series - use type assertion for v5 compatibility
    const chartAny = chart as any;
    if (!chartAny || typeof chartAny.addCandlestickSeries !== 'function') {
      console.error('[Chart] addCandlestickSeries method not found');
      return;
    }

    const candlestickSeries = chartAny.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Transform candlestick data
    const chartData = klines.map((k: any) => ({
      time: Math.floor(k.openTime / 1000),
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
    }));

    try {
      candlestickSeries.setData(chartData);
    } catch (error) {
      console.error('[Chart] Error setting candlestick data:', error);
      return;
    }

    // Calculate and add Moving Averages
    const closePrices = klines.map((k: any) => parseFloat(k.close));
    const timestamps = klines.map((k: any) => Math.floor(k.openTime / 1000));

    FIBONACCI_MAS.forEach((ma) => {
      if (!enabledMAs.has(ma.period)) return;

      const smaValues = calculateSMA(closePrices, ma.period);
      const maData = smaValues
        .map((value, index) => ({
          time: timestamps[index],
          value: value,
        }))
        .filter((d) => d.value !== null) as { time: number; value: number }[];

      if (maData.length > 0) {
        const lineSeries = chartAny.addLineSeries({
          color: ma.color,
          lineWidth: 2,
          title: ma.label,
          priceLineVisible: false,
          lastValueVisible: true,
        });

        lineSeries.setData(maData);
        maSeriesRef.current.set(ma.period, lineSeries);
      }
    });

    // Add RSI if enabled
    if (showRSI) {
      const rsiValues = calculateRSI(closePrices, 14);
      const rsiData = rsiValues
        .map((value, index) => ({
          time: timestamps[index],
          value: value,
        }))
        .filter((d) => d.value !== null) as { time: number; value: number }[];

      if (rsiData.length > 0) {
        const rsiSeries = chartAny.addLineSeries({
          color: '#9333EA',
          lineWidth: 2,
          title: 'RSI',
          priceScaleId: 'rsi',
        });

        rsiSeries.setData(rsiData);

        // Configure RSI scale
        chart.priceScale('rsi').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
      }
    }

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
  }, [klines, enabledMAs, showRSI]);

  const toggleMA = (period: number) => {
    setEnabledMAs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(period)) {
        newSet.delete(period);
      } else {
        newSet.add(period);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Advanced Price Chart</CardTitle>
          <div className="flex gap-2 items-center">
            {/* Interval Selector */}
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

            {/* Indicators Settings */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Indicators
                  <Badge variant="secondary" className="ml-2">
                    {enabledMAs.size + (showRSI ? 1 : 0)}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Fibonacci Moving Averages</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {FIBONACCI_MAS.map((ma) => (
                        <div key={ma.period} className="flex items-center space-x-2">
                          <Switch
                            id={`ma-${ma.period}`}
                            checked={enabledMAs.has(ma.period)}
                            onCheckedChange={() => toggleMA(ma.period)}
                          />
                          <Label
                            htmlFor={`ma-${ma.period}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ma.color }}
                            />
                            <span className="text-sm">{ma.label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-3">Oscillators</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rsi"
                        checked={showRSI}
                        onCheckedChange={setShowRSI}
                      />
                      <Label htmlFor="rsi" className="cursor-pointer">
                        RSI (14)
                      </Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div ref={chartContainerRef} className="w-full" />
            
            {/* MA Legend */}
            {enabledMAs.size > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {FIBONACCI_MAS.filter((ma) => enabledMAs.has(ma.period)).map((ma) => (
                  <Badge
                    key={ma.period}
                    variant="outline"
                    className="gap-2"
                    style={{ borderColor: ma.color }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ma.color }}
                    />
                    {ma.label}
                  </Badge>
                ))}
                {showRSI && (
                  <Badge variant="outline" className="gap-2" style={{ borderColor: '#9333EA' }}>
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                    RSI
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
