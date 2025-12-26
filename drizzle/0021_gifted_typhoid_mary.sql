CREATE TABLE "guide_performance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" text NOT NULL,
	"previous_tour_id" uuid,
	"organization_id" text NOT NULL,
	"summary" text NOT NULL,
	"strengths" text[] DEFAULT '{}'::text[],
	"improvements" text,
	"sentiment_score" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"red_flags" integer DEFAULT 0 NOT NULL,
	"tour_name" text NOT NULL,
	"tour_location" text,
	"tour_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tour_guide" ADD COLUMN "average_rating" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "tour_guide" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "guide_performance_reviews" ADD CONSTRAINT "guide_performance_reviews_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_performance_reviews" ADD CONSTRAINT "guide_performance_reviews_previous_tour_id_previous_tours_id_fk" FOREIGN KEY ("previous_tour_id") REFERENCES "public"."previous_tours"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_performance_reviews" ADD CONSTRAINT "guide_performance_reviews_organization_id_user_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "guides_needed";