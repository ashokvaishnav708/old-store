import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { conversations, messages } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const conversation = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conversation)
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found.' });
  if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Not part of this conversation.' });
  }

  const thread = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(eq(messages.conversationId, id), ne(messages.senderId, user.id), isNull(messages.readAt))
    );

  return thread;
});
