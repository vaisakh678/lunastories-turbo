CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'in_grace_period', 'cancelled', 'expired', 'none');--> statement-breakpoint
CREATE TYPE "public"."subscription_store" AS ENUM('app_store', 'play_store', 'amazon', 'stripe', 'promotional');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_store" "subscription_store";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_environment" varchar(16);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_will_renew" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_event_at" timestamp with time zone;