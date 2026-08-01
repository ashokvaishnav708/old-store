import { pgTable, uuid, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { listings } from './listings';

export type PaymentKind = 'plan' | 'boost';
export type PaymentPlan = 'basic' | 'pro' | 'ultra';
export type PaymentBoost = 'highlight' | 'top_placement' | 'homepage';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<PaymentKind>().notNull().default('plan'),
    plan: text('plan').$type<PaymentPlan>(),
    boost: text('boost').$type<PaymentBoost>(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('EUR'),
    provider: text('provider').notNull().default('mock'),
    providerRef: text('provider_ref'),
    status: text('status').$type<PaymentStatus>().notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true })
  },
  table => [
    index('payments_listing_idx').on(table.listingId),
    index('payments_user_idx').on(table.userId),
    index('payments_status_idx').on(table.status)
  ]
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
