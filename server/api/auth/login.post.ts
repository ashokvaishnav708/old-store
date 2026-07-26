import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { loginSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:login:${ip}`, 10, 60);

  const body = await readValidatedBody(event, loginSchema.parse);
  const db = useDb();

  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  const invalidCredentials = () =>
    createError({ statusCode: 401, statusMessage: 'Invalid email or password.' });

  if (!user) throw invalidCredentials();

  const valid = await verifyPassword(user.passwordHash, body.password);
  if (!valid) throw invalidCredentials();

  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
  });

  return { id: user.id, name: user.name, email: user.email };
});
