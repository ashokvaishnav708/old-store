import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id')!;
  const db = useDb();
  const config = useRuntimeConfig();

  const assistant = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!assistant || assistant.userType !== 'assistant') {
    throw createError({ statusCode: 404, statusMessage: 'Assistant not found.' });
  }

  const rawToken = await createPasswordResetToken(assistant.id);
  const resetUrl = `${config.public.baseUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(assistant.email, resetUrl);

  return { success: true };
});
