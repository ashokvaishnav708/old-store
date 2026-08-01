import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';
import { createAssistantSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  await requireAdmin(event);
  const body = await readValidatedBody(event, createAssistantSchema.parse);
  const db = useDb();

  const existing = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists.'
    });
  }

  const passwordHash = await hashPassword(body.password);
  const [assistant] = await db
    .insert(users)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      passwordHash,
      userType: 'assistant'
    })
    .returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt
    });

  return assistant;
});
