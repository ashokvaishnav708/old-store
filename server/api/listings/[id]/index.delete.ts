import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (existing.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  const images = await db
    .select({ url: listingImages.url })
    .from(listingImages)
    .where(eq(listingImages.listingId, id));

  await db.delete(listings).where(eq(listings.id, id));

  await Promise.allSettled(images.map(img => deleteListingImage(img.url.split('/').pop()!)));
  await invalidate(`listing:${id}`);

  return { success: true };
});
