import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

const searchQuerySchema = z.object({
  email: z.string().trim().min(1).max(120)
});

export default defineEventHandler(async event => {
  // Staff (not just admin) can search — assistants need this to find a user
  // before adjusting their listing limit. Ban/unban stay admin-only, enforced
  // on those mutating endpoints separately.
  await requireStaff(event);
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
      listingLimit: users.listingLimit,
      createdAt: users.createdAt
    })
    .from(users)
    .where(sql`${users.email} ILIKE ${'%' + query.email + '%'}`)
    .limit(20);
});
