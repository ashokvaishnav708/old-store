export const advertisingBoosts = ['highlight', 'top_placement', 'homepage'] as const;
export type AdvertisingBoost = (typeof advertisingBoosts)[number];

export const boostPrices: Record<AdvertisingBoost, number> = {
  highlight: 4.99,
  top_placement: 6.99,
  homepage: 9.99
};

export const BOOST_DURATION_DAYS = 14;

export function boostExpiryFromNow(): Date {
  return new Date(Date.now() + BOOST_DURATION_DAYS * 24 * 60 * 60 * 1000);
}
