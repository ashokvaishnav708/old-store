import { and, count, eq, isNull } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { notifications } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const db = useDb();

  const [row] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  return { count: row?.count ?? 0 };
});
