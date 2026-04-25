//
//  FeedbackAPI.swift
//  Milo Tales
//

import Foundation

nonisolated enum FeedbackCategory: String, Codable, CaseIterable, Identifiable {
    case bug
    case idea
    case praise
    case other

    var id: String { rawValue }

    var label: String {
        switch self {
        case .bug: "Bug"
        case .idea: "Idea"
        case .praise: "Praise"
        case .other: "Other"
        }
    }

    var symbol: String {
        switch self {
        case .bug: "ant.fill"
        case .idea: "lightbulb.fill"
        case .praise: "heart.fill"
        case .other: "ellipsis.circle.fill"
        }
    }
}

nonisolated struct CreateFeedbackRequest: Encodable {
    let category: FeedbackCategory
    let message: String
    let rating: Int?
}

nonisolated struct FeedbackResponse: Decodable {
    let id: String
    let category: FeedbackCategory
    let message: String
    let rating: Int?
    let createdAt: String
}

enum FeedbackAPI {
    static func send(_ request: CreateFeedbackRequest) async throws -> FeedbackResponse {
        try await APIClient.shared.post("/api/v1/feedback", body: request)
    }
}
