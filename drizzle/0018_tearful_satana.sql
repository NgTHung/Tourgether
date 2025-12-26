CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "guider_applied_tours" ADD COLUMN "status" "application_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "guider_applied_tours" ADD COLUMN "reviewed_at" timestamp;