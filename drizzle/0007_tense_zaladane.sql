CREATE TABLE "guider_applied_tours" (
	"guide_id" text,
	"tour_id" uuid,
	"applied_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "thumbnail_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guider_applied_tours" ADD CONSTRAINT "guider_applied_tours_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guider_applied_tours" ADD CONSTRAINT "guider_applied_tours_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;