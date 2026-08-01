import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async session => {
    if (!session.user) return;

    const db = useDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });

    if (!user || user.bannedAt) {
      throw createError({ statusCode: 403, statusMessage: 'Account no longer available.' });
    }

    session.user.name = `${user.firstName} ${user.lastName}`;
    session.user.avatarUrl = user.avatarUrl;
    session.user.userType = user.userType ?? 'private';
  });
});
