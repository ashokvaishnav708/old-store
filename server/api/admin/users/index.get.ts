import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

const searchQuerySchema = z.object({
  email: z.string().trim().min(1).max(120)
});

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const query = await getValidatedQuery(event, searchQuerySchema.parse);
  const db = useDb();

  return db
    .select({
      id: users.id,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      email: users.email,
      userType: users.userType,
      bannedAt: users.bannedAt,
      bannedReason: users.bannedReason,
      createdAt: users.createdAt
    })
    .from(users)
    .where(sql`${users.email} ILIKE ${'%' + query.email + '%'}`)
    .limit(20);
});
