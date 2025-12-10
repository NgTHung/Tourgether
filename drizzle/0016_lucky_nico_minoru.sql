ALTER TABLE "tours" ADD COLUMN "duration" integer DEFAULT 8;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "group_size" integer DEFAULT 15;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "languages" text[] DEFAULT '{English}'::text[];--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "inclusions" text[] DEFAULT '{}'::text[];
