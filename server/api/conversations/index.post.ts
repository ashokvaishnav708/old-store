import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { conversations, listings } from '~~/server/database/schema';

const startConversationSchema = z.object({ listingId: z.string().uuid() });

export default defineEventHandler(async event => {
  const user = await requireVerified(event);
  const { listingId } = await readValidatedBody(event, startConversationSchema.parse);
  const db = useDb();

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, listingId) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (listing.userId === user.id) {
    throw createError({
      statusCode: 422,
      statusMessage: 'You cannot message yourself about your own listing.'
    });
  }

  const [conversation] = await db
    .insert(conversations)
    .values({
      listingId,
      buyerId: user.id,
      sellerId: listing.userId
    })
    .onConflictDoUpdate({
      target: [conversations.listingId, conversations.buyerId],
      set: { listingId }
    })
    .returning();

  if (!conversation) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to start conversation.' });
  }

  return conversation;
});
