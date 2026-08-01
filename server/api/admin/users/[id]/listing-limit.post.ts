import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { updateListingLimitSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  // Admin and assistants can both adjust a customer's listing limit.
  await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, updateListingLimitSchema.parse);
  const db = useDb();

  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User not found.' });

  await db
    .update(users)
    .set({ listingLimit: body.listingLimit, updatedAt: new Date() })
    .where(eq(users.id, id));

  await invalidate(`user:session-sync:${id}`);

  return { success: true };
});
