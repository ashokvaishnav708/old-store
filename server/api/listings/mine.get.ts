import { eq, desc } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, categories } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const db = useDb();

  return db
    .select({
      id: listings.id,
      title: listings.title,
      slug: listings.slug,
      price: listings.price,
      currency: listings.currency,
      status: listings.status,
      viewCount: listings.viewCount,
      createdAt: listings.createdAt,
      category: { id: categories.id, name: categories.name }
    })
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .where(eq(listings.userId, user.id))
    .orderBy(desc(listings.createdAt));
});
