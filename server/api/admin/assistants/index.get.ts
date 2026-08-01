import { eq, sql } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const db = useDb();

  return db
    .select({
      id: users.id,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      email: users.email,
      bannedAt: users.bannedAt,
      bannedReason: users.bannedReason,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.userType, 'assistant'));
});
