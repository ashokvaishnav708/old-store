export const listingPlans = ['basic', 'pro', 'ultra'] as const;
export type ListingPlan = (typeof listingPlans)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

export const planDurationDays: Record<ListingPlan, number> = {
  basic: 14,
  pro: 30,
  ultra: 60
};

export const planPrices: Record<ListingPlan, number> = {
  basic: 0,
  pro: 9.99,
  ultra: 19.99
};

export function planDurationMs(plan: ListingPlan): number {
  return planDurationDays[plan] * DAY_MS;
}

export function expiryFromNow(plan: ListingPlan): Date {
  return new Date(Date.now() + planDurationMs(plan));
}
