import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';
import { rejectListingSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, rejectListingSchema.parse);
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (existing.status !== 'pending') {
    throw createError({ statusCode: 422, statusMessage: 'Only pending listings can be rejected.' });
  }

  const [updated] = await db
    .update(listings)
    .set({
      status: 'rejected',
      rejectionReason: body.reason,
      updatedAt: new Date()
    })
    .where(eq(listings.id, id))
    .returning();

  await invalidate(`listing:${id}`, 'listings:list:*');

  return updated;
});
