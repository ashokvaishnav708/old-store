import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { randomUUID } from 'node:crypto';
import { useDb } from '~~/server/database/client';
import { listings, categories } from '~~/server/database/schema';
import { listingSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  await rateLimit(`ratelimit:create-listing:${user.id}`, 20, 60 * 60);

  const body = await readValidatedBody(event, listingSchema.parse);
  const db = useDb();

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, body.categoryId)
  });
  if (!category) {
    throw createError({ statusCode: 422, statusMessage: 'Unknown category.' });
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
      longitude: body.longitude
    })
    .returning();

  return listing;
});
