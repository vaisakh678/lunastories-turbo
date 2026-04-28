ALTER TABLE "characters" ALTER COLUMN "relation" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."character_relation";--> statement-breakpoint
CREATE TYPE "public"."character_relation" AS ENUM('parent', 'grandparent', 'friend', 'pet', 'sibling', 'teacher', 'other', 'imaginary');--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "relation" SET DATA TYPE character_relation USING "relation"::character_relation;