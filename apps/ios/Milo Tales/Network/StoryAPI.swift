//
//  StoryAPI.swift
//  Milo Tales
//

import Foundation

nonisolated indirect enum AnyJSON: Encodable {
    case string(String)
    case int(Int)
    case double(Double)
    case bool(Bool)
    case null
    case array([AnyJSON])
    case object([String: AnyJSON])

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .string(let s): try c.encode(s)
        case .int(let i): try c.encode(i)
        case .double(let d): try c.encode(d)
        case .bool(let b): try c.encode(b)
        case .null: try c.encodeNil()
        case .array(let a): try c.encode(a)
        case .object(let o): try c.encode(o)
        }
    }
}

nonisolated struct StoryInputPayload {
    let modeKey: String
    let input: AnyJSON
}

nonisolated enum StoryStatus: String, Decodable {
    case pending
    case generating
    case ready
    case failed

    var displayText: String {
        switch self {
        case .pending: "Queued…"
        case .generating: "Generating…"
        case .ready: "Ready"
        case .failed: "Failed"
        }
    }
}

nonisolated struct CreateStoryRequest: Encodable {
    let modeKey: String
    let characterIds: [String]
    let input: AnyJSON
}

nonisolated enum StoryBlock: Decodable {
    case text(String)
    case illustration(symbolName: String, tint: String)

    private enum CodingKeys: String, CodingKey {
        case kind, text, symbolName, tint
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try c.decode(String.self, forKey: .kind)
        switch kind {
        case "text":
            self = .text(try c.decode(String.self, forKey: .text))
        case "illustration":
            self = .illustration(
                symbolName: try c.decode(String.self, forKey: .symbolName),
                tint: try c.decode(String.self, forKey: .tint)
            )
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .kind,
                in: c,
                debugDescription: "Unknown story block kind: \(kind)"
            )
        }
    }
}

nonisolated struct StoryContent: Decodable {
    let blocks: [StoryBlock]
}

nonisolated struct StoryResponse: Decodable, Identifiable {
    let id: String
    let status: StoryStatus
    let modeKey: String
    let title: String?
    let summary: String?
    let coverSymbol: String?
    let coverTint: String?
    let durationSeconds: Int?
    let createdAt: String
    let updatedAt: String

    // Detail-only (absent in list responses)
    let characterIds: [String]?
    let bodyText: String?
    let content: StoryContent?
    let audioUrl: String?
    let errorMessage: String?
}

nonisolated struct StoryPage: Decodable {
    let items: [StoryResponse]
    let nextCursor: String?
}

enum StoryAPI {
    static func create(_ request: CreateStoryRequest) async throws -> StoryResponse {
        try await APIClient.shared.post("/api/v1/stories", body: request)
    }

    static func list(cursor: String? = nil, limit: Int = 30) async throws -> StoryPage {
        var params = ["limit=\(limit)"]
        if let cursor { params.append("cursor=\(cursor)") }
        let qs = params.joined(separator: "&")
        return try await APIClient.shared.get("/api/v1/stories?\(qs)")
    }

    static func get(_ id: String) async throws -> StoryResponse {
        try await APIClient.shared.get("/api/v1/stories/\(id)")
    }

    static func generateAudio(_ id: String) async throws -> StoryResponse {
        try await APIClient.shared.post(
            "/api/v1/stories/\(id)/audio",
            body: EmptyBody()
        )
    }
}

private nonisolated struct EmptyBody: Encodable {}
