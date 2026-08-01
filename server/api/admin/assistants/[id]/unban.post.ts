import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();

  const assistant = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!assistant || assistant.userType !== 'assistant') {
    throw createError({ statusCode: 404, statusMessage: 'Assistant not found.' });
  }

  await unbanUserById(id);

  return { success: true };
});
