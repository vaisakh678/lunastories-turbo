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
}
