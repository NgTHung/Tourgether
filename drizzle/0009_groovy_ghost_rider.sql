ALTER TABLE "itinerary" ADD COLUMN "time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "galleries" text[] DEFAULT '{}'::text[];