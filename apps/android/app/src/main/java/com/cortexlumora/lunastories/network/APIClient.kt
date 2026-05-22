package com.cortexlumora.lunastories.network

import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.session.fetchToken
import com.cortexlumora.lunastories.BuildConfig
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.takeFrom
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

sealed class APIError(message: String) : RuntimeException(message) {
    class Unauthorized(message: String = "Unauthorized") : APIError(message)
    class Server(val status: Int, message: String) : APIError(message)
    class NotAuthenticated : APIError("Not signed in")
}

@Serializable
data class Envelope<T>(
    val data: T? = null,
    val message: String? = null,
    val error: String? = null,
)

/**
 * Ktor wrapper that attaches a fresh Clerk session bearer token to every
 * request. Mirrors the iOS APIClient's envelope-aware decoding so route
 * handlers can return `{ data: T }` and we extract `T` here.
 */
object APIClient {
    private val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }

    val http: HttpClient = HttpClient(Android) {
        expectSuccess = false
        install(ContentNegotiation) { json(json) }
        defaultRequest {
            header(HttpHeaders.Accept, "application/json")
        }
    }

    suspend inline fun <reified T> get(path: String): T = request(path) {}

    suspend inline fun <reified T> request(
        path: String,
        crossinline block: HttpRequestBuilder.() -> Unit,
    ): T {
        val token = sessionToken() ?: throw APIError.NotAuthenticated()
        val response = http.get {
            url { takeFrom(BuildConfig.API_BASE_URL + path.ensureLeadingSlash()) }
            header(HttpHeaders.Authorization, "Bearer $token")
            block()
        }
        return unwrap(response)
    }

    suspend inline fun <reified T> unwrap(response: HttpResponse): T {
        if (response.status == HttpStatusCode.Unauthorized) throw APIError.Unauthorized()
        val envelope = runCatching { response.body<Envelope<T>>() }.getOrNull()
        if (response.status.isSuccess()) {
            return envelope?.data
                ?: throw APIError.Server(response.status.value, envelope?.error ?: "Empty response")
        }
        throw APIError.Server(
            response.status.value,
            envelope?.error ?: envelope?.message ?: response.bodyAsText(),
        )
    }

    suspend fun sessionToken(): String? {
        val session = Clerk.session ?: return null
        return when (val r = session.fetchToken()) {
            is ClerkResult.Success -> r.value.jwt
            is ClerkResult.Failure -> null
        }
    }

    fun String.ensureLeadingSlash(): String = if (startsWith("/")) this else "/$this"

    fun HttpStatusCode.isSuccess(): Boolean = value in 200..299
}
