CREATE TYPE "public"."character_role" AS ENUM('main', 'side');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'na');--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" character_role NOT NULL,
	"name" varchar(64) NOT NULL,
	"symbol_name" varchar(64) NOT NULL,
	"tint" varchar(32) NOT NULL,
	"tagline" varchar(255),
	"age" smallint,
	"gender" "gender",
	"hair_color" varchar(32),
	"eye_color" varchar(32),
	"hairstyle" varchar(32),
	"interests" text[] DEFAULT '{}' NOT NULL,
	"extra_interest_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(64) NOT NULL,
	"email" varchar(64) NOT NULL,
	"name" varchar(64),
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;