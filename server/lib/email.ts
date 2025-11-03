import { Resend } from 'resend';
import { ENV } from '../_core/env';

/**
 * Resend email service
 * 
 * Free tier: 3,000 emails/month
 * Paid tier: $20/month for 50,000 emails
 * 
 * Email types:
 * 1. Price alerts (target hit)
 * 2. AI signal notifications (high confidence)
 * 3. Prediction results (accuracy updates)
 * 4. Achievement unlocked
 * 5. Weekly summary
 */

let resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!ENV.resendApiKey) {
    console.warn('[Email] RESEND_API_KEY not found. Email notifications disabled.');
    return null;
  }

  if (!resend) {
    resend = new Resend(ENV.resendApiKey);
    console.log('[Email] Resend client initialized successfully');
  }

  return resend;
}

/**
 * Email configuration
 */
const EMAIL_CONFIG = {
  from: 'CryptoTrader Pro <alerts@cryptotrader.pro>',
  replyTo: 'support@cryptotrader.pro',
};

/**
 * Send email interface
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.warn('[Email] Skipping email send (client not initialized)');
    return false;
  }

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('[Email] Error sending email:', error);
      return false;
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Exception sending email:', error);
    return false;
  }
}

/**
 * Email templates
 */

/**
 * Price Alert Email
 */
