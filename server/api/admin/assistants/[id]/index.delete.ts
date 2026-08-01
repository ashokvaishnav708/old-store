import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing || existing.userType !== 'assistant') {
    throw createError({ statusCode: 404, statusMessage: 'Assistant not found.' });
  }

  // Downgrade rather than hard-delete, to preserve FK history (listings they
  // approved/rejected, complaints they handled, etc).
  await db.update(users).set({ userType: 'private', updatedAt: new Date() }).where(eq(users.id, id));
  await invalidate(`user:session-sync:${id}`);

  return { success: true };
});
