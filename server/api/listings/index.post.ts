import { and, count, eq, inArray } from 'drizzle-orm';
import slugify from 'slugify';
import { randomUUID } from 'node:crypto';
import { useDb } from '~~/server/database/client';
import { listings, categories, users } from '~~/server/database/schema';
import { listingSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const sessionUser = await requireVerified(event);
  await rateLimit(`ratelimit:create-listing:${sessionUser.id}`, 20, 60 * 60);

  const body = await readValidatedBody(event, listingSchema.parse);
  const db = useDb();

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, body.categoryId)
  });
  if (!category) {
    throw createError({ statusCode: 422, statusMessage: 'Unknown category.' });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) });
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Account not found.' });

  const [activeCountRow] = await db
    .select({ activeCount: count() })
    .from(listings)
    .where(and(eq(listings.userId, user.id), inArray(listings.status, ['pending', 'active'])));
  const activeCount = activeCountRow?.activeCount ?? 0;

  if (activeCount >= user.listingLimit) {
    throw createError({
      statusCode: 422,
      statusMessage: `You've reached your listing limit (${user.listingLimit}). Wait for a listing to sell or be archived, or contact support to raise your limit.`
    });
  }

  const slug = `${slugify(body.title, { lower: true, strict: true }).slice(0, 80)}-${randomUUID().slice(0, 8)}`;

  const [listing] = await db
    .insert(listings)
    .values({
      userId: user.id,
      categoryId: body.categoryId,
      title: body.title,
      slug,
      description: body.description,
      price: String(body.price),
      currency: body.currency,
      condition: body.condition,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      status: 'pending',
      planId: 'basic'
    })
    .returning();

  return listing;
});
