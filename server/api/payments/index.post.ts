import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, payments } from '~~/server/database/schema';
import { createPaymentSchema } from '#shared/utils/schemas';
import { planPrices } from '#shared/utils/plans';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, createPaymentSchema.parse);
  const db = useDb();

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, body.listingId) });
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });
  if (listing.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  const provider = usePaymentProvider();
  const amount = planPrices[body.plan];
  const intent = await provider.createIntent({
    listingId: listing.id,
    userId: user.id,
    plan: body.plan,
    amount,
    currency: listing.currency
  });

  const [payment] = await db
    .insert(payments)
    .values({
      listingId: listing.id,
      userId: user.id,
      plan: body.plan,
      amount: String(amount),
      currency: listing.currency,
      providerRef: intent.providerRef
    })
    .returning();

  return { ...payment, redirectUrl: intent.redirectUrl };
});
