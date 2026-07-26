import { eq, desc } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { favorites, listings, categories } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const db = useDb();

  return db
    .select({
      listingId: listings.id,
      title: listings.title,
      slug: listings.slug,
      price: listings.price,
      currency: listings.currency,
      status: listings.status,
      favoritedAt: favorites.createdAt,
      category: { id: categories.id, name: categories.name }
    })
    .from(favorites)
    .innerJoin(listings, eq(favorites.listingId, listings.id))
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt));
});
