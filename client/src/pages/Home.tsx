import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { TrendingUp, Brain, Zap, Shield, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {APP_LOGO && (
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 mx-auto mb-6" />
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            {APP_TITLE}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered financial analysis and auto trading platform for crypto, stocks, and forex.
            Make smarter trading decisions with machine learning predictions.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ML Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning models analyze market data to predict price movements with high accuracy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-Time Data</CardTitle>
              <CardDescription>
                Get instant market updates with WebSocket connections to major exchanges like Binance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Auto Trading</CardTitle>
              <CardDescription>
                Automated trading execution based on ML signals with customizable risk management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Safe</CardTitle>
              <CardDescription>
                Encrypted API key storage and comprehensive risk controls to protect your capital
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          How It Works
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Exchange</h3>
              <p className="text-muted-foreground">
                Securely connect your Binance account using API keys (read-only or trading permissions)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Set Your Goals</h3>
              <p className="text-muted-foreground">
                Define your target ROI, risk tolerance, and preferred assets. Our AI will create personalized strategies
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Let AI Trade</h3>
              <p className="text-muted-foreground">
                Our ML models analyze markets 24/7 and execute trades automatically based on high-confidence signals
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Track Performance</h3>
              <p className="text-muted-foreground">
                Monitor your portfolio, review trade history, and analyze performance metrics in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of traders using AI to make better investment decisions
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <a href={getLoginUrl()}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 {APP_TITLE}. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            ⚠️ Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
