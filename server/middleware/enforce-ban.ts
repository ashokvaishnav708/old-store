import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const session = await getUserSession(event);
  if (!session.user) return;

  const userId = session.user.id;
  const banned = await cached(`user:banned:${userId}`, 60, async () => {
    const db = useDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    return Boolean(user?.bannedAt);
  });

  if (banned) {
    await clearUserSession(event);
    throw createError({ statusCode: 403, statusMessage: 'This account has been banned.' });
  }
});
