import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function PredictionHistory() {
  const [timeframeFilter, setTimeframeFilter] = useState<'short' | 'medium' | 'long' | 'all'>('all');
  
  const { data: predictions, isLoading } = trpc.predictionHistory.list.useQuery({
    timeframe: timeframeFilter === 'all' ? undefined : timeframeFilter,
    limit: 100,
  });

  const { data: accuracy } = trpc.predictionHistory.accuracy.useQuery({
    timeframe: timeframeFilter === 'all' ? undefined : timeframeFilter,
  });

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDirectionBadge = (direction: string) => {
    const variants: Record<string, any> = {
      up: 'default',
      down: 'destructive',
      neutral: 'secondary',
    };
    return (
      <Badge variant={variants[direction] || 'secondary'} className="gap-1">
        {getDirectionIcon(direction)}
        {direction.toUpperCase()}
      </Badge>
    );
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'short':
        return '1-7 days';
      case 'medium':
        return '1-4 weeks';
      case 'long':
        return '1-6 months';
      default:
        return timeframe;
    }
  };

  const getAccuracyBadge = (wasCorrect: boolean | null) => {
    if (wasCorrect === null) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return wasCorrect ? (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Correct
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Wrong
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
                <p className="text-sm text-muted-foreground">Prediction History & Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Accuracy Overview */}
        {accuracy && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{accuracy.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{accuracy.completed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Correct</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{accuracy.correct}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Accuracy Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {accuracy.accuracy.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prediction History</CardTitle>
              <Select
                value={timeframeFilter}
                onValueChange={(value: any) => setTimeframeFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timeframes</SelectItem>
                  <SelectItem value="short">Short (1-7 days)</SelectItem>
                  <SelectItem value="medium">Medium (1-4 weeks)</SelectItem>
                  <SelectItem value="long">Long (1-6 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading predictions...</div>
            ) : !predictions || predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No predictions found. Start analyzing symbols to generate predictions!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Timeframe</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Predicted Price</TableHead>
                      <TableHead>Actual Price</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((pred) => (
                      <TableRow key={pred.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(pred.predictionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          Symbol #{pred.symbolId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTimeframeLabel(pred.timeframe)}</Badge>
                        </TableCell>
                        <TableCell>{getDirectionBadge(pred.predictedDirection)}</TableCell>
                        <TableCell className="font-mono">
                          ${parseFloat(pred.predictedPrice || '0').toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono">
                          {pred.actualPrice ? (
                            `$${parseFloat(pred.actualPrice).toLocaleString()}`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pred.confidenceScore >= 75 ? 'default' : 'secondary'}>
                            {pred.confidenceScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pred.modelUsed}
                        </TableCell>
                        <TableCell>{getAccuracyBadge(pred.wasCorrect)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
