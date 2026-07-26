import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { useRuntimeConfig } from '#imports';
import * as schema from './schema';

let queryClient: postgres.Sql | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function useDb() {
  if (!db) {
    const config = useRuntimeConfig();
    queryClient = postgres(config.databaseUrl as string);
    db = drizzle(queryClient, { schema });
  }
  return db;
}
