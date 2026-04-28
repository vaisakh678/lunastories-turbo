//
//  APIClient.swift
//  Luna Stories
//

import Foundation
import ClerkKit

enum APIError: Error, LocalizedError {
    case invalidResponse
    case unauthorized
    case server(message: String)
    case decoding(Error)
    case transport(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse: "The server returned an unexpected response."
        case .unauthorized: "Please sign in again."
        case .server(let message): message
        case .decoding(let error): "Couldn't read the response: \(error.localizedDescription)"
        case .transport(let error): error.localizedDescription
        }
    }
}

private nonisolated struct APIEnvelope<T: Decodable>: Decodable {
    let data: T?
    let message: String?
    let error: String?
}

actor APIClient {
    static let shared = APIClient()

    private let baseURL = URL(string: Config.apiBaseURL)!
    private let session: URLSession = .shared

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        return e
    }()

    func get<T: Decodable>(_ path: String, as type: T.Type = T.self) async throws -> T {
        try await request(path: path, method: "GET", body: nil)
    }

    func post<Body: Encodable, T: Decodable>(
        _ path: String,
        body: Body,
        as type: T.Type = T.self
    ) async throws -> T {
        let data = try encoder.encode(body)
        return try await request(path: path, method: "POST", body: data)
    }

    func patch<Body: Encodable, T: Decodable>(
        _ path: String,
        body: Body,
        as type: T.Type = T.self
    ) async throws -> T {
        let data = try encoder.encode(body)
        return try await request(path: path, method: "PATCH", body: data)
    }

    func delete<T: Decodable>(_ path: String, as type: T.Type = T.self) async throws -> T {
        try await request(path: path, method: "DELETE", body: nil)
    }

    private func request<T: Decodable>(
        path: String,
        method: String,
        body: Data?
    ) async throws -> T {
        guard let url = URL(string: baseURL.absoluteString + path) else {
            throw APIError.invalidResponse
        }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        req.httpBody = body

        do {
            if let token = try await Clerk.shared.auth.getToken() {
                req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                #if DEBUG
                print("[API] \(method) \(path) → attached token (\(token.prefix(20))…)")
                #endif
            } else {
                #if DEBUG
                print("[API] \(method) \(path) → NO token (no active session)")
                #endif
            }
        } catch {
            #if DEBUG
            print("[API] \(method) \(path) → token fetch threw: \(error.localizedDescription)")
            #endif
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.transport(error)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if http.statusCode == 401 { throw APIError.unauthorized }

        let envelope: APIEnvelope<T>
        do {
            envelope = try decoder.decode(APIEnvelope<T>.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }

        if let serverError = envelope.error {
            throw APIError.server(message: serverError)
        }
        guard let payload = envelope.data else {
            throw APIError.invalidResponse
        }
        return payload
    }
}
