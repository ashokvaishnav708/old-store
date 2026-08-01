import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { forgotPasswordSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:forgot-password:${ip}`, 5, 60 * 60);

  const body = await readValidatedBody(event, forgotPasswordSchema.parse);
  const db = useDb();
  const config = useRuntimeConfig();

  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });

  if (user && !user.bannedAt) {
    const rawToken = await createPasswordResetToken(user.id);
    const resetUrl = `${config.public.baseUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  // Always return the same response, whether or not the email matched an account.
  return { success: true };
});
