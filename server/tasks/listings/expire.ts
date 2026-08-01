import { and, eq, lt, isNotNull } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings } from '~~/server/database/schema';

export default defineTask({
  meta: {
    name: 'listings:expire',
    description: "Delete active listings whose plan timer has run out, and their photos."
  },
  async run() {
    const db = useDb();

    const expired = await db
      .select({ id: listings.id })
      .from(listings)
      .where(
        and(eq(listings.status, 'active'), isNotNull(listings.expiresAt), lt(listings.expiresAt, new Date()))
      );

    for (const { id } of expired) {
      await deleteListingWithImages(id);
    }

    return { result: { deleted: expired.length } };
  }
});
