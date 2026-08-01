import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, categories } from '~~/server/database/schema';
import { listingUpdateSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, listingUpdateSchema.parse);
  const db = useDb();

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found.' });

  const isStaff = user.userType === 'admin' || user.userType === 'assistant';
  if (existing.userId !== user.id && !isStaff)
    throw createError({ statusCode: 403, statusMessage: 'Not your listing.' });

  if (body.categoryId) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, body.categoryId)
    });
    if (!category) throw createError({ statusCode: 422, statusMessage: 'Unknown category.' });
  }

  const [updated] = await db
    .update(listings)
    .set({
      ...body,
      price: body.price !== undefined ? String(body.price) : undefined,
      updatedAt: new Date()
    })
    .where(eq(listings.id, id))
    .returning();

  await invalidate(`listing:${id}`);

  return updated;
});
