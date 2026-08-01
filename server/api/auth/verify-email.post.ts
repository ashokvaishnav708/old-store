import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

const verifyEmailSchema = z.object({ token: z.string().min(1) });

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:verify-email:${ip}`, 10, 60 * 60);

  const body = await readValidatedBody(event, verifyEmailSchema.parse);
  const db = useDb();

  const userId = await consumeEmailVerificationToken(body.token);
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'This verification link is invalid or has expired.' });
  }

  await db.update(users).set({ verified: true, updatedAt: new Date() }).where(eq(users.id, userId));
  await invalidate(`user:session-sync:${userId}`);

  return { success: true };
});
