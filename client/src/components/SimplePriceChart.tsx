import { useEffect, useRef } from 'react';

interface SimplePriceChartProps {
  klines: Array<{
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
  }>;
}

/**
 * Simple fallback chart using Canvas API
 * Renders candlestick chart without external dependencies
 */
export function SimplePriceChart({ klines }: SimplePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !klines || klines.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    // Parse data
    const data = klines.map(k => ({
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
      time: new Date(k.openTime).toLocaleDateString(),
    }));

    // Find min/max for scaling
    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Calculate dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const candleWidth = Math.max(2, chartWidth / data.length - 2);

    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding - 10, y + 4);
    }

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = padding + (index * (chartWidth / data.length)) + candleWidth / 2;

      // Scale prices to canvas
      const scalePrice = (price: number) => {
        return padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      };

      const openY = scalePrice(candle.open);
      const closeY = scalePrice(candle.close);
      const highY = scalePrice(candle.high);
      const lowY = scalePrice(candle.low);

      // Draw wick (high-low line)
      ctx.strokeStyle = candle.close >= candle.open ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body (open-close rectangle)
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillStyle = candle.close >= candle.open ? '#10b981' : '#ef4444';
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Draw border
      ctx.strokeStyle = candle.close >= candle.open ? '#059669' : '#dc2626';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

  }, [klines]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full bg-slate-900 rounded border border-slate-700"
      style={{ minHeight: '400px' }}
    />
  );
}
