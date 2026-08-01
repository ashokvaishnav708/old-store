import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { notifications } from '~~/server/database/schema';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const query = await getValidatedQuery(event, listQuerySchema.parse);
  const db = useDb();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(query.limit);
});
