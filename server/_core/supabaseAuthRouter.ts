import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { signInWithEmail, signUpWithEmail, signOut } from './supabase';
import { upsertUser } from '../db';

/**
 * Supabase Authentication Router
 * Handles email/password authentication
 */
export const supabaseAuthRouter = router({
  /**
   * Sign in with email and password
   */
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { session, user } = await signInWithEmail(input.email, input.password);
        
        if (!user) {
          throw new Error('Authentication failed');
        }
        
        // Upsert user to database
        await upsertUser({
          openId: user.id,
          email: user.email || null,
          name: user.user_metadata?.name || user.email?.split('@')[0] || null,
          loginMethod: 'supabase',
          lastSignedIn: new Date(),
        });
        
        return {
          success: true,
          session,
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
          },
        };
      } catch (error) {
        console.error('[Supabase Auth] Sign in error:', error);
        throw new Error(error instanceof Error ? error.message : 'Sign in failed');
      }
    }),

  /**
   * Sign up with email and password
   */
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { session, user } = await signUpWithEmail(
          input.email,
          input.password,
          { name: input.name }
        );
        
        if (!user) {
          throw new Error('Registration failed');
        }
        
        // Create user in database
        await upsertUser({
          openId: user.id,
          email: user.email || null,
          name: input.name || user.email?.split('@')[0] || null,
          loginMethod: 'supabase',
          lastSignedIn: new Date(),
        });
        
        return {
          success: true,
          session,
          user: {
            id: user.id,
            email: user.email,
            name: input.name || user.email?.split('@')[0],
          },
        };
      } catch (error) {
        console.error('[Supabase Auth] Sign up error:', error);
        throw new Error(error instanceof Error ? error.message : 'Sign up failed');
      }
    }),

  /**
   * Sign out
   */
  signOut: publicProcedure.mutation(async () => {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error('[Supabase Auth] Sign out error:', error);
      throw new Error(error instanceof Error ? error.message : 'Sign out failed');
    }
  }),
});
