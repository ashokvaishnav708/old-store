import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';
import { expiryFromNow } from '#shared/utils/plans';

export default defineEventHandler(async event => {
  const staff = await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (existing.status !== 'pending') {
    throw createError({ statusCode: 422, statusMessage: 'Only pending listings can be approved.' });
  }

  const [updated] = await db
    .update(listings)
    .set({
      status: 'active',
      approvedByUserId: staff.id,
      approvedAt: new Date(),
      rejectionReason: null,
      expiresAt: expiryFromNow(existing.planId),
      updatedAt: new Date()
    })
    .where(eq(listings.id, id))
    .returning();

  await invalidate(`listing:${id}`, 'listings:list:*');

  return updated;
});
