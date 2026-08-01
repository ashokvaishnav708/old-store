import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { banEmailSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const admin = await requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, banEmailSchema.pick({ reason: true }).parse);
  const db = useDb();

  const assistant = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!assistant || assistant.userType !== 'assistant') {
    throw createError({ statusCode: 404, statusMessage: 'Assistant not found.' });
  }

  await banUserById(id, body.reason, admin.id);

  return { success: true };
});
