import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { useDb } from '~~/server/database/client';
import { complaints, users, listings } from '~~/server/database/schema';

const complaintsQuerySchema = z.object({
  status: z.enum(['open', 'in_review', 'resolved', 'dismissed']).default('open')
});

export default defineEventHandler(async event => {
  await requireStaff(event);
  const query = await getValidatedQuery(event, complaintsQuerySchema.parse);
  const db = useDb();

  return db
    .select({
      id: complaints.id,
      reason: complaints.reason,
      details: complaints.details,
      status: complaints.status,
      resolutionNote: complaints.resolutionNote,
      createdAt: complaints.createdAt,
      handledAt: complaints.handledAt,
      reporter: {
        id: users.id,
        name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
      },
      targetListing: { id: listings.id, title: listings.title, slug: listings.slug },
      targetUserId: complaints.targetUserId
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.reporterId, users.id))
    .leftJoin(listings, eq(complaints.targetListingId, listings.id))
    .where(eq(complaints.status, query.status))
    .orderBy(desc(complaints.createdAt));
});
