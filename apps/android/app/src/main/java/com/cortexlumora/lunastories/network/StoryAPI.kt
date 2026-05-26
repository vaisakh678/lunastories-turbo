package com.cortexlumora.lunastories.network

import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

enum class StoryStatus {
    @SerialName("pending") pending,
    @SerialName("generating") generating,
    @SerialName("ready") ready,
    @SerialName("failed") failed;
}

@Serializable
data class StoryContentBlock(
    val type: String,
    val text: String? = null,
    val symbol: String? = null,
    val tint: String? = null,
)

@Serializable
data class StoryContent(val blocks: List<StoryContentBlock> = emptyList())

@Serializable
data class FileRef(val fileId: String, val key: String, val url: String)

@Serializable
data class StoryResponse(
    val id: String,
    val status: StoryStatus,
    val modeKey: String,
    val title: String? = null,
    val summary: String? = null,
    val coverSymbol: String? = null,
    val coverTint: String? = null,
    val durationSeconds: Int? = null,
    val lastReadAt: String? = null,
    val createdAt: String,
    val updatedAt: String,
    // detail-only
    val characterIds: List<String>? = null,
    val bodyText: String? = null,
    val content: StoryContent? = null,
    val audio: FileRef? = null,
    val errorMessage: String? = null,
    val generationInput: JsonElement? = null,
)

@Serializable
data class CreateStoryRequest(
    val modeKey: String,
    val characterIds: List<String>,
    val input: JsonElement,
)

@Serializable
data class StoryPage(
    val items: List<StoryResponse>,
    val nextCursor: String? = null,
)

@Serializable
private data class StoryDeleteResponse(val id: String)

object StoryAPI {
    suspend fun delete(id: String) {
        APIClient.request<StoryDeleteResponse>("/stories/$id") {
            method = HttpMethod.Delete
        }
    }

    suspend fun list(cursor: String? = null, limit: Int = 30): StoryPage {
        val params = buildList {
            add("limit=$limit")
            if (cursor != null) add("cursor=$cursor")
        }.joinToString("&", prefix = "?")
        return APIClient.get("/stories$params")
    }

    suspend fun create(req: CreateStoryRequest): StoryResponse =
        APIClient.request("/stories") {
            method = HttpMethod.Post
            contentType(ContentType.Application.Json)
            setBody(req)
        }

    suspend fun get(id: String): StoryResponse = APIClient.get("/stories/$id")

    suspend fun latestActive(): StoryResponse? = runCatching {
        APIClient.get<StoryResponse>("/stories/latest-active")
    }.getOrNull()
}
