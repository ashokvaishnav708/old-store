import { and, eq, isNull } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { notifications } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const db = useDb();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  return { success: true };
});
