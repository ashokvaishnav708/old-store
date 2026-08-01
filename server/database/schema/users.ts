import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

type UserType = 'admin' | 'assistant' | 'private' | 'organisation';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  location: text('location'),
  userType: text('user_type').$type<UserType>().$default(() => 'private'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
