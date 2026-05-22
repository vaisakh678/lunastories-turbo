package com.cortexlumora.lunastories.network

import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

enum class FeedbackCategory {
    @SerialName("bug") bug,
    @SerialName("idea") idea,
    @SerialName("praise") praise,
    @SerialName("other") other,
}

@Serializable
data class CreateFeedbackRequest(
    val category: FeedbackCategory,
    val message: String,
    val rating: Int? = null,
)

@Serializable
data class FeedbackResponse(
    val id: String,
    val category: FeedbackCategory,
    val message: String,
    val rating: Int? = null,
    val createdAt: String,
)

object FeedbackAPI {
    suspend fun create(req: CreateFeedbackRequest): FeedbackResponse =
        APIClient.request("/feedback") {
            method = HttpMethod.Post
            contentType(ContentType.Application.Json)
            setBody(req)
        }
}
