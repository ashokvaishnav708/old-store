import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Hash } from '@adonisjs/hash';
import { Scrypt } from '@adonisjs/hash/drivers/scrypt';
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

async function seedAdmin() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_EMAIL) return;

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@oldstore.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin1234';

  // Mirrors nuxt-auth-utils' hashPassword/verifyPassword (both wrap
  // @adonisjs/hash with the Scrypt driver and no config overrides), but this
  // script runs standalone via tsx, outside the Nitro runtime, so it can't
  // use the `#imports`-based `useRuntimeConfig()` those helpers depend on.
  const hash = new Hash(new Scrypt({}));
  const passwordHash = await hash.make(password);

  await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      verified: true
    })
    .onConflictDoNothing({ target: schema.users.email });

  console.log(`Seeded admin account: ${email} / ${password}`);
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

  await seedAdmin();
  await sql.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
