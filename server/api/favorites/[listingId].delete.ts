import { and, eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { favorites } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const listingId = getRouterParam(event, 'listingId')!;
  const db = useDb();

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.listingId, listingId)));

  return { success: true };
});
