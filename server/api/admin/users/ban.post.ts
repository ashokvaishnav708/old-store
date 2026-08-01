import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users, bannedEmails } from '~~/server/database/schema';
import { banEmailSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const admin = await requireAdmin(event);
  const body = await readValidatedBody(event, banEmailSchema.parse);
  const db = useDb();

  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });

  if (user) {
    if (user.userType === 'admin') {
      throw createError({ statusCode: 422, statusMessage: 'Cannot ban an admin account.' });
    }
    await banUserById(user.id, body.reason, admin.id);
  } else {
    await db
      .insert(bannedEmails)
      .values({ email: body.email, reason: body.reason, bannedByUserId: admin.id })
      .onConflictDoUpdate({ target: bannedEmails.email, set: { reason: body.reason, bannedByUserId: admin.id } });
  }

  return { success: true };
});
