import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users, bannedEmails } from '~~/server/database/schema';
import { banEmailSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const body = await readValidatedBody(event, banEmailSchema.pick({ email: true }).parse);
  const db = useDb();

  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  if (user) {
    await unbanUserById(user.id);
  } else {
    await db.delete(bannedEmails).where(eq(bannedEmails.email, body.email));
  }

  return { success: true };
});
