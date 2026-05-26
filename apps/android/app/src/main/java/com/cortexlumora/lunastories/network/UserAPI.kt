package com.cortexlumora.lunastories.network

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val id: String,
    val name: String? = null,
    val email: String? = null,
)

@Serializable
data class DeleteAccountResponse(val deleted: Boolean)

object UserAPI {
    suspend fun me(): UserResponse = APIClient.get("/users/me")

    suspend fun deleteMe(): DeleteAccountResponse =
        APIClient.request("/users/me") { method = io.ktor.http.HttpMethod.Delete }
}
