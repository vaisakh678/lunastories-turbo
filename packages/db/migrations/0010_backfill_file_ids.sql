-- Promote existing storage_key columns into the new files table and link by file_id.
-- Re-run is safe: ON CONFLICT (storage_key) DO NOTHING + WHERE clauses skip rows already linked.

WITH inserted AS (
	INSERT INTO "files" ("storage_key", "content_type")
	SELECT "storage_key", 'image/webp'
	FROM "character_avatars"
	WHERE "storage_key" IS NOT NULL AND "file_id" IS NULL
	ON CONFLICT ("storage_key") DO NOTHING
	RETURNING "id", "storage_key"
)
UPDATE "character_avatars" a
SET "file_id" = f."id"
FROM "files" f
WHERE a."storage_key" = f."storage_key" AND a."file_id" IS NULL;
--> statement-breakpoint
WITH inserted AS (
	INSERT INTO "files" ("storage_key", "content_type")
	SELECT "storage_key", 'image/webp'
	FROM "avatar_events"
	WHERE "storage_key" IS NOT NULL AND "file_id" IS NULL
	ON CONFLICT ("storage_key") DO NOTHING
	RETURNING "id", "storage_key"
)
UPDATE "avatar_events" e
SET "file_id" = f."id"
FROM "files" f
WHERE e."storage_key" = f."storage_key" AND e."file_id" IS NULL;
--> statement-breakpoint
WITH inserted AS (
	INSERT INTO "files" ("storage_key", "content_type")
	SELECT "audio_storage_key", 'audio/mpeg'
	FROM "stories"
	WHERE "audio_storage_key" IS NOT NULL AND "audio_file_id" IS NULL
	ON CONFLICT ("storage_key") DO NOTHING
	RETURNING "id", "storage_key"
)
UPDATE "stories" s
SET "audio_file_id" = f."id"
FROM "files" f
WHERE s."audio_storage_key" = f."storage_key" AND s."audio_file_id" IS NULL;
