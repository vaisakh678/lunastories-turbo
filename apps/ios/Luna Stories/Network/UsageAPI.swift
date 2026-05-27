//
//  UsageAPI.swift
//  Luna Stories
//

import Foundation

/// Mirrors GenerationUsageDTO — weekly quota for one kind of generation.
nonisolated struct GenerationUsage: Decodable {
    let message: String
    let used: Int
    let total: Int
    let remaining: Int
    let percentUsed: Int
    let resetsAt: String
}

/// Mirrors UsageSummaryDTO — both quotas at once (GET /usage).
nonisolated struct UsageSummary: Decodable {
    let stories: GenerationUsage
    let audio: GenerationUsage
}

enum UsageAPI {
    static func fetch() async throws -> UsageSummary {
        try await APIClient.shared.get("/api/v1/usage")
    }
}
