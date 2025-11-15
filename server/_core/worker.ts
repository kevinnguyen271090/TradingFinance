/**
 * Cloudflare Workers Entry Point
 * Handles tRPC requests in Workers runtime
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../routers';
import { createContext } from './context-worker';

export interface Env {
  // KV Namespace for sessions
  SESSIONS: KVNamespace;
  
  // R2 Bucket for file storage
  FILES: R2Bucket;
  
  // Environment variables (secrets)
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  RESEND_API_KEY: string;
  QWEN_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  JWT_SECRET: string;
  
  // Optional API keys
  COINGECKO_API_KEY?: string;
  ETHERSCAN_API_KEY?: string;
  LUNARCRUSH_API_KEY?: string;
  REDDIT_CLIENT_ID?: string;
  REDDIT_CLIENT_SECRET?: string;
  TWITTER_BEARER_TOKEN?: string;
  YOUTUBE_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only handle /api/trpc requests
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/trpc')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      // Handle tRPC requests
      return await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: appRouter,
        createContext: (opts) => createContext(opts, env, ctx),
        onError: ({ error, path }) => {
          console.error(`tRPC Error on ${path}:`, error);
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },
};
