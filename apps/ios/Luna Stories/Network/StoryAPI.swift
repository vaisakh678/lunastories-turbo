//
//  StoryAPI.swift
//  Luna Stories
//

import Foundation

nonisolated struct FileRefResponse: Codable, Hashable {
    let fileId: String
    let key: String
    let url: String
}

/// One of the story's characters, for the cover collage. Mirrors CoverIconDTO.
nonisolated struct CoverIcon: Codable, Hashable {
    let symbolName: String
    let tint: String
}

nonisolated indirect enum AnyJSON: Codable {
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

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() {
            self = .null
        } else if let b = try? c.decode(Bool.self) {
            self = .bool(b)
        } else if let i = try? c.decode(Int.self) {
            self = .int(i)
        } else if let d = try? c.decode(Double.self) {
            self = .double(d)
        } else if let s = try? c.decode(String.self) {
            self = .string(s)
        } else if let a = try? c.decode([AnyJSON].self) {
            self = .array(a)
        } else if let o = try? c.decode([String: AnyJSON].self) {
            self = .object(o)
        } else {
            throw DecodingError.dataCorruptedError(
                in: c,
                debugDescription: "Unsupported JSON value"
            )
        }
    }
}

nonisolated struct StoryInputPayload {
    let modeKey: String
    let input: AnyJSON
}

nonisolated enum StoryStatus: String, Codable {
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

nonisolated enum StoryBlock: Codable {
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

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .text(let text):
            try c.encode("text", forKey: .kind)
            try c.encode(text, forKey: .text)
        case .illustration(let symbolName, let tint):
            try c.encode("illustration", forKey: .kind)
            try c.encode(symbolName, forKey: .symbolName)
            try c.encode(tint, forKey: .tint)
        }
    }
}

nonisolated struct StoryContent: Codable {
    let blocks: [StoryBlock]
}

nonisolated struct StoryResponse: Codable, Identifiable {
    let id: String
    let status: StoryStatus
    let modeKey: String
    let title: String?
    let summary: String?
    let coverSymbol: String?
    let coverTint: String?
    let coverIcons: [CoverIcon]?
    let durationSeconds: Int?
    let lastReadAt: String?
    let createdAt: String
    let updatedAt: String

    // Detail-only (absent in list responses)
    let characterIds: [String]?
    let bodyText: String?
    let content: StoryContent?
    let audio: FileRefResponse?
    let errorMessage: String?
    let generationInput: AnyJSON?
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

    /// The single most recent story that should drive the home banner —
    /// either still being generated, or ready but not yet read. Anything
    /// older than 48h, already read, or failed is filtered out by the
    /// server. Returns nil when there's nothing actionable.
    static func latestActive() async throws -> StoryResponse? {
        let wrapper: LatestActiveWrapper = try await APIClient.shared.get(
            "/api/v1/stories/latest-active"
        )
        return wrapper.story
    }

    static func generateAudio(_ id: String) async throws -> StoryResponse {
        try await APIClient.shared.post(
            "/api/v1/stories/\(id)/audio",
            body: EmptyBody()
        )
    }

    /// Stamp the story as opened. Idempotent on the backend — calling it
    /// for an already-read story is a no-op (returns the original
    /// `lastReadAt`). Safe to fire on every reader appearance.
    @discardableResult
    static func markAsRead(_ id: String) async throws -> MarkAsReadResponse {
        try await APIClient.shared.post(
            "/api/v1/stories/\(id)/read",
            body: EmptyBody()
        )
    }
}

nonisolated struct MarkAsReadResponse: Decodable {
    let id: String
    let lastReadAt: String
}

private nonisolated struct LatestActiveWrapper: Decodable {
    let story: StoryResponse?
}

private nonisolated struct EmptyBody: Encodable {}
