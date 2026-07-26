import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { favorites, listings } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const listingId = getRouterParam(event, 'listingId')!;
  const db = useDb();

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, listingId) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });

  await db.insert(favorites).values({ userId: user.id, listingId }).onConflictDoNothing();

  return { success: true };
});
