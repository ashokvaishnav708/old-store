import { desc, eq, sql } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { conversations, listings, users, messages } from '~~/server/database/schema';
import { alias } from 'drizzle-orm/pg-core';

export default defineEventHandler(async event => {
  await requireStaff(event);
  const db = useDb();

  const buyers = alias(users, 'buyers');
  const sellers = alias(users, 'sellers');

  return db
    .select({
      id: conversations.id,
      createdAt: conversations.createdAt,
      listing: { id: listings.id, title: listings.title, slug: listings.slug },
      buyer: {
        id: buyers.id,
        name: sql<string>`${buyers.firstName} || ' ' || ${buyers.lastName}`
      },
      seller: {
        id: sellers.id,
        name: sql<string>`${sellers.firstName} || ' ' || ${sellers.lastName}`
      },
      lastMessage: sql<string | null>`(
      SELECT ${messages.body} FROM ${messages}
      WHERE ${messages.conversationId} = ${conversations.id}
      ORDER BY ${messages.createdAt} DESC LIMIT 1
    )`,
      lastMessageAt: sql<string | null>`(
      SELECT ${messages.createdAt} FROM ${messages}
      WHERE ${messages.conversationId} = ${conversations.id}
      ORDER BY ${messages.createdAt} DESC LIMIT 1
    )`
    })
    .from(conversations)
    .innerJoin(listings, eq(conversations.listingId, listings.id))
    .innerJoin(buyers, eq(conversations.buyerId, buyers.id))
    .innerJoin(sellers, eq(conversations.sellerId, sellers.id))
    .orderBy(desc(conversations.createdAt));
});
