CREATE TYPE "public"."leave_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CRITICIZED');--> statement-breakpoint
CREATE TABLE "tour_leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid,
	"guide_id" text,
	"reason" text NOT NULL,
	"status" "leave_request_status" DEFAULT 'PENDING' NOT NULL,
	"organization_response" text,
	"criticism_rating" integer,
	"criticism_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "tour_leave_requests" ADD CONSTRAINT "tour_leave_requests_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_leave_requests" ADD CONSTRAINT "tour_leave_requests_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE cascade ON UPDATE no action;