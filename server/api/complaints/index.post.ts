import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { complaints, listings, users } from '~~/server/database/schema';
import { complaintSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, complaintSchema.parse);
  const db = useDb();

  if (body.targetListingId) {
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, body.targetListingId)
    });
    if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  }

  if (body.targetUserId) {
    const target = await db.query.users.findFirst({ where: eq(users.id, body.targetUserId) });
    if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }

  const [complaint] = await db
    .insert(complaints)
    .values({
      reporterId: user.id,
      targetListingId: body.targetListingId,
      targetUserId: body.targetUserId,
      reason: body.reason,
      details: body.details
    })
    .returning();

  return complaint;
});
