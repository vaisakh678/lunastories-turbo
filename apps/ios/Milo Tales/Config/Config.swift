//
//  Config.swift
//  Milo Tales
//
//  Reads per-environment values that xcconfig injects into the bundle's Info.plist
//  via `INFOPLIST_KEY_<Name>` build settings. See Config/*.xcconfig for the values
//  per environment, and the Xcode build configurations (Local / Dev / Prod) for
//  which xcconfig is active.
//

import Foundation

enum Config {
    /// Base URL of the API, e.g. `http://localhost:3001` or `https://dev-api.milotales.com`.
    /// Path callers (e.g. `APIClient.get("/api/v1/avatars")`) include `/api/v1` themselves.
    static let apiBaseURL: String = {
        guard let value = Bundle.main.infoDictionary?["API_BASE_URL"] as? String,
              !value.isEmpty else {
            fatalError("Missing API_BASE_URL — check that the active build configuration links a Config/*.xcconfig")
        }
        return value
    }()
}
