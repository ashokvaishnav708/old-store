import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users, bannedEmails } from '~~/server/database/schema';

export async function banUserById(userId: string, reason: string | undefined, bannedByUserId: string) {
  const db = useDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;

  await db
    .update(users)
    .set({ bannedAt: new Date(), bannedReason: reason ?? null, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db
    .insert(bannedEmails)
    .values({ email: user.email, reason, bannedByUserId })
    .onConflictDoUpdate({ target: bannedEmails.email, set: { reason, bannedByUserId } });

  await invalidate(`user:banned:${userId}`);
  return user;
}

export async function unbanUserById(userId: string) {
  const db = useDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;

  await db
    .update(users)
    .set({ bannedAt: null, bannedReason: null, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db.delete(bannedEmails).where(eq(bannedEmails.email, user.email));
  await invalidate(`user:banned:${userId}`);
  return user;
}
