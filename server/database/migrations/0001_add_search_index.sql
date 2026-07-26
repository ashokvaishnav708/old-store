CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN (
  to_tsvector('english', title || ' ' || description)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops);
