import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { payments } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const payment = await db.query.payments.findFirst({ where: eq(payments.id, id) });
  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Payment not found.' });
  if (payment.userId !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Not your payment.' });
  if (payment.status !== 'pending') {
    throw createError({ statusCode: 422, statusMessage: 'Payment already finalized.' });
  }

  const provider = usePaymentProvider();
  const result = await provider.confirm(payment.providerRef ?? '');

  const [updated] = await db
    .update(payments)
    .set({
      status: result.succeeded ? 'succeeded' : 'failed',
      confirmedAt: result.succeeded ? new Date() : null
    })
    .where(eq(payments.id, id))
    .returning();

  if (result.succeeded) {
    await applyPlanToListing(payment.listingId, payment.plan);
  }

  return updated;
});
