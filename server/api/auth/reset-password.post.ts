import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { resetPasswordSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:reset-password:${ip}`, 10, 60 * 60);

  const body = await readValidatedBody(event, resetPasswordSchema.parse);
  const db = useDb();

  const userId = await consumePasswordResetToken(body.token);
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired.' });
  }

  const passwordHash = await hashPassword(body.password);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  return { success: true };
});
