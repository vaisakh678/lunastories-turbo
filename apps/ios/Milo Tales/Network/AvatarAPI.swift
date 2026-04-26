//
//  AvatarAPI.swift
//  Milo Tales
//

import Foundation

nonisolated struct AvatarResponse: Decodable, Identifiable {
    let id: String
    let name: String?
    let storageKey: String
    let url: String
    let isEnabled: Bool
    let position: Int
    let createdAt: String
    let updatedAt: String
}

enum AvatarAPI {
    static func list() async throws -> [AvatarResponse] {
        try await APIClient.shared.get("/api/v1/avatars")
    }
}
