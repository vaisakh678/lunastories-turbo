//
//  UserAPI.swift
//  Luna Stories
//

import Foundation

nonisolated struct DeleteAccountResponse: Decodable {
    let deleted: Bool
}

/// Backend's view of the signed-in user. The `id` here is the *internal*
/// user id (NOT the Clerk id) — it's what we pass to OneSignal so the
/// backend can target this user for push notifications.
nonisolated struct UserProfileResponse: Decodable {
    let id: String
    let name: String?
    let email: String?
}

enum UserAPI {
    static func me() async throws -> UserProfileResponse {
        try await APIClient.shared.get("/api/v1/users/me")
    }

    static func deleteAccount() async throws -> DeleteAccountResponse {
        try await APIClient.shared.delete("/api/v1/users/me")
    }
}
