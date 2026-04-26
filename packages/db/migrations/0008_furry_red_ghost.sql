CREATE TABLE "avatar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar_id" uuid NOT NULL,
	"name" varchar(64),
	"setting" varchar(32),
	"action" varchar(32),
	"tags" text[] DEFAULT '{}' NOT NULL,
	"storage_key" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "avatar_events" ADD CONSTRAINT "avatar_events_avatar_id_character_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."character_avatars"("id") ON DELETE cascade ON UPDATE no action;