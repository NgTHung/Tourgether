/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'likes'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "likes" DROP CONSTRAINT "likes_post_id_posts_id_fk";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id");