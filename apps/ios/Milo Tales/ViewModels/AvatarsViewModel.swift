//
//  AvatarsViewModel.swift
//  Milo Tales
//

import Foundation
import Observation

@Observable
@MainActor
final class AvatarsViewModel {
    private(set) var avatars: [AvatarResponse] = []
    private(set) var isLoading: Bool = false
    var errorMessage: String?

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            avatars = try await AvatarAPI.list()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }

    func avatar(byId id: String) -> AvatarResponse? {
        avatars.first { $0.id == id }
    }
}
