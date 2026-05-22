package com.cortexlumora.lunastories.network

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val id: String,
    val name: String? = null,
    val email: String? = null,
)

object UserAPI {
    suspend fun me(): UserResponse = APIClient.get("/users/me")
}
