import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  doublePrecision,
  timestamp,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

export const listingConditionEnum = pgEnum('listing_condition', [
  'new',
  'like_new',
  'used',
  'use_marks',
  'defect',
]);
export const listingStatusEnum = pgEnum('listing_status', ['active', 'sold', 'archived', 'draft']);

export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
    currency: text('currency').notNull().default('EUR'),
    condition: listingConditionEnum('condition').notNull().default('used'),
    status: listingStatusEnum('status').notNull().default('active'),
    location: text('location'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    viewCount: integer('view_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [
    index('listings_category_idx').on(table.categoryId),
    index('listings_user_idx').on(table.userId),
    index('listings_status_created_idx').on(table.status, table.createdAt)
  ]
);

export const listingImages = pgTable(
  'listing_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [index('listing_images_listing_idx').on(table.listingId)]
);

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingImage = typeof listingImages.$inferSelect;
export type NewListingImage = typeof listingImages.$inferInsert;
