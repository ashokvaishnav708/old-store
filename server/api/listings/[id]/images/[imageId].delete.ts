import { and, eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const imageId = getRouterParam(event, 'imageId')!;
  const db = useDb();

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (listing.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  const [image] = await db
    .select()
    .from(listingImages)
    .where(and(eq(listingImages.id, imageId), eq(listingImages.listingId, id)));
  if (!image) throw createError({ statusCode: 404, statusMessage: 'Image not found.' });

  await db.delete(listingImages).where(eq(listingImages.id, imageId));
  await deleteListingImage(image.url.split('/').pop()!);
  await invalidate(`listing:${id}`);

  return { success: true };
});
