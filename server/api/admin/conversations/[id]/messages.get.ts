import { asc, eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { conversations, messages } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const conversation = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conversation)
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found.' });

  const thread = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return { buyerId: conversation.buyerId, sellerId: conversation.sellerId, messages: thread };
});
