ALTER TABLE "payments" ALTER COLUMN "plan" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "highlight_boost" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "top_placement_boost" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "homepage_boost" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "boosts_expire_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "kind" text DEFAULT 'plan' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "boost" text;--> statement-breakpoint
CREATE INDEX "listings_homepage_boost_idx" ON "listings" USING btree ("homepage_boost","boosts_expire_at");