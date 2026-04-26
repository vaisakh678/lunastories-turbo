ALTER TABLE "character_avatars" ALTER COLUMN "file_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "avatar_events" ALTER COLUMN "file_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "character_avatars" ADD CONSTRAINT "character_avatars_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "avatar_events" ADD CONSTRAINT "avatar_events_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_audio_file_id_files_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "character_avatars" DROP COLUMN "storage_key";
--> statement-breakpoint
ALTER TABLE "avatar_events" DROP COLUMN "storage_key";
--> statement-breakpoint
ALTER TABLE "stories" DROP COLUMN "audio_storage_key";
