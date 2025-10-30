import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Brain, Shield, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

interface AIEnsemblePanelProps {
  symbol: string;
  ticker: any;
}

export function AIEnsemblePanel({ symbol, ticker }: AIEnsemblePanelProps) {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = trpc.aiEnsemble.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisData(data);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error('AI analysis error:', error);
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (!ticker) return;

    setIsAnalyzing(true);
    analyzeMutation.mutate({
      symbol,
      currentPrice: parseFloat(ticker.lastPrice || '0'),
      priceChange24h: parseFloat(ticker.priceChangePercent || '0'),
      volume24h: parseFloat(ticker.volume || '0'),
      high24h: parseFloat(ticker.highPrice || '0'),
      low24h: parseFloat(ticker.lowPrice || '0'),
    });
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes('buy')) return 'text-green-500';
    if (signal.includes('sell')) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSignalBadgeVariant = (signal: string): "default" | "destructive" | "secondary" => {
    if (signal.includes('buy')) return 'default';
    if (signal.includes('sell')) return 'destructive';
    return 'secondary';
  };

  const getRiskBadgeVariant = (risk: string): "default" | "destructive" | "secondary" => {
    if (risk === 'low') return 'default';
    if (risk === 'high') return 'destructive';
    return 'secondary';
  };

  if (!analysisData && !isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Multi-AI Analysis
          </CardTitle>
          <CardDescription>
            Get comprehensive analysis from Qwen-2.5 and DeepSeek-V3
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Analyze {symbol} with our advanced AI ensemble system
            </p>
            <Button onClick={handleAnalyze} disabled={!ticker}>
              <Brain className="h-4 w-4 mr-2" />
              Run AI Analysis
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold">What you'll get:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Technical analysis from Qwen-2.5</li>
              <li>• Risk assessment from DeepSeek-V3</li>
              <li>• Consensus recommendation</li>
              <li>• Confidence scores and reasoning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">Analyzing with AI...</p>
            <p className="text-sm text-muted-foreground">This may take 10-20 seconds</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consensus Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>Consensus Recommendation</CardTitle>
            </div>
            <Badge variant={getSignalBadgeVariant(analysisData.consensus.signal)} className="capitalize">
              {analysisData.consensus.signal.replace('_', ' ')}
            </Badge>
          </div>
          <CardDescription>
            Agreement: {analysisData.agreement}% • Confidence: {analysisData.consensus.confidence}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Target Price</p>
              <p className="text-2xl font-bold font-mono">${analysisData.consensus.targetPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
              <Badge variant={getRiskBadgeVariant(analysisData.consensus.riskLevel)} className="capitalize">
                {analysisData.consensus.riskLevel}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Timeframe</p>
              <p className="text-lg font-semibold capitalize">{analysisData.consensus.timeframe}-term</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Analysis:</p>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
              <Streamdown>{analysisData.consensus.reasoning}</Streamdown>
            </div>
          </div>

          <Button onClick={handleAnalyze} variant="outline" size="sm" className="w-full">
            Refresh Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Individual AI Analyses */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Qwen Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-lg">Qwen-2.5</CardTitle>
              </div>
              <Badge variant={getSignalBadgeVariant(analysisData.individual.qwen.signal)} className="capitalize text-xs">
                {analysisData.individual.qwen.signal.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Technical Analysis • {analysisData.individual.qwen.confidence}% confidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="font-mono font-semibold">${analysisData.individual.qwen.targetPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Risk</p>
                <Badge variant={getRiskBadgeVariant(analysisData.individual.qwen.riskLevel)} className="capitalize text-xs">
                  {analysisData.individual.qwen.riskLevel}
                </Badge>
              </div>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground line-clamp-4">
                {analysisData.individual.qwen.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DeepSeek Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-lg">DeepSeek-V3</CardTitle>
              </div>
              <Badge variant={getSignalBadgeVariant(analysisData.individual.deepseek.signal)} className="capitalize text-xs">
                {analysisData.individual.deepseek.signal.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Risk Assessment • {analysisData.individual.deepseek.confidence}% confidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="font-mono font-semibold">${analysisData.individual.deepseek.targetPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Risk</p>
                <Badge variant={getRiskBadgeVariant(analysisData.individual.deepseek.riskLevel)} className="capitalize text-xs">
                  {analysisData.individual.deepseek.riskLevel}
                </Badge>
              </div>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground line-clamp-4">
                {analysisData.individual.deepseek.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreement Indicator */}
      {analysisData.agreement < 70 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Low Agreement ({analysisData.agreement}%)</p>
              <p className="text-sm text-muted-foreground">
                The AI models have different views on this asset. Consider waiting for more clarity or reducing position size.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
