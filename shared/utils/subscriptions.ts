export const paidSubscriptionTiers = ['advanced', 'advanced_plus'] as const;
export type PaidSubscriptionTier = (typeof paidSubscriptionTiers)[number];
export type SubscriptionTier = 'basic' | PaidSubscriptionTier;

export const subscriptionListingLimits: Record<PaidSubscriptionTier, number> = {
  advanced: 10,
  advanced_plus: 20
};

export const subscriptionPrices: Record<PaidSubscriptionTier, number> = {
  advanced: 14.99,
  advanced_plus: 24.99
};

export const SUBSCRIPTION_DURATION_DAYS = 30;

export function subscriptionExpiryFromNow(): Date {
  return new Date(Date.now() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * The listing-limit cap in effect right now: the account's base limit
 * (staff-adjustable, see server/utils/roles.ts requireVerified callers),
 * or the subscription tier's higher limit while an upgrade is still active
 * — whichever is greater, so a staff override is never silently downgraded
 * by a self-service upgrade.
 */
export function effectiveListingLimit(user: {
  listingLimit: number;
  userSubscription: string | null;
  subscriptionExpiresAt: string | Date | null;
}): number {
  const isPaidTier =
    user.userSubscription !== null &&
    (paidSubscriptionTiers as readonly string[]).includes(user.userSubscription);
  const notExpired =
    user.subscriptionExpiresAt !== null && new Date(user.subscriptionExpiresAt) > new Date();

  if (isPaidTier && notExpired) {
    const tierLimit = subscriptionListingLimits[user.userSubscription as PaidSubscriptionTier];
    return Math.max(user.listingLimit, tierLimit);
  }

  return user.listingLimit;
}
