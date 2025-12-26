ALTER TABLE "user" ADD COLUMN "finished_onboardings" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tour_guide" ADD COLUMN "cv_url" text;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");