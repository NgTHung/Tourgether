CREATE TABLE "previous_tour_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"previous_tour_id" uuid,
	"user_id" text,
	"rating" integer NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "previous_tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_tour_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"location" text NOT NULL,
	"date" timestamp NOT NULL,
	"thumbnail_url" text NOT NULL,
	"galleries" text[] DEFAULT '{}'::text[],
	"owner_user_id" text,
	"guide_id" text,
	"guide_name" text,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp NOT NULL,
	"total_revenue" integer DEFAULT 0,
	"total_travelers" integer DEFAULT 0,
	"average_rating" numeric(3, 2)
);
--> statement-breakpoint
ALTER TABLE "previous_tour_feedbacks" ADD CONSTRAINT "previous_tour_feedbacks_previous_tour_id_previous_tours_id_fk" FOREIGN KEY ("previous_tour_id") REFERENCES "public"."previous_tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "previous_tour_feedbacks" ADD CONSTRAINT "previous_tour_feedbacks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "previous_tours" ADD CONSTRAINT "previous_tours_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "previous_tours" ADD CONSTRAINT "previous_tours_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE set null ON UPDATE no action;