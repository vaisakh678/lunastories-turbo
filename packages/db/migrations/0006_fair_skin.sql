ALTER TABLE "stories" ADD COLUMN "text_input_tokens" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "text_output_tokens" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "audio_input_chars" integer;