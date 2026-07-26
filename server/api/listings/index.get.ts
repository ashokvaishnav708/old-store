import { and, asc, desc, eq, gte, lte, sql, count } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages, categories, users } from '~~/server/database/schema';
import { listingQuerySchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const query = await getValidatedQuery(event, listingQuerySchema.parse);
  const db = useDb();

  const conditions = [eq(listings.status, 'active')];

  if (query.categoryId) conditions.push(eq(listings.categoryId, query.categoryId));
  if (query.condition) conditions.push(eq(listings.condition, query.condition));
  if (query.minPrice !== undefined) conditions.push(gte(listings.price, String(query.minPrice)));
  if (query.maxPrice !== undefined) conditions.push(lte(listings.price, String(query.maxPrice)));
  if (query.location)
    conditions.push(sql`${listings.location} ILIKE ${'%' + query.location + '%'}`);
  if (query.q) {
    conditions.push(sql`to_tsvector('english', ${listings.title} || ' ' || ${listings.description})
      @@ plainto_tsquery('english', ${query.q})`);
  }

  const where = and(...conditions);

  const orderBy =
    query.sort === 'price_asc'
      ? asc(listings.price)
      : query.sort === 'price_desc'
        ? desc(listings.price)
        : desc(listings.createdAt);

  const offset = (query.page - 1) * query.pageSize;

  const cacheKey = `listings:list:${JSON.stringify(query)}`;

  return cached(cacheKey, 30, async () => {
    const [rows, [totalRow]] = await Promise.all([
      db
        .select({
          id: listings.id,
          title: listings.title,
          slug: listings.slug,
          price: listings.price,
          currency: listings.currency,
          condition: listings.condition,
          location: listings.location,
          createdAt: listings.createdAt,
          category: { id: categories.id, name: categories.name, slug: categories.slug },
          seller: { id: users.id, name: users.name },
          thumbnail: sql<string | null>`(
          SELECT ${listingImages.url} FROM ${listingImages}
          WHERE ${listingImages.listingId} = ${listings.id}
          ORDER BY ${listingImages.position} ASC LIMIT 1
        )`
        })
        .from(listings)
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .innerJoin(users, eq(listings.userId, users.id))
        .where(where)
        .orderBy(orderBy)
        .limit(query.pageSize)
        .offset(offset),
      db.select({ total: count() }).from(listings).where(where)
    ]);
    const total = totalRow?.total ?? 0;

    return {
      items: rows,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize)
    };
  });
});