export async function sendPriceAlertEmail(
  to: string,
  data: {
    symbol: string;
    targetPrice: string;
    currentPrice: string;
    direction: 'above' | 'below';
  }
): Promise<boolean> {
  const { symbol, targetPrice, currentPrice, direction } = data;

  const subject = `🚀 ${symbol} Price Alert: Target ${direction === 'above' ? 'Exceeded' : 'Reached'}!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .price-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #667eea; }
          .price { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎯 Price Alert Triggered!</h1>
          </div>
          <div class="content">
            <p>Your price alert for <strong>${symbol}</strong> has been triggered!</p>
            
            <div class="price-box">
              <div class="label">Current Price</div>
              <div class="price">$${currentPrice}</div>
              <div class="label">Target Price: $${targetPrice}</div>
            </div>

            <p style="text-align: center;">
              The current price is <strong>${direction}</strong> your target of <strong>$${targetPrice}</strong>.
            </p>

            <p style="text-align: center;">
              <a href="https://cryptotrader.pro/symbol/${symbol}" class="button">
                View ${symbol} Details →
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>What's next?</strong><br>
              Check the latest AI predictions and technical analysis to make informed trading decisions.
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because you set up a price alert for ${symbol}.</p>
            <p><a href="https://cryptotrader.pro/settings">Manage your alerts</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Price Alert Triggered!
    
    ${symbol} has ${direction === 'above' ? 'exceeded' : 'reached'} your target price.
    
    Current Price: $${currentPrice}
    Target Price: $${targetPrice}
    
    View details: https://cryptotrader.pro/symbol/${symbol}
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * AI Signal Email
 */
export async function sendAISignalEmail(
  to: string,
  data: {
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    targetPrice: string;
    currentPrice: string;
  }
): Promise<boolean> {
  const { symbol, signal, confidence, targetPrice, currentPrice } = data;

  const signalEmoji = signal === 'BUY' ? '🟢' : signal === 'SELL' ? '🔴' : '🟡';
  const subject = `${signalEmoji} High Confidence ${signal} Signal: ${symbol}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .signal-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 3px solid ${signal === 'BUY' ? '#10b981' : signal === 'SELL' ? '#ef4444' : '#f59e0b'}; }
          .signal { font-size: 48px; font-weight: bold; color: ${signal === 'BUY' ? '#10b981' : signal === 'SELL' ? '#ef4444' : '#f59e0b'}; margin: 10px 0; }
          .confidence { font-size: 24px; color: #667eea; font-weight: bold; }
          .price-row { display: flex; justify-content: space-around; margin-top: 20px; }
          .price-item { text-align: center; }
          .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 20px; font-weight: bold; color: #1f2937; margin-top: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🤖 AI Trading Signal</h1>
          </div>
          <div class="content">
            <p>Our Multi-AI Ensemble has generated a high-confidence signal for <strong>${symbol}</strong>!</p>
            
            <div class="signal-box">
              <div class="signal">${signalEmoji} ${signal}</div>
              <div class="confidence">${confidence}% Confidence</div>
              
              <div class="price-row">
                <div class="price-item">
                  <div class="label">Current Price</div>
                  <div class="value">$${currentPrice}</div>
                </div>
                <div class="price-item">
                  <div class="label">Target Price</div>
                  <div class="value">$${targetPrice}</div>
                </div>
              </div>
            </div>

            <p style="text-align: center;">
              <a href="https://cryptotrader.pro/symbol/${symbol}" class="button">
                View Full Analysis →
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>⚠️ Important:</strong><br>
              This is an AI-generated signal based on technical analysis and market data. Always do your own research and never invest more than you can afford to lose.
            </p>
          </div>
          <div class="footer">
            <p>Powered by Multi-AI Ensemble (Qwen-2.5 + DeepSeek-V3)</p>
            <p><a href="https://cryptotrader.pro/settings">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    AI Trading Signal
    
    ${symbol}: ${signal} Signal
    Confidence: ${confidence}%
    
    Current Price: $${currentPrice}
    Target Price: $${targetPrice}
    
    View full analysis: https://cryptotrader.pro/symbol/${symbol}
    
    ⚠️ This is an AI-generated signal. Always do your own research.
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Achievement Unlocked Email
 */
export async function sendAchievementEmail(
  to: string,
  data: {
    achievementName: string;
    achievementDescription: string;
    achievementIcon: string;
    rewardPoints: number;
  }
): Promise<boolean> {
  const { achievementName, achievementDescription, achievementIcon, rewardPoints } = data;

  const subject = `🏆 Achievement Unlocked: ${achievementName}!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .achievement-box { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 3px solid #f59e0b; }
          .icon { font-size: 64px; margin: 10px 0; }
          .name { font-size: 28px; font-weight: bold; color: #1f2937; margin: 10px 0; }
          .description { font-size: 16px; color: #6b7280; margin: 10px 0; }
          .points { font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 20px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <p>You've unlocked a new achievement!</p>
            
            <div class="achievement-box">
              <div class="icon">${achievementIcon}</div>
              <div class="name">${achievementName}</div>
              <div class="description">${achievementDescription}</div>
              <div class="points">+${rewardPoints} XP</div>
            </div>

            <p style="text-align: center;">
              <a href="https://cryptotrader.pro/achievements" class="button">
                View All Achievements →
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
              Keep trading and unlock more achievements to level up!
            </p>
          </div>
          <div class="footer">
            <p>Share your achievement on social media!</p>
            <p><a href="https://cryptotrader.pro/settings">Manage notifications</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Achievement Unlocked!
    
    ${achievementName}
    ${achievementDescription}
    
    Reward: +${rewardPoints} XP
    
    View all achievements: https://cryptotrader.pro/achievements
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Weekly Summary Email
 */
export async function sendWeeklySummaryEmail(
  to: string,
  data: {
    userName: string;
    weeklyProfit: string;
    weeklyProfitPct: string;
    totalTrades: number;
    winRate: number;
    topPerformer: string;
    topPerformerGain: string;
  }
): Promise<boolean> {
  const { userName, weeklyProfit, weeklyProfitPct, totalTrades, winRate, topPerformer, topPerformerGain } = data;

  const subject = `📊 Your Weekly Trading Summary`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
          .profit { color: ${parseFloat(weeklyProfit) >= 0 ? '#10b981' : '#ef4444'}; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 Weekly Summary</h1>
            <p style="margin: 10px 0 0 0;">Hi ${userName}!</p>
          </div>
          <div class="content">
            <p>Here's how you performed this week:</p>
            
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value profit">$${weeklyProfit}</div>
                <div class="stat-label">Weekly P&L</div>
              </div>
              <div class="stat-box">
                <div class="stat-value profit">${weeklyProfitPct}%</div>
                <div class="stat-label">Return</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${totalTrades}</div>
                <div class="stat-label">Total Trades</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${winRate}%</div>
                <div class="stat-label">Win Rate</div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">🏆 Top Performer</h3>
              <p style="margin: 0;"><strong>${topPerformer}</strong> gained <strong style="color: #10b981;">${topPerformerGain}%</strong> this week!</p>
            </div>

            <p style="text-align: center;">
              <a href="https://cryptotrader.pro/dashboard" class="button">
                View Full Dashboard →
              </a>
            </p>
          </div>
          <div class="footer">
            <p>Keep up the great work!</p>
            <p><a href="https://cryptotrader.pro/settings">Manage email preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Weekly Trading Summary
    
    Hi ${userName}!
    
    Weekly P&L: $${weeklyProfit} (${weeklyProfitPct}%)
    Total Trades: ${totalTrades}
    Win Rate: ${winRate}%
    
    Top Performer: ${topPerformer} (+${topPerformerGain}%)
    
    View dashboard: https://cryptotrader.pro/dashboard
  `;

  return sendEmail({ to, subject, html, text });
}
