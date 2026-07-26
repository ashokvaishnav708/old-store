import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const CATEGORIES = [
  { name: 'Electronics', icon: 'i-lucide-smartphone' },
  { name: 'Vehicles', icon: 'i-lucide-car' },
  { name: 'Home & Garden', icon: 'i-lucide-sofa' },
  { name: 'Fashion', icon: 'i-lucide-shirt' },
  { name: 'Real Estate', icon: 'i-lucide-home' },
  { name: 'Jobs', icon: 'i-lucide-briefcase' },
  { name: 'Hobbies & Leisure', icon: 'i-lucide-gamepad-2' },
  { name: 'Family & Kids', icon: 'i-lucide-baby' },
  { name: 'Services', icon: 'i-lucide-wrench' },
  { name: 'Free Stuff', icon: 'i-lucide-gift' }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding categories...');

  for (const [index, category] of CATEGORIES.entries()) {
    await db
      .insert(schema.categories)
      .values({
        name: category.name,
        slug: slugify(category.name),
        icon: category.icon,
        position: index
      })
      .onConflictDoNothing({ target: schema.categories.slug });
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  await sql.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
