//
//  ProfileViewModel.swift
//  Luna Stories
//
//  Loads and caches the signed-in user's backend profile (internal user
//  id, name, email). Owned at app scope so any screen can read it via
//  @Environment, and so OneSignal stays logged in with the *backend* id
//  rather than the Clerk id.
//

import Foundation
import Observation

@Observable
@MainActor
final class ProfileViewModel {
    private(set) var profile: UserProfileResponse?
    private(set) var isLoading: Bool = false
    var errorMessage: String?

    /// Fetch from the backend. No-op if a load is already in flight.
    func load() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            profile = try await UserAPI.me()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }

    /// Wipe local state on sign-out.
    func clear() {
        profile = nil
        errorMessage = nil
    }
}
