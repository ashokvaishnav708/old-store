import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';
import { expiryFromNow, type ListingPlan } from '#shared/utils/plans';

export interface CreateIntentInput {
  listingId: string;
  userId: string;
  plan: ListingPlan;
  amount: number;
  currency: string;
}

export interface PaymentIntentResult {
  providerRef: string;
  redirectUrl?: string;
}

export interface ConfirmResult {
  succeeded: boolean;
}

/**
 * Shaped after a real create-checkout + webhook-confirm gateway so swapping
 * in a real provider later only means implementing this interface and
 * pointing the confirm route at a signature-verified webhook instead.
 */
export interface PaymentProvider {
  createIntent(input: CreateIntentInput): Promise<PaymentIntentResult>;
  confirm(providerRef: string): Promise<ConfirmResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createIntent(): Promise<PaymentIntentResult> {
    return { providerRef: `mock_${randomUUID()}` };
  }

  async confirm(): Promise<ConfirmResult> {
    return { succeeded: true };
  }
}

export function usePaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}

/**
 * Applies a plan to a listing. If the listing is already active, its expiry
 * timer is reset from now using the new plan's duration; otherwise the plan
 * is stored for the approval step to use when it first sets `expiresAt`.
 */
export async function applyPlanToListing(listingId: string, plan: ListingPlan) {
  const db = useDb();
  const listing = await db.query.listings.findFirst({ where: eq(listings.id, listingId) });
  if (!listing) return;

  await db
    .update(listings)
    .set({
      planId: plan,
      expiresAt: listing.status === 'active' ? expiryFromNow(plan) : listing.expiresAt,
      updatedAt: new Date()
    })
    .where(eq(listings.id, listingId));

  await invalidate(`listing:${listingId}`);
}
