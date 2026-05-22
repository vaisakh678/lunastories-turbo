package com.cortexlumora.lunastories.network

import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import kotlinx.serialization.Serializable

enum class CharacterRole { main, side }
enum class Gender { male, female, na }
enum class CharacterRelation {
    parent, grandparent, friend, pet, sibling, teacher, imaginary, other;

    val displayName: String get() = when (this) {
        parent -> "Parent"
        grandparent -> "Grandparent"
        friend -> "Friend"
        pet -> "Pet"
        sibling -> "Sibling"
        teacher -> "Teacher"
        imaginary -> "Imaginary"
        other -> "Other"
    }
}

@Serializable
data class CharacterResponse(
    val id: String,
    val role: CharacterRole,
    val name: String,
    val symbolName: String,
    val tint: String,
    val tagline: String? = null,
    val relation: CharacterRelation? = null,
    val customRelation: String? = null,
    val age: Int? = null,
    val gender: Gender? = null,
    val hairColor: String? = null,
    val eyeColor: String? = null,
    val hairstyle: String? = null,
    val interests: List<String> = emptyList(),
    val extraInterestNote: String = "",
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class CreateCharacterRequest(
    val role: CharacterRole,
    val name: String,
    val symbolName: String,
    val tint: String,
    val tagline: String? = null,
    val relation: CharacterRelation? = null,
    val customRelation: String? = null,
    val age: Int? = null,
    val gender: Gender? = null,
    val hairColor: String? = null,
    val eyeColor: String? = null,
    val hairstyle: String? = null,
    val interests: List<String> = emptyList(),
    val extraInterestNote: String = "",
)

@Serializable
data class UpdateCharacterRequest(
    val name: String? = null,
    val symbolName: String? = null,
    val tint: String? = null,
    val tagline: String? = null,
    val relation: CharacterRelation? = null,
    val customRelation: String? = null,
    val age: Int? = null,
    val gender: Gender? = null,
    val hairColor: String? = null,
    val eyeColor: String? = null,
    val hairstyle: String? = null,
    val interests: List<String>? = null,
    val extraInterestNote: String? = null,
)

object CharacterAPI {
    suspend fun list(): List<CharacterResponse> = APIClient.get("/characters")

    suspend fun create(input: CreateCharacterRequest): CharacterResponse =
        APIClient.request("/characters") {
            method = HttpMethod.Post
            contentType(ContentType.Application.Json)
            setBody(input)
        }

    suspend fun update(id: String, patch: UpdateCharacterRequest): CharacterResponse =
        APIClient.request("/characters/$id") {
            method = HttpMethod.Patch
            contentType(ContentType.Application.Json)
            setBody(patch)
        }

    suspend fun delete(id: String) {
        APIClient.request<DeleteResponse>("/characters/$id") {
            method = HttpMethod.Delete
        }
    }

    @Serializable
    private data class DeleteResponse(val id: String)
}
