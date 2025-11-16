/**
 * Cloudflare Workers Context
 * Creates tRPC context for Workers runtime
 */

import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { User } from '../../drizzle/schema.postgres';
import type { Env } from './worker';

export type WorkerContext = {
  req: Request;
  env: Env;
  ctx: ExecutionContext;
  user: User | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
  env: Env,
  ctx: ExecutionContext
): Promise<WorkerContext> {
  let user: User | null = null;

  try {
    // Extract JWT from cookie or Authorization header
    const cookieHeader = opts.req.headers.get('cookie');
    const authHeader = opts.req.headers.get('authorization');
    
    if (cookieHeader || authHeader) {
      // TODO: Implement JWT verification for Workers
      // For now, authentication is optional
      user = null;
    }
  } catch (error) {
    // Authentication is optional for public procedures
    user = null;
  }

  return {
    req: opts.req,
    env,
    ctx,
    user,
  };
}
