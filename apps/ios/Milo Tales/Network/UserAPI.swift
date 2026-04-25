//
//  UserAPI.swift
//  Milo Tales
//

import Foundation

nonisolated struct DeleteAccountResponse: Decodable {
    let deleted: Bool
}

enum UserAPI {
    static func deleteAccount() async throws -> DeleteAccountResponse {
        try await APIClient.shared.delete("/api/v1/users/me")
    }
}
