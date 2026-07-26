import { desc, eq, or, sql } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { conversations, listings, users, messages } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const db = useDb();

  return db
    .select({
      id: conversations.id,
      createdAt: conversations.createdAt,
      listing: { id: listings.id, title: listings.title, slug: listings.slug },
      buyer: { id: users.id, name: users.name },
      isSeller: sql<boolean>`${conversations.sellerId} = ${user.id}`,
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
    .innerJoin(users, eq(conversations.buyerId, users.id))
    .where(or(eq(conversations.buyerId, user.id), eq(conversations.sellerId, user.id)))
    .orderBy(desc(conversations.createdAt));
});
