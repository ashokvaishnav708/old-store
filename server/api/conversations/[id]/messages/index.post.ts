import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { conversations, messages } from '~~/server/database/schema';
import { messageSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, messageSchema.parse);
  const db = useDb();

  const conversation = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conversation)
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found.' });
  if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Not part of this conversation.' });
  }

  await rateLimit(`ratelimit:send-message:${user.id}`, 30, 60);

  const [message] = await db
    .insert(messages)
    .values({
      conversationId: id,
      senderId: user.id,
      body: body.body
    })
    .returning();

  return message;
});
