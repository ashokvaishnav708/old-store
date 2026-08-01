import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export type UserType = 'admin' | 'assistant' | 'private' | 'organisation';
export type UserSubscription = 'basic' | 'pro' | 'ultra';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  location: text('location'),
  userType: text('user_type').$type<UserType>().default('private'),
  userSubscription: text('user_subscription').$type<UserSubscription>().default('basic'),
  verified: boolean('verified').default(false),
  bannedAt: timestamp('banned_at', { withTimezone: true }),
  bannedReason: text('banned_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
