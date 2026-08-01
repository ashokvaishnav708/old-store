import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { complaints } from '~~/server/database/schema';
import { respondComplaintSchema } from '#shared/utils/schemas';

export default defineEventHandler(async event => {
  const staff = await requireStaff(event);
  const id = getRouterParam(event, 'id')!;
  const body = await readValidatedBody(event, respondComplaintSchema.parse);
  const db = useDb();

  const existing = await db.query.complaints.findFirst({ where: eq(complaints.id, id) });
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Complaint not found.' });

  const [updated] = await db
    .update(complaints)
    .set({
      status: body.status,
      resolutionNote: body.resolutionNote,
      handledByUserId: staff.id,
      handledAt: new Date()
    })
    .where(eq(complaints.id, id))
    .returning();

  return updated;
});
