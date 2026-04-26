//
//  Config.swift
//  Milo Tales
//
//  Reads per-environment values that the active xcconfig sets as build settings,
//  which Info.plist references via `$(NAME)` substitution.
//
//  Both the type and the property are marked `nonisolated` because the project
//  has `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor`, which would otherwise force
//  @MainActor isolation and break synchronous reads from `actor` consumers
//  (APIClient).
//

import Foundation

nonisolated enum Config {
    /// Base URL of the API, e.g. `http://localhost:3001`. Path callers
    /// (e.g. `APIClient.get("/api/v1/avatars")`) include `/api/v1` themselves.
    nonisolated static var apiBaseURL: String {
        guard let value = Bundle.main.infoDictionary?["API_BASE_URL"] as? String,
              !value.isEmpty else {
            fatalError("Missing API_BASE_URL — check that the active build configuration links a Config/*.xcconfig and that Info.plist references $(API_BASE_URL)")
        }
        return value
    }
}
