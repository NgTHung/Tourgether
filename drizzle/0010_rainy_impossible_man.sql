CREATE TYPE "public"."tour_status" AS ENUM('PENDING', 'CURRENT', 'COMPLETED');--> statement-breakpoint
ALTER TABLE "itinerary" ALTER COLUMN "time" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "posted_by" text;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "status" "tour_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_posted_by_user_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "title";