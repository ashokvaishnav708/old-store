import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, payments } from '~~/server/database/schema';
import { createBoostPaymentSchema } from '#shared/utils/schemas';
import { boostPrices } from '#shared/utils/boosts';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, createBoostPaymentSchema.parse);
  const db = useDb();

  if (user.userType !== 'organisation') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Advertising boosts are only available for organisation accounts.'
    });
  }

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, body.listingId) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (listing.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  const provider = usePaymentProvider();
  const amount = boostPrices[body.boost];
  const intent = await provider.createIntent({
    listingId: listing.id,
    userId: user.id,
    amount,
    currency: listing.currency
  });

  const [payment] = await db
    .insert(payments)
    .values({
      listingId: listing.id,
      userId: user.id,
      kind: 'boost',
      boost: body.boost,
      amount: String(amount),
      currency: listing.currency,
      providerRef: intent.providerRef
    })
    .returning();

  return { ...payment, redirectUrl: intent.redirectUrl };
});
