import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users, bannedEmails } from '~~/server/database/schema';
import { registerSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  await rateLimit(`ratelimit:register:${ip}`, 5, 60);

  const body = await readValidatedBody(event, registerSchema.parse);
  const db = useDb();

  const existing = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists.'
    });
  }

  const banned = await db.query.bannedEmails.findFirst({
    where: eq(bannedEmails.email, body.email)
  });
  if (banned) {
    throw createError({ statusCode: 403, statusMessage: 'This email is not allowed to register.' });
  }

  const passwordHash = await hashPassword(body.password);
  const [user] = await db
    .insert(users)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      passwordHash
    })
    .returning();

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create account.' });
  }

  const name = `${user.firstName} ${user.lastName}`;

  const config = useRuntimeConfig();
  const rawToken = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, `${config.public.baseUrl}/verify-email?token=${rawToken}`);

  await setUserSession(event, {
    user: {
      id: user.id,
      name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      userType: user.userType ?? 'private',
      verified: user.verified ?? false
    }
  });

  return { id: user.id, name, email: user.email };
});
