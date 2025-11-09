CREATE TABLE "guide_to_tags" (
	"guide_id" text,
	"tag_id" uuid,
	CONSTRAINT "guide_to_tags_guide_id_tag_id_pk" PRIMARY KEY("guide_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tour_to_tags" (
	"tour_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "tour_to_tags_tour_id_tag_id_pk" PRIMARY KEY("tour_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "trip_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid,
	"user_id" text,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_to_tours" (
	"user_id" text,
	"tour_id" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_to_tours_user_id_tour_id_pk" PRIMARY KEY("user_id","tour_id")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "itinerary" ADD COLUMN "own_tour_id" uuid;--> statement-breakpoint
ALTER TABLE "rating" ADD COLUMN "from_user_id" text;--> statement-breakpoint
ALTER TABLE "rating" ADD COLUMN "to_user_id" text;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "owner_user_id" text;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "guide_id" text;--> statement-breakpoint
ALTER TABLE "guide_to_tags" ADD CONSTRAINT "guide_to_tags_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_to_tags" ADD CONSTRAINT "guide_to_tags_tag_id_guide_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."guide_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_to_tags" ADD CONSTRAINT "tour_to_tags_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_to_tags" ADD CONSTRAINT "tour_to_tags_tag_id_guide_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."guide_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_tours" ADD CONSTRAINT "user_to_tours_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_tours" ADD CONSTRAINT "user_to_tours_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_own_tour_id_tours_id_fk" FOREIGN KEY ("own_tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_guide_id_tour_guide_user_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."tour_guide"("user_id") ON DELETE set null ON UPDATE no action;