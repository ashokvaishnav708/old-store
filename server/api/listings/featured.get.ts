import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages, categories, users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const db = useDb();

  const items = await cached('listings:featured', 30, async () => {
    return db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        price: listings.price,
        currency: listings.currency,
        condition: listings.condition,
        location: listings.location,
        highlightBoost: sql<boolean>`(${listings.highlightBoost} AND ${listings.boostsExpireAt} > now())`,
        createdAt: listings.createdAt,
        category: { id: categories.id, name: categories.name, slug: categories.slug },
        seller: {
          id: users.id,
          name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
        },
        thumbnail: sql<string | null>`(
          SELECT ${listingImages.url} FROM ${listingImages}
          WHERE ${listingImages.listingId} = ${listings.id}
          ORDER BY ${listingImages.position} ASC LIMIT 1
        )`
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .innerJoin(users, eq(listings.userId, users.id))
      .where(and(eq(listings.status, 'active'), eq(listings.homepageBoost, true), gt(listings.boostsExpireAt, new Date())))
      .orderBy(desc(listings.boostsExpireAt))
      .limit(8);
  });

  const session = await getUserSession(event);
  if (!session.user) {
    return items.map(item => ({ ...item, location: null }));
  }

  return items;
});
