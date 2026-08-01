import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });

  await deleteListingWithImages(id);

  return { success: true };
});
