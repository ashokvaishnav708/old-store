import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { listings } from './listings';

export const bannedEmails = pgTable('banned_emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  reason: text('reason'),
  bannedByUserId: uuid('banned_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [
    index('password_reset_tokens_user_idx').on(table.userId),
    index('password_reset_tokens_token_hash_idx').on(table.tokenHash)
  ]
);

export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [
    index('email_verification_tokens_user_idx').on(table.userId),
    index('email_verification_tokens_token_hash_idx').on(table.tokenHash)
  ]
);

export type ComplaintStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';

export const complaints = pgTable(
  'complaints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: uuid('reporter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetListingId: uuid('target_listing_id').references(() => listings.id, {
      onDelete: 'cascade'
    }),
    targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    details: text('details'),
    status: text('status').$type<ComplaintStatus>().notNull().default('open'),
    resolutionNote: text('resolution_note'),
    handledByUserId: uuid('handled_by_user_id').references(() => users.id, {
      onDelete: 'set null'
    }),
    handledAt: timestamp('handled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [
    index('complaints_status_idx').on(table.status),
    index('complaints_target_listing_idx').on(table.targetListingId),
    index('complaints_target_user_idx').on(table.targetUserId)
  ]
);

export type BannedEmail = typeof bannedEmails.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
