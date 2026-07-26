import { eq, count } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages } from '~~/server/database/schema';

const MAX_IMAGES_PER_LISTING = 10;

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (listing.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  const [existingCountRow] = await db
    .select({ existingCount: count() })
    .from(listingImages)
    .where(eq(listingImages.listingId, id));
  const existingCount = existingCountRow?.existingCount ?? 0;

  const files = await readMultipartFormData(event);
  if (!files?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No image files provided.' });
  }
  if (existingCount + files.length > MAX_IMAGES_PER_LISTING) {
    throw createError({
      statusCode: 422,
      statusMessage: `A listing can have at most ${MAX_IMAGES_PER_LISTING} images.`
    });
  }

  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const { url } = await uploadListingImage(
        file.filename || `image-${index}`,
        file.type || 'image/jpeg',
        file.data
      );
      const [image] = await db
        .insert(listingImages)
        .values({
          listingId: id,
          url,
          position: existingCount + index
        })
        .returning();
      return image;
    })
  );

  await invalidate(`listing:${id}`);

  return uploaded;
});
