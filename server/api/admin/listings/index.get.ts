import { and, desc, eq, count, sql } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { listings, categories, users } from '~~/server/database/schema';

const queueQuerySchema = z.object({
  status: z.enum(['draft', 'pending', 'active', 'sold', 'archived', 'rejected']).default('pending'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});

export default defineEventHandler(async event => {
  await requireStaff(event);

  const query = await getValidatedQuery(event, queueQuerySchema.parse);
  const db = useDb();
  const where = and(eq(listings.status, query.status));
  const offset = (query.page - 1) * query.pageSize;

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        price: listings.price,
        currency: listings.currency,
        status: listings.status,
        planId: listings.planId,
        rejectionReason: listings.rejectionReason,
        createdAt: listings.createdAt,
        category: { id: categories.id, name: categories.name },
        seller: {
          id: users.id,
          name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          email: users.email
        }
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .innerJoin(users, eq(listings.userId, users.id))
      .where(where)
      .orderBy(desc(listings.createdAt))
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
