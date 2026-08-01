import { useDb } from '~~/server/database/client';
import { payments } from '~~/server/database/schema';
import { createSubscriptionPaymentSchema } from '#shared/utils/schemas';
import { subscriptionPrices } from '#shared/utils/subscriptions';

export default defineEventHandler(async event => {
  const user = await requireVerified(event);
  const body = await readValidatedBody(event, createSubscriptionPaymentSchema.parse);
  const db = useDb();

  const provider = usePaymentProvider();
  const amount = subscriptionPrices[body.tier];
  const intent = await provider.createIntent({
    userId: user.id,
    amount,
    currency: 'EUR'
  });

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      kind: 'subscription',
      subscriptionTier: body.tier,
      amount: String(amount),
      currency: 'EUR',
      providerRef: intent.providerRef
    })
    .returning();

  return { ...payment, redirectUrl: intent.redirectUrl };
});
