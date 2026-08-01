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
        userId: listings.userId,
        title: listings.title,
        slug: listings.slug,
        description: listings.description,
        price: listings.price,
        currency: listings.currency,
        condition: listings.condition,
        status: listings.status,
        planId: listings.planId,
        expiresAt: listings.expiresAt,
        rejectionReason: listings.rejectionReason,
        location: listings.location,
        latitude: listings.latitude,
        longitude: listings.longitude,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        category: { id: categories.id, name: categories.name, slug: categories.slug },
        seller: {
          id: users.id,
          name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
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

  const isExpired = listing.expiresAt !== null && new Date(listing.expiresAt) <= new Date();
  const isPubliclyVisible = listing.status === 'active' && !isExpired;

  const session = await getUserSession(event);
  const isOwner = session.user?.id === listing.userId;
  const isStaff = session.user?.userType === 'admin' || session.user?.userType === 'assistant';

  if (!isPubliclyVisible && !isOwner && !isStaff) {
    throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  }

  // Kept out of the cached payload above so it doesn't go stale with the TTL.
  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, id));

  // Guests must sign in to see the exact location/coordinates or contact the
  // seller — applied fresh per request (not cached) so it can't leak through
  // the shared 30s cache above.
  if (!session.user) {
    return { ...listing, location: null, latitude: null, longitude: null };
  }

  return listing;
});
