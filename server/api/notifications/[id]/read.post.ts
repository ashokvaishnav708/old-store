import { and, eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { notifications } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  return { success: true };
});
