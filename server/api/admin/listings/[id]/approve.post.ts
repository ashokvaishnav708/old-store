import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';
import { expiryFromNow } from '#shared/utils/plans';
import { boostExpiryFromNow } from '#shared/utils/boosts';

export default defineEventHandler(async event => {
  const staff = await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (existing.status !== 'pending') {
    throw createError({ statusCode: 422, statusMessage: 'Only pending listings can be approved.' });
  }

  const hasBoost = existing.highlightBoost || existing.topPlacementBoost || existing.homepageBoost;

  const [updated] = await db
    .update(listings)
    .set({
      status: 'active',
      approvedByUserId: staff.id,
      approvedAt: new Date(),
      rejectionReason: null,
      expiresAt: expiryFromNow(existing.planId),
      // Boosts purchased before approval start their 14-day timer now; a
      // boost purchased on an already-active listing starts immediately
      // instead (see applyBoostToListing), so don't overwrite that here.
      boostsExpireAt: hasBoost && !existing.boostsExpireAt ? boostExpiryFromNow() : existing.boostsExpireAt,
      updatedAt: new Date()
    })
    .where(eq(listings.id, id))
    .returning();

  await invalidate(`listing:${id}`, 'listings:list:*');

  await notifyUser({
    userId: existing.userId,
    type: 'listing_approved',
    title: 'Your ad has been successfully published',
    body: existing.title,
    link: `/listings/${id}`
  });

  return updated;
});
