ALTER TABLE "user_to_tours" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_to_tours" CASCADE;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "website_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "slogan" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_guide" ALTER COLUMN "school" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_guide" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint