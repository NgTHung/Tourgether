ALTER TABLE "rating" RENAME TO "reviews";--> statement-breakpoint
ALTER TABLE "guide_tags" RENAME TO "tags";--> statement-breakpoint
ALTER TABLE "trip_reviews" RENAME TO "tour_reviews";--> statement-breakpoint
ALTER TABLE "guide_to_tags" DROP CONSTRAINT "guide_to_tags_tag_id_guide_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "rating_from_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "rating_to_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tour_to_tags" DROP CONSTRAINT "tour_to_tags_tag_id_guide_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "tour_reviews" DROP CONSTRAINT "trip_reviews_tour_id_tours_id_fk";
--> statement-breakpoint
ALTER TABLE "tour_reviews" DROP CONSTRAINT "trip_reviews_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "tags" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "tags" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "guide_to_tags" ADD CONSTRAINT "guide_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_to_tags" ADD CONSTRAINT "tour_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_reviews" ADD CONSTRAINT "tour_reviews_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_reviews" ADD CONSTRAINT "tour_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;