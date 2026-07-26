import { eq, asc, sql } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages, categories, users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const listing = await cached(`listing:${id}`, 30, async () => {
    const [row] = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        description: listings.description,
        price: listings.price,
        currency: listings.currency,
        condition: listings.condition,
        status: listings.status,
        location: listings.location,
        latitude: listings.latitude,
        longitude: listings.longitude,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        category: { id: categories.id, name: categories.name, slug: categories.slug },
        seller: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt
        }
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(listings.id, id))
      .limit(1);

    if (!row) return null;

    const images = await db
      .select({ id: listingImages.id, url: listingImages.url })
      .from(listingImages)
      .where(eq(listingImages.listingId, id))
      .orderBy(asc(listingImages.position));

    return { ...row, images };
  });

  if (!listing) {
    throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  }

  // Kept out of the cached payload above so it doesn't go stale with the TTL.
  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, id));

  return listing;
});
