import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { registerSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:register:${ip}`, 5, 60);

  const body = await readValidatedBody(event, registerSchema.parse);
  const db = useDb();

  const existing = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists.'
    });
  }

  const passwordHash = await hashPassword(body.password);
  const [user] = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash
    })
    .returning();

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create account.' });
  }

  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
  });

  return { id: user.id, name: user.name, email: user.email };
});
