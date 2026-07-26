import { asc } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { categories } from '~~/server/database/schema';

export default defineCachedEventHandler(
  async () => {
    const db = useDb();
    return db.query.categories.findMany({ orderBy: asc(categories.position) });
  },
  {
    maxAge: 60 * 60,
    name: 'categories-list',
    getKey: () => 'all'
  }
);
