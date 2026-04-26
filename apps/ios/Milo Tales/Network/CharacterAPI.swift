//
//  CharacterAPI.swift
//  Milo Tales
//

import Foundation

nonisolated struct CreateCharacterRequest: Encodable {
    let role: CharacterRole
    let name: String
    let symbolName: String
    let tint: String
    let tagline: String?
    let age: Int?
    let gender: Gender?
    let hairColor: String?
    let eyeColor: String?
    let hairstyle: String?
    let interests: [String]
    let extraInterestNote: String
}

nonisolated struct UpdateCharacterRequest: Encodable {
    var role: CharacterRole? = nil
    var name: String? = nil
    var symbolName: String? = nil
    var tint: String? = nil
    var tagline: String? = nil
    var age: Int? = nil
    var gender: Gender? = nil
    var hairColor: String? = nil
    var eyeColor: String? = nil
    var hairstyle: String? = nil
    var interests: [String]? = nil
    var extraInterestNote: String? = nil
}

nonisolated struct CharacterResponse: Decodable {
    let id: String
    let role: CharacterRole
    let name: String
    let symbolName: String
    let tint: String
    let tagline: String?
    let age: Int?
    let gender: Gender?
    let hairColor: String?
    let eyeColor: String?
    let hairstyle: String?
    let interests: [String]
    let extraInterestNote: String
    let createdAt: String
    let updatedAt: String

    func toCharacter() -> Character {
        Character(
            id: UUID(uuidString: id) ?? UUID(),
            name: name,
            role: role,
            symbolName: symbolName,
            tintName: tint,
            tagline: tagline ?? "",
            age: age,
            gender: gender,
            hairColor: hairColor,
            eyeColor: eyeColor,
            hairstyle: hairstyle,
            interests: interests,
            extraInterestNote: extraInterestNote
        )
    }
}

enum CharacterAPI {
    static func list() async throws -> [Character] {
        let payloads: [CharacterResponse] = try await APIClient.shared.get("/api/v1/characters")
        return payloads.map { $0.toCharacter() }
    }

    static func create(_ input: CreateCharacterRequest) async throws -> Character {
        let payload: CharacterResponse = try await APIClient.shared.post(
            "/api/v1/characters",
            body: input
        )
        return payload.toCharacter()
    }

    static func update(_ id: UUID, _ patch: UpdateCharacterRequest) async throws -> Character {
        let payload: CharacterResponse = try await APIClient.shared.patch(
            "/api/v1/characters/\(id.uuidString.lowercased())",
            body: patch
        )
        return payload.toCharacter()
    }

    static func delete(_ id: UUID) async throws {
        struct DeletedResponse: Decodable { let id: String }
        let _: DeletedResponse = try await APIClient.shared.delete(
            "/api/v1/characters/\(id.uuidString.lowercased())"
        )
    }
}
