import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { sendNotificationSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const staff = await requireStaff(event);
  const body = await readValidatedBody(event, sendNotificationSchema.parse);
  const db = useDb();

  const target = await db.query.users.findFirst({ where: eq(users.id, body.targetUserId) });
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' });

  await notifyUser({
    userId: target.id,
    senderId: staff.id,
    type: 'admin_message',
    title: body.title,
    body: body.body
  });

  return { success: true };
});
