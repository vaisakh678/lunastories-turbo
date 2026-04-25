CREATE TYPE "public"."story_status" AS ENUM('pending', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "story_characters" (
	"story_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "story_characters_story_id_character_id_pk" PRIMARY KEY("story_id","character_id")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode_key" varchar(64) NOT NULL,
	"status" "story_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"title" varchar(255),
	"summary" text,
	"cover_symbol" varchar(64),
	"cover_tint" varchar(32),
	"generation_input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content" jsonb,
	"body_text" text,
	"audio_url" text,
	"duration_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "story_characters" ADD CONSTRAINT "story_characters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_characters" ADD CONSTRAINT "story_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;